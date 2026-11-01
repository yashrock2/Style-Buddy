import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows, useFBX } from "@react-three/drei";
import { Suspense } from "react";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import * as THREE from "three";

const MODEL_PATH = "/models/avatar/avatar/model.fbx";
const OUTFIT_INTERVAL_MS = 3000;

// For casual looks with no jacket/tie, set jacket/tie to the same colour as the shirt.
const OUTFITS = [
  { name: "Classic suit",    jacket: "#111111", shirt: "#f5f5f5", tie: "#6b6b6b", pants: "#111111", shoes: "#1a1a1a" },
  { name: "Navy formal",     jacket: "#1b2a49", shirt: "#dfe9f5", tie: "#8c1c2b", pants: "#1b2a49", shoes: "#2b1d14" },
  { name: "Smart casual",    jacket: "#7aa5a0", shirt: "#7aa5a0", tie: "#7aa5a0", pants: "#c9b89a", shoes: "#e8e4dc" },
  { name: "Linen relaxed",   jacket: "#efe6d2", shirt: "#efe6d2", tie: "#efe6d2", pants: "#8a7a62", shoes: "#d9d2c3" },
  { name: "Charcoal & wine", jacket: "#2e2e33", shirt: "#f0e6e8", tie: "#5a1830", pants: "#2e2e33", shoes: "#111111" },
  { name: "Olive street",    jacket: "#4a5238", shirt: "#e9e9e4", tie: "#e9e9e4", pants: "#22252b", shoes: "#f2f2f2" },
];

// Meshes that should never be recoloured (by name)
const SKIP_MESH = /hair|eye|teeth|tooth|lash|brow|beard|tongue|head|face|skin|nail/i;

function aimBone(bone, desiredWorldDir) {
  if (!bone || !bone.parent) return;
  const child = bone.children.find((c) => c.isBone);
  if (!child) return;

  bone.updateWorldMatrix(true, true);

  const bonePos = new THREE.Vector3().setFromMatrixPosition(bone.matrixWorld);
  const childPos = new THREE.Vector3().setFromMatrixPosition(child.matrixWorld);
  const currentDir = childPos.sub(bonePos).normalize();

  const targetDir = desiredWorldDir.clone().normalize();
  const delta = new THREE.Quaternion().setFromUnitVectors(currentDir, targetDir);

  const boneWorldQ = bone.getWorldQuaternion(new THREE.Quaternion());
  const parentWorldQ = bone.parent.getWorldQuaternion(new THREE.Quaternion());

  const newWorldQ = delta.multiply(boneWorldQ);
  bone.quaternion.copy(parentWorldQ.invert().multiply(newWorldQ));
  bone.updateMatrixWorld(true);
}

function curlFingers(character, side, amount = 0.28) {
  const sign = side === "Left" ? 1 : -1;
  character.traverse((o) => {
    if (!o.isBone || !o.name.includes(side + "Hand")) return;
    const n = o.name;
    const joint = parseInt(n.slice(-1), 10);
    if (isNaN(joint)) return;

    const isThumb = n.includes("Thumb");
    const isFinger = /Index|Middle|Ring|Pinky/.test(n);
    if (!isThumb && !isFinger) return;

    let k = amount;
    if (n.includes("Middle")) k *= 1.1;
    if (n.includes("Ring")) k *= 1.2;
    if (n.includes("Pinky")) k *= 1.3;
    if (isThumb) k *= 0.35;

    o.rotation.z += sign * k;
  });
}

function MaleStylist() {
  const group = useRef();
  const pointer = useRef(new THREE.Vector2(0, 0));
  const bonesRef = useRef({});
  const outfitIndex = useRef(0);

  // Drag-to-rotate state
  const { gl } = useThree();
  const spin = useRef({ active: false, lastX: 0, yaw: 0, velocity: 0 });

  // Shared uniforms: changing these recolours every clothing material at once
  const outfitUniforms = useRef({
    uJacket: { value: new THREE.Color(OUTFITS[0].jacket) },
    uShirt: { value: new THREE.Color(OUTFITS[0].shirt) },
    uTie: { value: new THREE.Color(OUTFITS[0].tie) },
    uPants: { value: new THREE.Color(OUTFITS[0].pants) },
    uShoes: { value: new THREE.Color(OUTFITS[0].shoes) },
    uMinY: { value: 0 },
    uRange: { value: 1 },
  });

  // Colours we fade toward
  const targets = useRef({
    uJacket: new THREE.Color(OUTFITS[0].jacket),
    uShirt: new THREE.Color(OUTFITS[0].shirt),
    uTie: new THREE.Color(OUTFITS[0].tie),
    uPants: new THREE.Color(OUTFITS[0].pants),
    uShoes: new THREE.Color(OUTFITS[0].shoes),
  });

  const fbx = useFBX(MODEL_PATH);

  const model = useMemo(() => {
    const character = clone(fbx);
    character.updateMatrixWorld(true);

    // ---------- Pose ----------
    const bones = {};
    character.traverse((o) => {
      if (o.isBone) bones[o.name] = o;
    });
    bonesRef.current = bones;

    const centerBone = bones.Hips || bones.Spine;
    const centerX = centerBone
      ? new THREE.Vector3().setFromMatrixPosition(centerBone.matrixWorld).x
      : 0;

    const sideOf = (b) => {
      if (!b) return 1;
      const x = new THREE.Vector3().setFromMatrixPosition(b.matrixWorld).x;
      return x >= centerX ? 1 : -1;
    };

    const setupArm = (names, p) => {
      const shoulder = bones[names.shoulder];
      const arm = bones[names.arm];
      const fore = bones[names.fore];
      const hand = bones[names.hand];
      if (!arm) return;

      const s = sideOf(arm);
      aimBone(shoulder, new THREE.Vector3(s * 1, -p.shoulderDrop, -0.05));
      aimBone(arm, new THREE.Vector3(s * p.armOut, -1, p.armFwd));
      aimBone(fore, new THREE.Vector3(-s * p.foreIn, -0.88, p.foreFwd));
      aimBone(hand, new THREE.Vector3(-s * p.handIn, -1, p.handFwd));
    };

    setupArm(
      { shoulder: "LeftShoulder", arm: "LeftArm", fore: "LeftForeArm", hand: "LeftHand" },
      { shoulderDrop: 0.22, armOut: 0.17, armFwd: 0.02, foreIn: 0.02, foreFwd: 0.42, handIn: 0.06, handFwd: 0.22 }
    );
    setupArm(
      { shoulder: "RightShoulder", arm: "RightArm", fore: "RightForeArm", hand: "RightHand" },
      { shoulderDrop: 0.18, armOut: 0.2, armFwd: 0.05, foreIn: 0.0, foreFwd: 0.5, handIn: 0.1, handFwd: 0.28 }
    );

    curlFingers(character, "Left", 0.26);
    curlFingers(character, "Right", 0.3);

    if (bones.Head) bones.Head.rotation.z += 0.04;
    if (bones.Neck) bones.Neck.rotation.x += 0.02;

    character.updateMatrixWorld(true);

    // ---------- Body height range (bind pose, mesh space) ----------
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
    const report = [];

    character.traverse((child) => {
      if (!child.isMesh) return;

      child.castShadow = true;
      child.receiveShadow = true;

      const list = Array.isArray(child.material) ? child.material : [child.material];
      const cloned = list.map((m) => m.clone());
      child.material = Array.isArray(child.material) ? cloned : cloned[0];

      cloned.forEach((mat) => {
        const label = `${child.name} ${mat.name || ""}`;
        const skip = SKIP_MESH.test(label);
        report.push({ mesh: child.name, material: mat.name, recoloured: !skip });
        if (skip) return;

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
               uniform vec3 uJacket;
               uniform vec3 uShirt;
               uniform vec3 uTie;
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

                 // skin-ish pixels (hands, neck) are left alone
                 bool skin = c.r > c.b * 1.25 && c.r > c.g * 1.05 && lum > 0.03 && sat > 0.25;

                 // everything above ~86% of the height is head/hair: leave alone
                 if (vH < 0.86 && !skin) {
                   vec3 target;
                   if (vH < 0.07)       target = uShoes;
                   else if (vH < 0.50)  target = uPants;
                   else if (lum > 0.45) target = uShirt;
                   else if (lum > 0.04 && sat < 0.35) target = uTie;
                   else                 target = uJacket;

                   // keep some of the original folds / shading
                   float shade = 0.85 + 0.3 * clamp(lum * 3.0, 0.0, 1.0);
                   diffuseColor.rgb = target * shade;
                 }
               }`
            );
        };

        mat.customProgramCacheKey = () => "outfit-recolour-v1";
        mat.needsUpdate = true;
      });
    });

    console.table(report);

    // ---------- Scale & position ----------
    const initialBox = new THREE.Box3().setFromObject(character);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    character.scale.setScalar(3.2 / initialSize.y);

    const box = new THREE.Box3().setFromObject(character);
    const center = box.getCenter(new THREE.Vector3());
    character.position.x -= center.x;
    character.position.z -= center.z;
    character.position.y -= box.min.y;

    return character;
  }, [fbx]);

  // ---------- Switch outfit every 3 seconds ----------
  useEffect(() => {
    const id = setInterval(() => {
      outfitIndex.current = (outfitIndex.current + 1) % OUTFITS.length;
      const o = OUTFITS[outfitIndex.current];
      targets.current.uJacket.set(o.jacket);
      targets.current.uShirt.set(o.shirt);
      targets.current.uTie.set(o.tie);
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

    // double-click: turn back to face the front
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

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      const s = spin.current;

      // keep spinning a little after release, then slow down
      if (!s.active) {
        s.yaw += s.velocity;
        s.velocity *= 0.94;
      }

      group.current.rotation.order = "YXZ"; // keeps tilt correct when he faces away

      // mouse-follow (wider range) + manual spin
      const targetY = s.yaw + pointer.current.x * 0.45;
      const targetX = -pointer.current.y * 0.08;

      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetY, 0.14);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetX, 0.12);
      group.current.rotation.z = Math.sin(t * 0.5) * 0.008;

      group.current.position.y = -1.55 + Math.sin(t * 1.2) * 0.012;
    }

    const chest = bonesRef.current.Spine2 || bonesRef.current.Spine1;
    if (chest) chest.scale.setScalar(1 + Math.sin(t * 1.6) * 0.006);

    // Smooth colour fade toward the current outfit
    const u = outfitUniforms.current;
    const tg = targets.current;
    u.uJacket.value.lerp(tg.uJacket, 0.08);
    u.uShirt.value.lerp(tg.uShirt, 0.08);
    u.uTie.value.lerp(tg.uTie, 0.08);
    u.uPants.value.lerp(tg.uPants, 0.08);
    u.uShoes.value.lerp(tg.uShoes, 0.08);
  });

  return (
    <group ref={group} position={[0.65, -1.55, 0]}>
      <primitive object={model} />
    </group>
  );
}

export default function StylistCharacter() {
  return (
    <div className="sb-character-canvas">
      <Canvas
        camera={{ position: [0, 1.2, 5.8], fov: 34 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        shadows={{ type: THREE.PCFShadowMap }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 5]} intensity={2.2} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={1.1} />

        <Suspense fallback={null}>
          <MaleStylist />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -1.58, 0]}
            opacity={0.28}
            scale={4}
            blur={2.5}
            far={4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}