from pathlib import Path
import tensorflow as tf
from tensorflow import keras


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
FINAL_MODELS_DIR = BASE_DIR / "final_models"


MODEL_FILES = {
    "category": "category_model.keras",
    "subcategory": "subcategory_model.keras",
    "color": "color_model.keras",
    "fabric": "fabric_model.keras",
    "pattern": "pattern_model.keras",
    "sleeve": "sleeve_model.keras",
    "neckline": "neckline_model.keras",
}


print("=" * 70)
print("STYLEBUDDY — FINAL PIPELINE MODEL INSPECTION")
print("=" * 70)

print()
print("TensorFlow version:", tf.__version__)
print()


for name, filename in MODEL_FILES.items():

    model_path = FINAL_MODELS_DIR / filename

    print()
    print("-" * 70)
    print(f"MODEL: {name}")
    print(f"PATH : {model_path}")

    if not model_path.exists():
        print("❌ FILE NOT FOUND")
        continue

    try:

        model = keras.models.load_model(
            model_path,
            compile=False,
        )

        print("✓ Loaded")

        print()
        print("Input shape:")
        print(model.input_shape)

        print()
        print("Output shape:")
        print(model.output_shape)

        print()
        print("Number of layers:")
        print(len(model.layers))

        print()
        print("First layers:")

        for layer in model.layers[:10]:
            print(
                f"  {layer.name:<35} "
                f"{layer.__class__.__name__}"
            )

        print()

        # Check whether the model has useful metadata
        print("Model config available:", bool(model.get_config()))

        print()
        print("Model summary:")

        model.summary(
            print_fn=lambda line:
            print("  " + line)
        )

    except Exception as error:

        print("❌ FAILED")

        print(
            f"{type(error).__name__}: {error}"
        )


print()
print("=" * 70)
print("INSPECTION COMPLETE")
print("=" * 70)