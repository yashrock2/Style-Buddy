import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, useFBX } from "@react-three/drei";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import * as THREE from "three";

const MODEL_PATH = "/models/avatar%20(1)/avatar/model.fbx";
const OUTFIT_INTERVAL_MS = 3000;

const OUTFITS = [
  { name: "Original",      shirt: "#f4f4f4", pants: "#2f4a7a", shoes: "#a8672f" },
  { name: "Black street",  shirt: "#1c1c1f", pants: "#2b2d33", shoes: "#f2f2f2" },
  { name: "Olive & sand",  shirt: "#6b7550", pants: "#cdbf9f", shoes: "#e9e4d8" },
  { name: "Wine & grey",   shirt: "#6e1d33", pants: "#4a4d55", shoes: "#151515" },
  { name: "Sky & navy",    shirt: "#9ec5e6", pants: "#1d2b4f", shoes: "#f5f5f5" },
  { name: "Mustard & ink", shirt: "#d8a62b", pants: "#1b1f2a", shoes: "#3a2a1c" },
  { name: "Sage linen",    shirt: "#c9d6c0", pants: "#8a7a62", shoes: "#d9d2c3" },
];

const SKIP_MESH = /hair|eye|teeth|tooth|lash|brow|beard|tongue|head|face|skin|nail/i;

// ---------------------------------------------------------------
// Pose helpers
// ---------------------------------------------------------------
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

// 0 = bone->target already points exactly along `want`
function dirError(bone, target, want) {
  bone.updateWorldMatrix(true, true);
  _a.setFromMatrixPosition(bone.matrixWorld);
  _b.setFromMatrixPosition(target.matrixWorld).sub(_a).normalize();
  return 1 - _b.dot(want);
}

// Aim `bone` so that (bone -> target) points along a desired world direction.
// Step 1: exact maths (repeated). Step 2: numeric search if step 1 didn't land.
function aimBone(bone, target, desiredWorldDir, iterations = 4) {
  if (!bone || !target || !bone.parent) return 0;

  bone.matrixAutoUpdate = true;
  const want = desiredWorldDir.clone().normalize();
  const parentQ = new THREE.Quaternion();

  for (let i = 0; i < iterations; i++) {
    bone.updateWorldMatrix(true, true);
    const bonePos = new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld);
    const targetPos = new THREE.Vector3().setFromMatrixPosition(target.matrixWorld);
    const current = targetPos.sub(bonePos).normalize();
    const delta = new THREE.Quaternion().setFromUnitVectors(current, want);

    bone.parent.getWorldQuaternion(parentQ);
    const localDelta = parentQ.clone().invert().multiply(delta).multiply(parentQ);

    bone.quaternion.premultiply(localDelta);
    bone.updateMatrix();
    bone.updateMatrixWorld(true);
  }

  let err = dirError(bone, target, want);

  // Fallback: try small rotations around each local axis until it matches
  if (err > 0.002) {
    const axes = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];
    let step = 0.4;
    for (let n = 0; n < 80 && err > 0.0005; n++) {
      let improved = false;
      for (const axis of axes) {
        for (const sign of [1, -1]) {
          const saved = bone.quaternion.clone();
          bone.quaternion.multiply(
            new THREE.Quaternion().setFromAxisAngle(axis, sign * step)
          );
          const e = dirError(bone, target, want);
          if (e < err) {
            err = e;
            improved = true;
          } else {
            bone.quaternion.copy(saved);
          }
        }
      }
      if (!improved) step *= 0.5;
    }
    bone.updateMatrixWorld(true);
  }

  return err;
}

const isAncestor = (maybeAncestor, node) => {
  let p = node.parent;
  while (p) {
    if (p === maybeAncestor) return true;
    p = p.parent;
  }
  return false;
};

function CharacterModel() {
  const fbx = useFBX(MODEL_PATH);
  const { gl } = useThree();

  const group = useRef();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const bonesRef = useRef({});
  const headBase = useRef(null);
  const headOffset = useRef({ x: 0, y: 0 });
  const outfitIndex = useRef(0);
  const spin = useRef({ active: false, lastX: 0, yaw: 0, velocity: 0 });

  const outfitUniforms = useRef({
    uShirt: { value: new THREE.Color(OUTFITS[0].shirt) },
    uPants: { value: new THREE.Color(OUTFITS[0].pants) },
    uShoes: { value: new THREE.Color(OUTFITS[0].shoes) },
    uMinY: { value: 0 },
    uRange: { value: 1 },
  });

  const targets = useRef({
    uShirt: new THREE.Color(OUTFITS[0].shirt),
    uPants: new THREE.Color(OUTFITS[0].pants),
    uShoes: new THREE.Color(OUTFITS[0].shoes),
  });

  const model = useMemo(() => {
    const character = clone(fbx);
    character.updateMatrixWorld(true);

    // ---------- Pose: arms down, relaxed ----------
    const bones = {};
    const lower = {};
    character.traverse((o) => {
      if (o.isBone) {
        bones[o.name] = o;
        lower[o.name.replace(/^mixamorig[:_]?/i, "").toLowerCase()] = o;
      }
    });
    bonesRef.current = bones;
    const B = (name) => lower[name.toLowerCase()];

    const centerBone = B("Hips") || B("Spine");
    const centerX = centerBone
      ? new THREE.Vector3().setFromMatrixPosition(centerBone.matrixWorld).x
      : 0;

    const setupArm = (side, p) => {
      const fore = B(side + "ForeArm");
      const hand = B(side + "Hand");
      if (!fore || !hand) {
        console.warn(`ARM ${side}: forearm/hand bone missing`);
        return;
      }

      // The upper arm must be an ancestor of the forearm. If the name lookup
      // doesn't give that, use the forearm's real parent bone instead.
      let arm = B(side + "Arm");
      if (!arm || !isAncestor(arm, fore)) {
        console.warn(
          `ARM ${side}: "${arm ? arm.name : "none"}" is not above the forearm, using parent "${fore.parent?.name}"`
        );
        arm = fore.parent;
      }
      if (!arm) return;

      const middle = B(side + "HandMiddle1") || B(side + "HandIndex1");

      // +1 = this arm is on the +X side of the body, -1 = on the -X side
      const armX = new THREE.Vector3().setFromMatrixPosition(arm.matrixWorld).x;
      const s = armX >= centerX ? 1 : -1;

      // Collarbone: drop slightly so the shoulder isn't raised
      const shoulder = B(side + "Shoulder");
      if (shoulder && shoulder !== arm && isAncestor(shoulder, arm)) {
        aimBone(shoulder, arm, new THREE.Vector3(s * 1, -0.2, 0));
      }

      const e1 = aimBone(arm, fore, new THREE.Vector3(s * p.armOut, -1, p.armFwd));
      const e2 = aimBone(fore, hand, new THREE.Vector3(-s * p.foreIn, -0.9, p.foreFwd));
      const e3 = middle
        ? aimBone(hand, middle, new THREE.Vector3(-s * p.handIn, -1, p.handFwd))
        : 0;

      // Check: where did each segment end up?
      character.updateMatrixWorld(true);
      const P = (b) => new THREE.Vector3().setFromMatrixPosition(b.matrixWorld);
      const r = (v) => v.normalize().toArray().map((n) => +n.toFixed(2));
      console.log(
        `ARM ${side} | arm bone: ${arm.name} | upper: ${JSON.stringify(r(P(fore).sub(P(arm))))}` +
          ` | fore: ${JSON.stringify(r(P(hand).sub(P(fore))))}` +
          ` | errors: ${[e1, e2, e3].map((x) => +x.toFixed(4)).join(", ")}`
      );
    };

    setupArm("Left",  { armOut: 0.14, armFwd: 0.02, foreIn: 0.02, foreFwd: 0.35, handIn: 0.05, handFwd: 0.18 });
    setupArm("Right", { armOut: 0.17, armFwd: 0.04, foreIn: 0.0,  foreFwd: 0.42, handIn: 0.08, handFwd: 0.22 });

    if (bones.Head) bones.Head.rotation.z += 0.04;
    if (bones.Neck) bones.Neck.rotation.x += 0.02;

    const headBone = bones.Head || bones.Head1;
    if (headBone) headBase.current = headBone.rotation.clone();

    character.updateMatrixWorld(true);

    // ---------- Body height range ----------
    let minY = Infinity;
    let maxY = -Infinity;
    character.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;
      child.geometry.computeBoundingBox();
      const bb = child.geometry.boundingBox;
      minY = Math.min(minY, bb.min.y);
      maxY = Math.max(maxY, bb.max.y);
    });
    outfitUniforms.current.uMinY.value = minY;
    outfitUniforms.current.uRange.value = Math.max(maxY - minY, 0.0001);

    // ---------- Outfit shader injection ----------
    character.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const list = Array.isArray(child.material) ? child.material : [child.material];
      const cloned = list.map((m) => m.clone());
      child.material = Array.isArray(child.material) ? cloned : cloned[0];

      cloned.forEach((mat) => {
        const label = `${child.name} ${mat.name || ""}`;
        if (SKIP_MESH.test(label)) return;

        mat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, outfitUniforms.current);

          shader.vertexShader = shader.vertexShader
            .replace(
              "#include <common>",
              `#include <common>
               uniform float uMinY;
               uniform float uRange;
               varying float vH;`
            )
            .replace(
              "#include <begin_vertex>",
              `#include <begin_vertex>
               vH = (position.y - uMinY) / uRange;`
            );

          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              `#include <common>
               uniform vec3 uShirt;
               uniform vec3 uPants;
               uniform vec3 uShoes;
               varying float vH;`
            )
            .replace(
              "#include <map_fragment>",
              `#include <map_fragment>
               {
                 vec3 c = diffuseColor.rgb;
                 float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
                 float mx = max(c.r, max(c.g, c.b));
                 float mn = min(c.r, min(c.g, c.b));
                 float sat = (mx - mn) / max(mx, 0.0001);

                 bool skin = vH >= 0.07 && c.r > c.b * 1.25 && c.r > c.g * 1.05 && lum > 0.03 && sat > 0.25;

                 if (vH < 0.86 && !skin) {
                   vec3 target;
                   if (vH < 0.07)      target = uShoes;
                   else if (vH < 0.50) target = uPants;
                   else                target = uShirt;

                   float shade = 0.85 + 0.3 * clamp(lum * 3.0, 0.0, 1.0);
                   diffuseColor.rgb = target * shade;
                 }
               }`
            );
        };

        mat.customProgramCacheKey = () => "login-outfit-recolour-v1";
        mat.needsUpdate = true;
      });
    });

    // ---------- Scale & position ----------
    const box = new THREE.Box3().setFromObject(character);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const scale = 3.15 / size.y;
    character.scale.setScalar(scale);
    character.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

    return character;
  }, [fbx]);

  // ---------- Switch outfit every 3 seconds ----------
  useEffect(() => {
    const id = setInterval(() => {
      outfitIndex.current = (outfitIndex.current + 1) % OUTFITS.length;
      const o = OUTFITS[outfitIndex.current];
      targets.current.uShirt.set(o.shirt);
      targets.current.uPants.set(o.pants);
      targets.current.uShoes.set(o.shoes);
    }, OUTFIT_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // ---------- Mouse follow + drag-to-rotate ----------
  useEffect(() => {
    const el = gl.domElement;
    const s = spin.current;
    el.style.cursor = "grab";
    el.style.touchAction = "none";

    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onDown = (e) => {
      s.active = true;
      s.lastX = e.clientX;
      s.velocity = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };

    const onDrag = (e) => {
      if (!s.active) return;
      const dx = e.clientX - s.lastX;
      s.lastX = e.clientX;
      s.yaw += dx * 0.012;
      s.velocity = dx * 0.012;
    };

    const onUp = (e) => {
      s.active = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };

    const onDouble = () => {
      s.velocity = 0;
      s.yaw = Math.round(s.yaw / (Math.PI * 2)) * Math.PI * 2;
    };

    window.addEventListener("mousemove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onDrag);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("dblclick", onDouble);

    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onDrag);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("dblclick", onDouble);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      const s = spin.current;

      if (!s.active) {
        s.yaw += s.velocity;
        s.velocity *= 0.94;
      }

      group.current.rotation.order = "YXZ";

      const targetY = s.yaw + pointer.current.x * 0.45;
      const targetX = -pointer.current.y * 0.08;

      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.14);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.12);
      group.current.rotation.z = Math.sin(t * 0.5) * 0.008;

      group.current.position.y = -1.55 + Math.sin(t * 1.1) * 0.012;
    }

    const headBone = bonesRef.current.Head || bonesRef.current.Head1;
    if (headBone && headBase.current) {
      headOffset.current.y = THREE.MathUtils.damp(headOffset.current.y, pointer.current.x * 0.16, 4, delta);
      headOffset.current.x = THREE.MathUtils.damp(headOffset.current.x, -pointer.current.y * 0.07, 4, delta);
      headBone.rotation.x = headBase.current.x + headOffset.current.x;
      headBone.rotation.y = headBase.current.y + headOffset.current.y;
      headBone.rotation.z = headBase.current.z;
    }

    const chest = bonesRef.current.Spine2 || bonesRef.current.Spine1;
    if (chest) chest.scale.setScalar(1 + Math.sin(t * 1.6) * 0.006);

    const u = outfitUniforms.current;
    const tg = targets.current;
    u.uShirt.value.lerp(tg.uShirt, 0.08);
    u.uPants.value.lerp(tg.uPants, 0.08);
    u.uShoes.value.lerp(tg.uShoes, 0.08);
  });

  return (
    <group ref={group} position={[0, -1.55, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function AuthCharacterExperience() {
  return (
    <Canvas
      camera={{ position: [0, 1.25, 6], fov: 34 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      shadows={{ type: THREE.PCFShadowMap }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[3, 5, 5]} intensity={2} castShadow />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} />

      <React.Suspense fallback={null}>
        <CharacterModel />
        <Environment preset="studio" />
        <ContactShadows
          position={[0, -1.58, 0]}
          opacity={0.28}
          scale={4}
          blur={2.5}
          far={4}
        />
      </React.Suspense>
    </Canvas>
  );
}