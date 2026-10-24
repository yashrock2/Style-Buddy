import fs from "fs";
import path from "path";

const filePath = path.resolve(
  "backend/src/services/stylist.service.js"
);

console.log("Looking for:", filePath);

if (!fs.existsSync(filePath)) {
  console.error("");
  console.error("❌ File not found:");
  console.error(filePath);
  console.error("");
  console.error(
    "Check the location of stylist.service.js."
  );
  process.exit(1);
}

let code = fs.readFileSync(
  filePath,
  "utf8"
);


/* =========================================================
   BACKUP
   ========================================================= */

const backupPath =
  `${filePath}.backup-${Date.now()}`;

fs.writeFileSync(
  backupPath,
  code,
  "utf8"
);

console.log("");
console.log("✅ Backup created:");
console.log(backupPath);


/* =========================================================
   1. REPLACE NORMALIZE()
   ========================================================= */

const normalizeStart =
  code.indexOf("function normalize(value)");

if (normalizeStart === -1) {

  console.error(
    "❌ Could not find normalize()"
  );

  process.exit(1);
}

const normalizeEnd =
  code.indexOf(
    "\n}",
    normalizeStart
  );

if (normalizeEnd === -1) {

  console.error(
    "❌ Could not find the end of normalize()"
  );

  process.exit(1);
}

const newNormalize = `function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\\s+/g, " ")
    .replace(/\\btshirts?\\b/g, "t shirt")
    .replace(/\\btee shirts?\\b/g, "t shirt")
    .replace(/\\btees?\\b/g, "t shirt")
    .replace(/\\bshirts\\b/g, "shirt")
    .replace(/\\bjeans\\b/g, "jean")
    .replace(/\\btrousers\\b/g, "trouser")
    .replace(/\\bpants\\b/g, "pant")
    .replace(/\\bshorts\\b/g, "short")
    .replace(/\\bshoes\\b/g, "shoe")
    .replace(/\\bsneakers\\b/g, "sneaker")
    .replace(/\\bslippers\\b/g, "slipper")
    .replace(/\\bsandals\\b/g, "sandal")
    .replace(/\\bboots\\b/g, "boot")
    .replace(/\\bheels\\b/g, "heel")
    .replace(/\\bdresses\\b/g, "dress")
    .replace(/\\bhoodies\\b/g, "hoodie")
    .replace(/\\bsweatshirts\\b/g, "sweatshirt")
    .replace(/\\bpolos\\b/g, "polo")
    .replace(/\\bjackets\\b/g, "jacket")
    .replace(/\\bcoats\\b/g, "coat")
    .replace(/\\baccessories\\b/g, "accessory")
    .replace(/\\bwatches\\b/g, "watch")
    .replace(/\\bbags\\b/g, "bag")
    .replace(/\\bbelts\\b/g, "belt")
    .replace(/\\bcaps\\b/g, "cap")
    .replace(/\\bhats\\b/g, "hat")
    .replace(/\\s+/g, " ")
    .trim();
}`;

code =
  code.slice(0, normalizeStart) +
  newNormalize +
  code.slice(normalizeEnd + 2);


/* =========================================================
   2. FIND findSelectedWardrobeItem()
   ========================================================= */

const selectedStart =
  code.indexOf(
    "export function findSelectedWardrobeItem("
  );

if (selectedStart === -1) {

  console.error("");
  console.error(
    "❌ Could not find findSelectedWardrobeItem()."
  );

  console.error("");
  console.error(
    "The file structure is different from the uploaded version."
  );

  process.exit(1);
}


/* =========================================================
   FIND THE NEXT SECTION AFTER THE FUNCTION
   ========================================================= */

const nextSection =
  code.indexOf(
    "/* =========================================================",
    selectedStart + 50
  );

if (nextSection === -1) {

  console.error(
    "❌ Could not find the next section after findSelectedWardrobeItem()."
  );

  process.exit(1);
}


/* =========================================================
   NEW findSelectedWardrobeItem()
   ========================================================= */

const newSelectedItemFunction = `export function findSelectedWardrobeItem(
  closetItems = [],
  message = ""
) {
  const query = normalize(message);

  if (!query || !Array.isArray(closetItems)) {
    return null;
  }

  /*
   * Convert the user's message into searchable words.
   */
  const queryWords = new Set(
    query
      .split(/\\s+/)
      .filter((word) => word.length >= 3)
  );


  /* =======================================================
     COLOR MATCH
     ======================================================= */

  const colorMatchesQuery = (item) => {

    const color = getItemColor(item);

    if (!color) {
      return false;
    }

    /*
     * Example:
     *
     * User:
     * "blue t shirt"
     *
     * Closet:
     * color = "blue"
     */

    if (query.includes(color)) {
      return true;
    }

    /*
     * Multi-word colors.
     *
     * Example:
     * "navy blue"
     */

    const colorWords = color
      .split(/\\s+/)
      .filter(
        (word) => word.length >= 3
      );

    return colorWords.some(
      (word) =>
        queryWords.has(word)
    );
  };


  /* =======================================================
     ARTICLE TYPE MATCH
     ======================================================= */

  const articleMatchesQuery = (item) => {

    const article =
      getArticleType(item);

    if (!article) {
      return false;
    }

    const articleWords = article
      .split(/\\s+/)
      .filter(
        (word) => word.length >= 3
      );

    if (!articleWords.length) {
      return false;
    }

    return articleWords.some(
      (word) =>
        query.includes(word) ||
        queryWords.has(word)
    );
  };


  /* =======================================================
     1. COLOR + ARTICLE TYPE
     ======================================================= */

  const strongMatches =
    closetItems.filter(
      (item) =>
        colorMatchesQuery(item) &&
        articleMatchesQuery(item)
    );


  /*
   * Perfect situation:
   *
   * User:
   * "my blue T-shirt"
   *
   * Closet:
   * Blue + Tshirts
   *
   * Returns the actual database item.
   */

  if (strongMatches.length > 0) {
    return strongMatches[0];
  }


  /* =======================================================
     2. FULL ITEM TEXT MATCH
     ======================================================= */

  const exactTextMatches =
    closetItems.filter(
      (item) => {

        const itemText =
          normalize(
            getItemText(item)
          );

        if (!itemText) {
          return false;
        }

        /*
         * Instead of comparing the entire sentence,
         * look for meaningful item words.
         */

        const meaningfulWords =
          query
            .split(/\\s+/)
            .filter(
              (word) =>
                word.length >= 3
            );

        if (!meaningfulWords.length) {
          return false;
        }

        /*
         * At least two meaningful words should
         * appear in the wardrobe item's description.
         *
         * This prevents words such as "create",
         * "college", "outfit", etc. from causing
         * accidental matches.
         */

        const matchingWords =
          meaningfulWords.filter(
            (word) =>
              itemText.includes(word)
          );

        return (
          matchingWords.length >=
          Math.min(
            2,
            meaningfulWords.length
          )
        );
      }
    );


  if (exactTextMatches.length > 0) {
    return exactTextMatches[0];
  }


  /* =======================================================
     3. ARTICLE TYPE ONLY
     ======================================================= */

  const articleMatches =
    closetItems.filter(
      (item) =>
        articleMatchesQuery(item)
    );


  /*
   * Only automatically select it when there is
   * exactly one item of that article type.
   *
   * This prevents us from randomly choosing between
   * multiple jeans/shirts/etc.
   */

  if (articleMatches.length === 1) {
    return articleMatches[0];
  }


  /*
   * Not enough information to safely determine
   * which wardrobe item the user meant.
   */

  return null;
}
`;


/* =========================================================
   REPLACE THE OLD FUNCTION
   ========================================================= */

code =
  code.slice(0, selectedStart) +
  newSelectedItemFunction +
  "\n\n" +
  code.slice(nextSection);


/* =========================================================
   SAVE
   ========================================================= */

fs.writeFileSync(
  filePath,
  code,
  "utf8"
);


/* =========================================================
   SUCCESS
   ========================================================= */

console.log("");
console.log("==============================================");
console.log("✅ STYLEBUDDY SERVICE UPDATED");
console.log("==============================================");
console.log("");
console.log("Updated file:");
console.log(filePath);
console.log("");
console.log("Fixed:");
console.log("✅ T-shirt / Tshirts matching");
console.log("✅ T-shirt / T shirt matching");
console.log("✅ Jeans / jean matching");
console.log("✅ Shoes / shoe matching");
console.log("✅ Color matching");
console.log("✅ Article-type matching");
console.log("✅ Actual closet item matching");
console.log("");
console.log("Your original file was backed up.");
console.log("");
console.log("Now restart your Node backend.");
console.log("");