from pathlib import Path

import numpy as np

from inference import (
    subcategory_model,
    fabric_model,
    SUBCATEGORY_CLASSES,
    FABRIC_CLASSES,
    prepare_image_variants,
    get_top_k_predictions,
)


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


images = sorted(
    [
        file
        for file in TEST_FOLDER.iterdir()
        if file.is_file()
        and file.suffix.lower()
        in SUPPORTED_EXTENSIONS
    ]
)


print()
print("=" * 70)
print("STYLEBUDDY MODEL DIAGNOSTIC TEST")
print("=" * 70)


for image_path in images:

    print()
    print("=" * 70)
    print(f"IMAGE: {image_path.name}")
    print("=" * 70)

    variants = prepare_image_variants(
        image_path
    )

    # ========================================================
    # ARTICLE TYPE
    # ========================================================

    print()
    print("ARTICLE TYPE")
    print("-" * 70)

    full_predictions = (
        subcategory_model.predict(
            variants["full"],
            verbose=0,
        )[0]
    )

    upper_predictions = (
        subcategory_model.predict(
            variants["upper"],
            verbose=0,
        )[0]
    )

    print()
    print("FULL IMAGE:")
    for item in get_top_k_predictions(
        full_predictions,
        SUBCATEGORY_CLASSES,
        k=5,
    ):
        print(
            f"  {item['label']:<20}"
            f"{item['confidence']:>7.2f}%"
        )

    print()
    print("UPPER CROP:")
    for item in get_top_k_predictions(
        upper_predictions,
        SUBCATEGORY_CLASSES,
        k=5,
    ):
        print(
            f"  {item['label']:<20}"
            f"{item['confidence']:>7.2f}%"
        )

    # ========================================================
    # FABRIC
    # ========================================================

    print()
    print("FABRIC")
    print("-" * 70)

    # RAW
    raw_predictions = (
        fabric_model.predict(
            variants["fabric_full"],
            verbose=0,
        )[0]
    )

    # /255
    scaled_image = variants["full"]

    scaled_predictions = (
        fabric_model.predict(
            scaled_image,
            verbose=0,
        )[0]
    )

    print()
    print("RAW 0-255:")
    for item in get_top_k_predictions(
        raw_predictions,
        FABRIC_CLASSES,
        k=6,
    ):
        print(
            f"  {item['label']:<20}"
            f"{item['confidence']:>7.2f}%"
        )

    print()
    print("/255:")
    for item in get_top_k_predictions(
        scaled_predictions,
        FABRIC_CLASSES,
        k=6,
    ):
        print(
            f"  {item['label']:<20}"
            f"{item['confidence']:>7.2f}%"
        )


print()
print("=" * 70)
print("DIAGNOSTIC TEST COMPLETE")
print("=" * 70)
print()