import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
import numpy as np

# ============================================================
# SUBCATEGORY MODEL TEST
# ============================================================

MODEL_DIR = "models/subcategory"

IMAGE_PATH = r"C:\Users\Appex\Desktop\style-buddys\backend\uploads\cmtqu0zqu0002aovwtubvzw4f-1788761545577-3b9e3658-cb37-4922-8ad1-7d742a7157d6.png"

SUBCATEGORY_CLASSES = [
    "Backpacks",
    "Dresses",
    "Flats",
    "Formal Shoes",
    "Handbags",
    "Heels",
    "Jeans",
    "Kurtas",
    "Shirts",
    "Shorts",
    "Tops",
    "Trousers",
    "Tshirts",
]


# ============================================================
# LOAD MODEL
# ============================================================

print("TensorFlow version:", tf.__version__)

with open(
    f"{MODEL_DIR}/config.json",
    "r",
    encoding="utf-8"
) as f:

    saved_config = json.load(f)

print("Config loaded successfully.")

print(
    "Model class:",
    saved_config.get("class_name")
)

model = keras.models.model_from_json(
    json.dumps(saved_config)
)

print("Model architecture reconstructed.")

model.load_weights(
    f"{MODEL_DIR}/model.weights.h5"
)

print("Model loaded successfully!")

print("Input shape:", model.input_shape)

print("Output shape:", model.output_shape)


# ============================================================
# LOAD IMAGE
# ============================================================

img = image.load_img(
    IMAGE_PATH,
    target_size=(224, 224)
)

img_array = image.img_to_array(img)

img_array = np.expand_dims(
    img_array,
    axis=0
)

img_array = img_array / 255.0

print("Image loaded and preprocessed.")


# ============================================================
# RAW MODEL PREDICTION
# ============================================================

prediction = model.predict(
    img_array,
    verbose=0
)[0]


# ============================================================
# SORT ALL PREDICTIONS
# ============================================================

sorted_indices = np.argsort(
    prediction
)[::-1]


# ============================================================
# DISPLAY RESULT
# ============================================================

predicted_index = int(
    np.argmax(prediction)
)

confidence = float(
    np.max(prediction)
)

print()
print("==========================================")
print("     RAW SUBCATEGORY MODEL RESULT")
print("==========================================")

print(
    "Predicted article:",
    SUBCATEGORY_CLASSES[predicted_index]
)

print(
    "Confidence:",
    f"{confidence * 100:.2f}%"
)

print()
print("ALL 13 MODEL PROBABILITIES")
print("------------------------------------------")

for index in sorted_indices:

    probability = float(
        prediction[index]
    )

    print(
        f"{SUBCATEGORY_CLASSES[index]:15s}"
        f" → {probability * 100:.2f}%"
    )

print("==========================================")