from pathlib import Path

from inference import analyze_clothing_image


# ============================================================
# TEST IMAGE FOLDER
# ============================================================

TEST_FOLDER = (
    Path(__file__).resolve().parent
    / "test_images"
)


SUPPORTED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".jfif",
    ".webp",
}


# ============================================================
# FIND ALL TEST IMAGES
# ============================================================

test_images = sorted(
    [
        file
        for file in TEST_FOLDER.iterdir()
        if file.is_file()
        and file.suffix.lower()
        in SUPPORTED_EXTENSIONS
    ]
)


if not test_images:

    print()
    print("=" * 70)
    print("NO TEST IMAGES FOUND")
    print("=" * 70)
    print()
    print(
        f"Put your images inside:\n{TEST_FOLDER}"
    )
    print()

    raise SystemExit


# ============================================================
# RUN ALL IMAGES
# ============================================================

print()
print("=" * 70)
print("STYLEBUDDY — FIVE MODEL TEST")
print("=" * 70)

print()
print(
    f"Found {len(test_images)} test images."
)

print()


for number, image_path in enumerate(
    test_images,
    start=1,
):

    print()
    print("=" * 70)
    print(
        f"IMAGE {number}: {image_path.name}"
    )
    print("=" * 70)

    try:

        result = analyze_clothing_image(
            image_path
        )

        # ----------------------------------------------------
        # CATEGORY
        # ----------------------------------------------------

        category = result["category"]

        print()
        print("CATEGORY")
        print(
            f"  Prediction : "
            f"{category['value']}"
        )
        print(
            f"  Confidence : "
            f"{category['confidencePercent']}%"
        )

        print("  Top 3:")

        for item in category["top3"]:

            print(
                f"    - {item['label']}: "
                f"{item['confidence']}%"
            )

        # ----------------------------------------------------
        # ARTICLE TYPE
        # ----------------------------------------------------

        article = result["articleType"]

        print()
        print("ARTICLE TYPE")
        print(
            f"  Prediction : "
            f"{article['value']}"
        )
        print(
            f"  Confidence : "
            f"{article['confidencePercent']}%"
        )
        print(
            f"  Source     : "
            f"{article['resolutionSource']}"
        )
        print(
            f"  Confirm?   : "
            f"{article['needsConfirmation']}"
        )

        print("  Top 3:")

        for item in article["top3"]:

            print(
                f"    - {item['label']}: "
                f"{item['confidence']}%"
            )

        # ----------------------------------------------------
        # COLOR
        # ----------------------------------------------------

        color = result["color"]

        print()
        print("COLOR")
        print(
            f"  Prediction : "
            f"{color['value']}"
        )
        print(
            f"  Confidence : "
            f"{color['confidencePercent']}%"
        )

        print("  Top 3:")

        for item in color["top3"]:

            print(
                f"    - {item['label']}: "
                f"{item['confidence']}%"
            )

        # ----------------------------------------------------
        # PATTERN
        # ----------------------------------------------------

        pattern = result["pattern"]

        print()
        print("PATTERN")
        print(
            f"  Prediction : "
            f"{pattern['value']}"
        )
        print(
            f"  Confidence : "
            f"{pattern['confidencePercent']}%"
        )
        print(
            f"  Mapping OK : "
            f"{pattern['labelMappingVerified']}"
        )

        print("  Top 3:")

        for item in pattern["top3"]:

            print(
                f"    - {item['label']}: "
                f"{item['confidence']}%"
            )

        # ----------------------------------------------------
        # FABRIC
        # ----------------------------------------------------

        fabric = result["fabric"]

        print()
        print("FABRIC")
        print(
            f"  Prediction : "
            f"{fabric['value']}"
        )
        print(
            f"  Confidence : "
            f"{fabric['confidencePercent']}%"
        )

        print("  Top 3:")

        for item in fabric["top3"]:

            print(
                f"    - {item['label']}: "
                f"{item['confidence']}%"
            )

        # ----------------------------------------------------
        # AI STATUS
        # ----------------------------------------------------

        status = result["aiStatus"]

        print()
        print("AI STATUS")
        print(
            f"  Success            : "
            f"{status['success']}"
        )
        print(
            f"  Needs confirmation : "
            f"{status['needsConfirmation']}"
        )

    except Exception as error:

        print()
        print("❌ ERROR")
        print(
            f"  {type(error).__name__}: "
            f"{error}"
        )


print()
print("=" * 70)
print("FIVE MODEL TEST COMPLETE")
print("=" * 70)
print()