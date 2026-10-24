import json
from pathlib import Path

import numpy as np
from tensorflow import keras
from notebook_engine import resolve_bottom_length
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet50_preprocess


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "final_models"


# ============================================================
# MODEL LABELS
# ============================================================

CATEGORY_CLASSES = [
    "accessories",
    "bottoms",
    "dresses",
    "footwears",
    "tops",
]

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

COLOR_CLASSES = [
    "Black",
    "Blue",
    "Brown",
    "Cream",
    "Green",
    "Grey",
    "Maroon",
    "Metallic",
    "Multi",
    "Nude",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "White",
    "Yellow",
]

# FINAL PATTERN V2
PATTERN_CLASSES = [
    "Checked",
    "Floral",
    "Graphic",
    "Other",
    "Plain",
    "Striped",
]

# FINAL SLEEVE V2
SLEEVE_CLASSES = [
    "Long Sleeve",
    "Medium Sleeve",
    "Short Sleeve",
    "Sleeveless",
]

# FINAL NECKLINE V2
NECKLINE_CLASSES = [
    "Lapel",
    "Round",
    "Square",
    "Stand",
    "V-Neck",
]

# TEMPORARY FABRIC LABELS
# The currently exported fabric_model.keras is still the old
# 6-class artifact. Fabric V3 will be switched later after the
# correct final 4-class artifact is verified.
FABRIC_CLASSES = [
    "Abaca",
    "Cotton",
    "Hessian",
    "Linen",
    "Silk",
    "Wool",
]


# ============================================================
# CATEGORY <-> ARTICLE TYPE MAPPING
# ============================================================

CATEGORY_TO_ARTICLES = {
    "accessories": [
        "Backpacks",
        "Handbags",
    ],
    "bottoms": [
        "Jeans",
        "Trousers",
        "Shorts",
    ],
    "dresses": [
        "Dresses",
    ],
    "footwears": [
        "Flats",
        "Formal Shoes",
        "Heels",
    ],
    "tops": [
        "Kurtas",
        "Shirts",
        "Tops",
        "Tshirts",
    ],
}

ARTICLE_TO_CATEGORY = {
    "Backpacks": "accessories",
    "Handbags": "accessories",

    "Jeans": "bottoms",
    "Trousers": "bottoms",
    "Shorts": "bottoms",

    "Dresses": "dresses",

    "Flats": "footwears",
    "Formal Shoes": "footwears",
    "Heels": "footwears",

    "Kurtas": "tops",
    "Shirts": "tops",
    "Tops": "tops",
    "Tshirts": "tops",
}


# ============================================================
# CONFIDENCE THRESHOLDS
# ============================================================

CONFIDENCE_THRESHOLDS = {
    "subcategory": 55.0,
    "color": 55.0,
    "pattern": 55.0,
    "fabric": 70.0,
    "sleeve": 55.0,
    "neckline": 55.0,
}

CATEGORY_THRESHOLD = 60.0
STRONG_SUBCATEGORY_THRESHOLD = 70.0
WEAK_GUIDED_SUBCATEGORY_THRESHOLD = 20.0


# ============================================================
# MODEL LOADING
# ============================================================

def load_keras_model(model_name):
    """
    Load one of the final .keras models.

    All final models are loaded with compile=False because
    inference does not require the training optimizer/loss.
    """

    model_path = MODELS_DIR / model_name

    if not model_path.exists():
        raise FileNotFoundError(
            f"AI model not found: {model_path}"
        )

    print(f"Loading: {model_path.name}")

    model = keras.models.load_model(
        model_path,
        compile=False,
    )

    print(
        f"  input={model.input_shape} "
        f"output={model.output_shape}"
    )

    return model


print("Loading StyleBuddy FINAL AI models...")
print("=" * 70)

category_model = load_keras_model(
    "category_model.keras"
)

subcategory_model = load_keras_model(
    "subcategory_model.keras"
)

color_model = load_keras_model(
    "color_model.keras"
)

pattern_model = load_keras_model(
    "pattern_model.keras"
)

# TEMPORARY FABRIC MODEL
fabric_model = load_keras_model(
    "fabric_model.keras"
)

sleeve_model = load_keras_model(
    "sleeve_model.keras"
)

neckline_model = load_keras_model(
    "neckline_model.keras"
)

print("=" * 70)
print("✓ All 7 StyleBuddy AI models loaded.")
print("=" * 70)


# ============================================================
# IMAGE LOADING
# ============================================================

def load_image_array(image_path):
    """
    Load an image as RGB and resize it to 224x224.
    Returns an unbatched float32 array in the 0-255 range.
    """

    img = image.load_img(
        image_path,
        target_size=(224, 224),
        color_mode="rgb",
    )

    img_array = image.img_to_array(img)

    return img_array.astype(np.float32)


def add_batch_dimension(img_array):
    return np.expand_dims(
        img_array,
        axis=0,
    )


# ============================================================
# MODEL-SPECIFIC PREPROCESSING
# ============================================================

def preprocess_scaled(img_array):
    """
    Category / Subcategory / Color.

    Existing final pipeline for these models uses /255 scaling.
    """

    scaled = (
        img_array.astype(np.float32)
        / 255.0
    )

    return add_batch_dimension(scaled)


def preprocess_resnet50(img_array):
    """
    ResNet50 preprocessing.

    Kept as a utility because older models used it.

    IMPORTANT:
    Final Pattern V2 is EfficientNetB0, so Pattern V2 does
    NOT use this function.
    """

    processed = resnet50_preprocess(
        img_array.astype(np.float32)
    )

    return add_batch_dimension(processed)


def preprocess_efficientnet(img_array):
    """
    Final EfficientNetB0 models.

    Keras EfficientNet models include their preprocessing /
    rescaling behavior inside the model. Therefore the image
    is passed as float32 0-255 data here rather than applying
    ResNet preprocessing or an additional /255 operation.

    This is used for:
        Pattern V2
        Sleeve V2
        Neckline V2

    The final pipeline documentation specifically warns that
    preprocessing must be model-specific.
    """

    raw = img_array.astype(np.float32)

    return add_batch_dimension(raw)


def preprocess_fabric_current(img_array):
    """
    TEMPORARY CURRENT FABRIC MODEL.

    The currently exported fabric_model.keras is the older
    6-class artifact, so retain its existing raw-image
    preprocessing until the correct Fabric V3 artifact is
    available.
    """

    raw = img_array.astype(np.float32)

    return add_batch_dimension(raw)


# ============================================================
# IMAGE VARIANTS
# ============================================================

def prepare_image_variants(image_path):
    """
    Prepare model-specific image inputs.

    We retain:
        full image
        upper garment crop

    The upper crop is useful for:
        color
        sleeve
        neckline

    The final Pattern V2 model receives the full image.
    """

    original = image.load_img(
        image_path,
        color_mode="rgb",
    )

    width, height = original.size

    if width <= 0 or height <= 0:
        raise ValueError(
            f"Invalid image dimensions: {width}x{height}"
        )

    # --------------------------------------------------------
    # FULL IMAGE
    # --------------------------------------------------------

    full_image = original.resize(
        (224, 224)
    )

    full_array = image.img_to_array(
        full_image
    ).astype(np.float32)

    # --------------------------------------------------------
    # UPPER GARMENT CROP
    # --------------------------------------------------------

    left = int(width * 0.15)
    right = int(width * 0.85)

    top = int(height * 0.12)
    bottom = int(height * 0.72)

    # Safety for very small / unusual images
    left = max(0, min(left, width - 1))
    right = max(left + 1, min(right, width))
    top = max(0, min(top, height - 1))
    bottom = max(top + 1, min(bottom, height))

    upper_crop = original.crop(
        (
            left,
            top,
            right,
            bottom,
        )
    )

    upper_crop = upper_crop.resize(
        (224, 224)
    )

    upper_array = image.img_to_array(
        upper_crop
    ).astype(np.float32)

    return {
        # Category / Subcategory / Color
        "full": preprocess_scaled(
            full_array
        ),
        "upper": preprocess_scaled(
            upper_array
        ),

        # Final Pattern V2 — EfficientNetB0
        "pattern_full": preprocess_efficientnet(
            full_array
        ),

        # Temporary current Fabric model
        "fabric_full": preprocess_fabric_current(
            full_array
        ),

        # Final Sleeve V2 — EfficientNetB0
        "sleeve_upper": preprocess_efficientnet(
            upper_array
        ),

        # Final Neckline V2 — EfficientNetB0
        "neckline_upper": preprocess_efficientnet(
            upper_array
        ),
    }


# ============================================================
# PREDICTION HELPERS
# ============================================================

def get_predictions(model, image_array):
    """
    Run inference and return the first prediction vector.
    """

    predictions = model.predict(
        image_array,
        verbose=0,
    )

    predictions = np.asarray(
        predictions
    )

    if predictions.ndim == 2:
        predictions = predictions[0]

    return predictions.astype(np.float32)


def get_top_k_predictions(
    predictions,
    class_names,
    k=3,
):
    """
    Convert a prediction vector into a frontend-friendly
    top-k structure.
    """

    predictions = np.asarray(
        predictions
    ).reshape(-1)

    if len(predictions) != len(class_names):
        raise ValueError(
            "Prediction/class mismatch: "
            f"model returned {len(predictions)} outputs, "
            f"but {len(class_names)} class labels were supplied."
        )

    k = min(
        k,
        len(class_names),
    )

    top_indices = np.argsort(
        predictions
    )[-k:][::-1]

    results = []

    for index in top_indices:
        index = int(index)

        results.append({
            "label": class_names[index],
            "confidence": round(
                float(predictions[index]) * 100,
                2,
            ),
            "index": index,
        })

    return results


def predict(model, image_array):
    """
    Generic single-model prediction helper.
    """

    predictions = get_predictions(
        model,
        image_array,
    )

    predicted_index = int(
        np.argmax(predictions)
    )

    confidence = float(
        predictions[predicted_index]
    )

    return (
        predicted_index,
        confidence,
        predictions,
    )


# ============================================================
# CATEGORY-AWARE ARTICLE RESOLUTION
# ============================================================

def resolve_category_subcategory(
    category,
    category_confidence,
    subcategory_predictions,
):
    """
    Resolve article type using both category and subcategory
    predictions.

    A strong subcategory can override a weak/inconsistent
    category prediction.
    """

    category_confidence_percent = (
        category_confidence * 100
    )

    raw_top3 = get_top_k_predictions(
        subcategory_predictions,
        SUBCATEGORY_CLASSES,
        k=3,
    )

    raw_best = raw_top3[0]

    raw_article = raw_best["label"]

    raw_article_confidence = (
        raw_best["confidence"]
    )

    raw_parent_category = (
        ARTICLE_TO_CATEGORY.get(
            raw_article
        )
    )

    allowed_articles = (
        CATEGORY_TO_ARTICLES.get(
            category,
            [],
        )
    )

    guided_options = []

    for article_name in allowed_articles:

        index = SUBCATEGORY_CLASSES.index(
            article_name
        )

        guided_options.append({
            "label": article_name,
            "confidence": round(
                float(
                    subcategory_predictions[
                        index
                    ]
                ) * 100,
                2,
            ),
            "index": index,
        })

    guided_options.sort(
        key=lambda item: item["confidence"],
        reverse=True,
    )

    guided_best = (
        guided_options[0]
        if guided_options
        else None
    )

    if guided_best is None:
        return {
            "category": category,
            "articleType": raw_article,
            "source": "raw_subcategory",
            "needsConfirmation": (
                raw_article_confidence
                < CONFIDENCE_THRESHOLDS[
                    "subcategory"
                ]
            ),
            "candidates": raw_top3,
            "candidateCategories": [],
        }

    guided_article = (
        guided_best["label"]
    )

    guided_confidence = (
        guided_best["confidence"]
    )

    # --------------------------------------------------------
    # STRONG ARTICLE OVERRIDES WEAK CATEGORY
    # --------------------------------------------------------

    if (
        category_confidence_percent
        < CATEGORY_THRESHOLD
        and
        raw_article_confidence
        >= STRONG_SUBCATEGORY_THRESHOLD
        and
        raw_parent_category is not None
    ):
        return {
            "category": raw_parent_category,
            "articleType": raw_article,
            "source": "strong_subcategory_override",
            "needsConfirmation": False,
            "candidates": raw_top3,
            "candidateCategories": [
                raw_parent_category
            ],
        }

    # --------------------------------------------------------
    # STRONG CONFLICT OVERRIDE
    # --------------------------------------------------------

    if (
        raw_article_confidence
        >= STRONG_SUBCATEGORY_THRESHOLD
        and
        guided_confidence
        < WEAK_GUIDED_SUBCATEGORY_THRESHOLD
        and
        raw_parent_category is not None
        and
        raw_parent_category != category
    ):
        return {
            "category": raw_parent_category,
            "articleType": raw_article,
            "source": "strong_conflict_override",
            "needsConfirmation": False,
            "candidates": raw_top3,
            "candidateCategories": [
                raw_parent_category
            ],
        }

    # --------------------------------------------------------
    # WEAK CATEGORY
    # --------------------------------------------------------

    if (
        category_confidence_percent
        < CATEGORY_THRESHOLD
    ):

        category_scores = {}

        for (
            article_name,
            parent_category,
        ) in ARTICLE_TO_CATEGORY.items():

            index = SUBCATEGORY_CLASSES.index(
                article_name
            )

            score = float(
                subcategory_predictions[
                    index
                ]
            )

            category_scores[parent_category] = (
                category_scores.get(
                    parent_category,
                    0.0,
                )
                + score
            )

        best_article_category = max(
            category_scores,
            key=category_scores.get,
        )

        candidate_categories = [
            best_article_category
        ]

        if category not in candidate_categories:
            candidate_categories.append(
                category
            )

        if (
            best_article_category
            != category
        ):
            return {
                "category": best_article_category,
                "articleType": raw_article,
                "source": (
                    "subcategory_category_resolution"
                ),
                "needsConfirmation": (
                    raw_article_confidence
                    < CONFIDENCE_THRESHOLDS[
                        "subcategory"
                    ]
                ),
                "candidateCategories": (
                    candidate_categories
                ),
                "candidates": raw_top3,
            }

        return {
            "category": category,
            "articleType": guided_article,
            "source": "category_uncertain",
            "needsConfirmation": True,
            "candidateCategories": (
                candidate_categories
            ),
            "candidates": raw_top3,
        }

    # --------------------------------------------------------
    # NORMAL CATEGORY-GUIDED RESULT
    # --------------------------------------------------------

    needs_confirmation = (
        guided_confidence
        < CONFIDENCE_THRESHOLDS[
            "subcategory"
        ]
    )

    return {
        "category": category,
        "articleType": guided_article,
        "source": "category_guided",
        "needsConfirmation": (
            needs_confirmation
        ),
        "candidates": guided_options,
        "candidateCategories": [
            category
        ],
    }


# ============================================================
# ATTRIBUTE RESULT BUILDER
# ============================================================

def build_attribute_result(
    value,
    confidence,
    top3,
    threshold,
    **extra,
):
    """
    Keep a consistent result format for every AI attribute.
    """

    result = {
        "value": value,
        "confidence": float(confidence),
        "confidencePercent": round(
            float(confidence) * 100,
            2,
        ),
        "top3": top3,
        "needsConfirmation": (
            float(confidence) * 100
            < threshold
        ),
    }

    result.update(extra)

    return result


# ============================================================
# COMPLETE CLOTHING ANALYSIS
# ============================================================

def analyze_clothing_image(image_path):
    """
    Run the complete StyleBuddy final clothing analysis.

    Returns:
        category
        articleType
        color
        pattern
        fabric
        sleeve
        neckline
        aiStatus
    """

    image_path = Path(
        image_path
    )

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    # --------------------------------------------------------
    # PREPARE IMAGE VARIANTS
    # --------------------------------------------------------

    image_variants = (
        prepare_image_variants(
            image_path
        )
    )

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    category_predictions = get_predictions(
        category_model,
        image_variants["full"],
    )

    category_index = int(
        np.argmax(
            category_predictions
        )
    )

    category_confidence = float(
        category_predictions[
            category_index
        ]
    )

    category = CATEGORY_CLASSES[
        category_index
    ]

    category_top3 = get_top_k_predictions(
        category_predictions,
        CATEGORY_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # ARTICLE TYPE
    # --------------------------------------------------------

    subcategory_predictions = get_predictions(
        subcategory_model,
        image_variants["full"],
    )

    subcategory_index = int(
        np.argmax(
            subcategory_predictions
        )
    )

    subcategory_confidence = float(
        subcategory_predictions[
            subcategory_index
        ]
    )

    raw_article_type = (
        SUBCATEGORY_CLASSES[
            subcategory_index
        ]
    )

    subcategory_top3 = get_top_k_predictions(
        subcategory_predictions,
        SUBCATEGORY_CLASSES,
        k=3,
    )

    resolved = (
        resolve_category_subcategory(
            category=category,
            category_confidence=(
                category_confidence
            ),
            subcategory_predictions=(
                subcategory_predictions
            ),
        )
    )

    # --------------------------------------------------------
    # COLOR
    # --------------------------------------------------------

    # Use both full and upper views and retain the more
    # confident prediction, as the current pipeline did.
    full_color_predictions = get_predictions(
        color_model,
        image_variants["full"],
    )

    upper_color_predictions = get_predictions(
        color_model,
        image_variants["upper"],
    )

    full_color_index = int(
        np.argmax(
            full_color_predictions
        )
    )

    upper_color_index = int(
        np.argmax(
            upper_color_predictions
        )
    )

    full_color_confidence = float(
        full_color_predictions[
            full_color_index
        ]
    )

    upper_color_confidence = float(
        upper_color_predictions[
            upper_color_index
        ]
    )

    if (
        upper_color_confidence
        > full_color_confidence
    ):
        color_predictions = (
            upper_color_predictions
        )
    else:
        color_predictions = (
            full_color_predictions
        )

    color_index = int(
        np.argmax(
            color_predictions
        )
    )

    color_confidence = float(
        color_predictions[
            color_index
        ]
    )

    color = COLOR_CLASSES[
        color_index
    ]

    color_top3 = get_top_k_predictions(
        color_predictions,
        COLOR_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # PATTERN V2
    # --------------------------------------------------------

    pattern_predictions = get_predictions(
        pattern_model,
        image_variants["pattern_full"],
    )

    pattern_index = int(
        np.argmax(
            pattern_predictions
        )
    )

    pattern_confidence = float(
        pattern_predictions[
            pattern_index
        ]
    )

    pattern = PATTERN_CLASSES[
        pattern_index
    ]

    pattern_top3 = get_top_k_predictions(
        pattern_predictions,
        PATTERN_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # FABRIC
    # --------------------------------------------------------

    fabric_predictions = get_predictions(
        fabric_model,
        image_variants["fabric_full"],
    )

    fabric_index = int(
        np.argmax(
            fabric_predictions
        )
    )

    fabric_confidence = float(
        fabric_predictions[
            fabric_index
        ]
    )

    fabric = FABRIC_CLASSES[
        fabric_index
    ]

    fabric_top3 = get_top_k_predictions(
        fabric_predictions,
        FABRIC_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # SLEEVE V2
    # --------------------------------------------------------

    sleeve_predictions = get_predictions(
        sleeve_model,
        image_variants["sleeve_upper"],
    )

    sleeve_index = int(
        np.argmax(
            sleeve_predictions
        )
    )

    sleeve_confidence = float(
        sleeve_predictions[
            sleeve_index
        ]
    )

    sleeve = SLEEVE_CLASSES[
        sleeve_index
    ]

    sleeve_top3 = get_top_k_predictions(
        sleeve_predictions,
        SLEEVE_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # NECKLINE V2
    # --------------------------------------------------------

    neckline_predictions = get_predictions(
        neckline_model,
        image_variants["neckline_upper"],
    )

    neckline_index = int(
        np.argmax(
            neckline_predictions
        )
    )

    neckline_confidence = float(
        neckline_predictions[
            neckline_index
        ]
    )

    neckline = NECKLINE_CLASSES[
        neckline_index
    ]

    neckline_top3 = get_top_k_predictions(
        neckline_predictions,
        NECKLINE_CLASSES,
        k=3,
    )

    # --------------------------------------------------------
    # BUILD FINAL RESULTS
    # --------------------------------------------------------

    category_result = {
        "value": resolved["category"],
        "confidence": category_confidence,
        "confidencePercent": round(
            category_confidence * 100,
            2,
        ),
        "rawValue": category,
        "top3": category_top3,
    }

    article_result = {
        "value": resolved["articleType"],
        "confidence": subcategory_confidence,
        "confidencePercent": round(
            subcategory_confidence * 100,
            2,
        ),
        "rawValue": raw_article_type,
        "top3": subcategory_top3,
        "resolutionSource": resolved[
            "source"
        ],
        "needsConfirmation": resolved[
            "needsConfirmation"
        ],
        "candidates": resolved.get(
            "candidates",
            [],
        ),
        "candidateCategories": resolved.get(
            "candidateCategories",
            [],
        ),
    }

    # --------------------------------------------------------
    # GARMENT LENGTH — FINAL HYBRID RESOLVER
    # --------------------------------------------------------

    length_result = resolve_bottom_length(
        article_type=resolved["articleType"],
        predicted_length=None,
        confidence=0,
        ask_user=False,
    )
    color_result = build_attribute_result(
        value=color,
        confidence=color_confidence,
        top3=color_top3,
        threshold=CONFIDENCE_THRESHOLDS[
            "color"
        ],
    )

    pattern_result = build_attribute_result(
        value=pattern,
        confidence=pattern_confidence,
        top3=pattern_top3,
        threshold=CONFIDENCE_THRESHOLDS[
            "pattern"
        ],
        index=pattern_index,
        labelMappingVerified=True,
        modelVersion="Pattern V2",
    )

    fabric_result = build_attribute_result(
        value=fabric,
        confidence=fabric_confidence,
        top3=fabric_top3,
        threshold=CONFIDENCE_THRESHOLDS[
            "fabric"
        ],
        modelVersion="Current exported Fabric model",
        finalV3Verified=False,
    )

    sleeve_result = build_attribute_result(
        value=sleeve,
        confidence=sleeve_confidence,
        top3=sleeve_top3,
        threshold=CONFIDENCE_THRESHOLDS[
            "sleeve"
        ],
        index=sleeve_index,
        modelVersion="Sleeve V2",
    )

    neckline_result = build_attribute_result(
        value=neckline,
        confidence=neckline_confidence,
        top3=neckline_top3,
        threshold=CONFIDENCE_THRESHOLDS[
            "neckline"
        ],
        index=neckline_index,
        modelVersion="Neckline V2",
    )

    # --------------------------------------------------------
    # GLOBAL AI STATUS
    # --------------------------------------------------------

    needs_confirmation = any([
        bool(
            resolved["needsConfirmation"]
        ),
        bool(
            color_result["needsConfirmation"]
        ),
        bool(
            pattern_result["needsConfirmation"]
        ),
        bool(
            fabric_result["needsConfirmation"]
        ),
        bool(
            sleeve_result["needsConfirmation"]
        ),
        bool(
            neckline_result["needsConfirmation"]
        ),
    ])

    return {
        "category": category_result,
        "articleType": article_result,
        "length": length_result,
        "color": color_result,
        "pattern": pattern_result,
        "fabric": fabric_result,
        "sleeve": sleeve_result,
        "neckline": neckline_result,

        "aiStatus": {
            "success": True,
            "needsConfirmation": needs_confirmation,
            "models": {
                "category": "category_model.keras",
                "subcategory": "subcategory_model.keras",
                "color": "color_model.keras",
                "pattern": "pattern_model.keras",
                "fabric": "fabric_model.keras",
                "sleeve": "sleeve_model.keras",
                "neckline": "neckline_model.keras",
            },
            "fabricFinalV3Verified": False,
        },
    }


# ============================================================
# DIRECT TEST
# ============================================================

def print_analysis_result(
    result,
    image_name,
):
    print()
    print("=" * 70)
    print(f"RESULT: {image_name}")
    print("=" * 70)

    print()
    print("CATEGORY")
    print(result["category"])

    print()
    print("ARTICLE TYPE")
    print(result["articleType"])

    print()
    print("COLOR")
    print(result["color"])

    print()
    print("PATTERN V2")
    print(result["pattern"])

    print()
    print("FABRIC")
    print(result["fabric"])

    print()
    print("SLEEVE V2")
    print(result["sleeve"])

    print()
    print("NECKLINE V2")
    print(result["neckline"])

    print()
    print("AI STATUS")
    print(result["aiStatus"])


if __name__ == "__main__":

    test_images_dir = (
        BASE_DIR / "test_images"
    )

    test_images = [
        test_images_dir / "test1.jpg",
        test_images_dir / "test2.webp",
        test_images_dir / "test3.webp",
        test_images_dir / "test4.jfif",
        test_images_dir / "test5.jfif",
    ]

    print()
    print("=" * 70)
    print("STYLEBUDDY FINAL AI TEST - 7 MODELS")
    print("=" * 70)

    for test_image in test_images:

        if not test_image.exists():
            print()
            print(
                f"⚠ TEST IMAGE NOT FOUND: "
                f"{test_image}"
            )
            continue

        try:
            result = analyze_clothing_image(
                test_image
            )

            print_analysis_result(
                result,
                test_image.name,
            )

        except Exception as error:
            print()
            print(
                f"❌ ERROR PROCESSING "
                f"{test_image.name}"
            )
            print(
                f"{type(error).__name__}: "
                f"{error}"
            )

    print()
    print("=" * 70)
    print("STYLEBUDDY FINAL AI TEST FINISHED")
    print("=" * 70)
