# ============================================================
# AI-FASHION-CLOSET
# ADVANCED V12 RERANKER — V13
#
# Existing V12 score
# + Style
# + Occasion
# + Body type
# + Undertone
# + Fabric compatibility
# + Fit / Neckline / Details
# ============================================================


# ============================================================
# SAFE VALUE HELPER
# ============================================================

from typing import Any


def normalize_text(value: Any) -> str:
    """
    Convert a value into a clean lowercase string.
    """

    if value is None:
        return ""

    return str(value).strip().lower()
def score_fabric_compatibility(
    user_fabric: str,
    candidate_fabric: str,
    confidence: float
) -> float:
    """
    Score fabric compatibility using lightweight rules.
    """

    user_fabric = normalize_text(
        user_fabric
    )

    candidate_fabric = normalize_text(
        candidate_fabric
    )

    if not user_fabric or not candidate_fabric:
        return 0.0

    if user_fabric == candidate_fabric:
        return 8.0 * confidence

    lightweight_fabrics = {
        "cotton",
        "linen"
    }

    premium_fabrics = {
        "silk",
        "wool"
    }

    natural_fabrics = {
        "cotton",
        "linen",
        "silk",
        "wool",
        "hessian",
        "abaca"
    }

    if (
        user_fabric in lightweight_fabrics
        and candidate_fabric in lightweight_fabrics
    ):
        return 6.0 * confidence

    if (
        user_fabric in premium_fabrics
        and candidate_fabric in premium_fabrics
    ):
        return 5.0 * confidence

    if (
        user_fabric in natural_fabrics
        and candidate_fabric in natural_fabrics
    ):
        return 3.0 * confidence

    return 1.0 * confidence

# ============================================================
# AI-FASHION-CLOSET
# UNDERTONE COLOR STYLING ENGINE — V1
# ============================================================

UNDERTONES = [
    "Warm",
    "Cool",
    "Neutral"
]


UNDERTONE_COLOR_RULES = {

    "Warm": {
        "best": [
            "Red",
            "Orange",
            "Yellow",
            "Green",
            "Brown",
            "Nude",
            "Cream",
            "Gold"
        ],

        "good": [
            "White",
            "Black",
            "Pink",
            "Blue"
        ]
    },

    "Cool": {
        "best": [
            "Blue",
            "Purple",
            "Pink",
            "Red",
            "Grey",
            "White",
            "Silver"
        ],

        "good": [
            "Black",
            "Green",
            "Nude"
        ]
    },

    "Neutral": {
        "best": [
            "Black",
            "White",
            "Blue",
            "Green",
            "Red",
            "Pink",
            "Purple",
            "Brown",
            "Grey",
            "Nude"
        ],

        "good": [
            "Orange",
            "Yellow",
            "Cream",
            "Gold",
            "Silver"
        ]
    }
}


# ============================================================
# NORMALIZE COLOR
# ============================================================

def normalize_style_color(color):

    if color is None:
        return ""

    color = str(color).strip().title()

    aliases = {
        "Navy": "Blue",
        "Navy Blue": "Blue",
        "Lavender": "Purple",
        "Mauve": "Purple",
        "Maroon": "Red",
        "Burgundy": "Red",
        "Beige": "Nude",
        "Tan": "Brown",
        "Khaki": "Brown",
        "Metallic": "Silver"
    }

    return aliases.get(
        color,
        color
    )


# ============================================================
# UNDERTONE COLOR SCORE
# ============================================================

def undertone_color_score(
    undertone,
    color
):

    if not undertone or not color:
        return 0

    undertone = str(
        undertone
    ).strip().title()

    color = normalize_style_color(
        color
    )

    rules = UNDERTONE_COLOR_RULES.get(
        undertone
    )

    if not rules:
        return 0

    if color in rules["best"]:
        return 15

    if color in rules["good"]:
        return 7

    return 0

# ============================================================
# AI-FASHION-CLOSET
# BODY TYPE STYLING ENGINE — V1
# ============================================================

BODY_TYPES = [
    "Pear",
    "Hourglass",
    "Rectangle",
    "Apple",
    "Inverted Triangle"
]


BODY_TYPE_RULES = {

    "Pear": {
        "preferred_tops": [
            "Fitted",
            "Structured",
            "Off Shoulder",
            "Square",
            "V-Neck"
        ],

        "preferred_bottoms": [
            "Straight",
            "Wide Leg",
            "Flared"
        ],

        "avoid": [
            "Very tight hip emphasis"
        ]
    },


    "Hourglass": {
        "preferred_tops": [
            "Fitted",
            "Wrap",
            "V-Neck",
            "Square"
        ],

        "preferred_bottoms": [
            "High Waist",
            "Straight",
            "Bootcut"
        ],

        "avoid": [
            "Very boxy oversized silhouettes"
        ]
    },


    "Rectangle": {
        "preferred_tops": [
            "Ruffle",
            "Peplum",
            "Cropped",
            "Structured"
        ],

        "preferred_bottoms": [
            "Wide Leg",
            "Pleated",
            "Flared"
        ],

        "avoid": [
            "Completely shapeless outfits"
        ]
    },


    "Apple": {
        "preferred_tops": [
            "V-Neck",
            "Flowy",
            "Longline",
            "Structured"
        ],

        "preferred_bottoms": [
            "Straight",
            "Wide Leg",
            "Mid Rise"
        ],

        "avoid": [
            "Very tight waist emphasis"
        ]
    },


    "Inverted Triangle": {
        "preferred_tops": [
            "V-Neck",
            "Simple",
            "Fitted"
        ],

        "preferred_bottoms": [
            "Wide Leg",
            "Flared",
            "Pleated"
        ],

        "avoid": [
            "Heavy shoulder emphasis"
        ]
    }
}


# ============================================================
# BODY TYPE COMPATIBILITY SCORE
# ============================================================

def body_type_style_score(
    body_type,
    requested_item,
    fit=None,
    neckline=None,
    details=None,
    article_type=None
):

    if not body_type:
        return 0


    body_type = str(
        body_type
    ).strip().title()


    rules = BODY_TYPE_RULES.get(
        body_type
    )


    if not rules:
        return 0


    score = 0


    fit = str(
        fit or ""
    ).lower()


    neckline = str(
        neckline or ""
    ).lower()


    article_type = str(
        article_type or ""
    ).lower()


    details = details or []


    # ========================================================
    # NECKLINE BONUSES
    # ========================================================

    preferred_text = " ".join(
        rules["preferred_tops"]
    ).lower()


    if neckline:

        if neckline.lower() in preferred_text:

            score += 15


    # ========================================================
    # FIT BONUSES
    # ========================================================

    if fit:

        if fit.lower() in preferred_text:

            score += 12


    # ========================================================
    # DETAIL BONUSES
    # ========================================================

    for detail in details:

        if str(detail).lower() in preferred_text:

            score += 8


    # ========================================================
    # BOTTOM SHAPE BONUSES
    # ========================================================

    bottom_text = " ".join(
        rules["preferred_bottoms"]
    ).lower()


    if requested_item == "bottom":

        if article_type in bottom_text:

            score += 15


    return score

def safe_item_value(
    item,
    *keys,
    default=None
):

    if not isinstance(item, dict):
        return default

    for key in keys:

        value = item.get(key)

        if value not in [
            None,
            "",
            "Unknown",
            "unknown"
        ]:
            return value

    return default


# ============================================================
# NORMALIZE LIST-LIKE DETAILS
# ============================================================

def normalize_details(details):

    if details is None:
        return []

    if isinstance(details, list):
        return details

    if isinstance(details, tuple):
        return list(details)

    if isinstance(details, str):

        return [
            x.strip()
            for x in details.split(",")
            if x.strip()
        ]

    return []


# ============================================================
# STYLE / OCCASION BONUS
# Same idea as your existing V12
# ============================================================

def get_style_occasion_bonus(
    candidate,
    requested_style=None,
    requested_occasion=None
):

    bonus = 0

    candidate_style = str(
        safe_item_value(
            candidate,
            "style",
            default=""
        )
    ).lower()

    candidate_occasion = str(
        safe_item_value(
            candidate,
            "occasion",
            default=""
        )
    ).lower()


    requested_style = str(
        requested_style or ""
    ).lower()

    requested_occasion = str(
        requested_occasion or ""
    ).lower()


    # Style match
    if (
        requested_style
        and
        candidate_style == requested_style
    ):

        bonus += 20


    # Occasion match
    if (
        requested_occasion
        and
        candidate_occasion == requested_occasion
    ):

        bonus += 20


    return bonus


# ============================================================
# GET EXISTING V12 SCORE
# ============================================================

def get_existing_v12_score(
    candidate
):

    possible_keys = [

        "outfit_score",
        "score",
        "match_score",
        "original_outfit_score",
        "v12_score"
    ]


    for key in possible_keys:

        if (
            isinstance(candidate, dict)
            and
            key in candidate
        ):

            try:

                return float(
                    candidate[key]
                )

            except Exception:
                pass


    return 0.0


# ============================================================
# ADVANCED CANDIDATE SCORE
# ============================================================

def score_v13_candidate(
    candidate,
    uploaded_item=None,
    requested_item=None,
    requested_style=None,
    requested_occasion=None,
    body_type=None,
    undertone=None
):

    uploaded_item = (
        uploaded_item
        if isinstance(
            uploaded_item,
            dict
        )
        else {}
    )


    # --------------------------------------------------------
    # Existing V12 score
    # --------------------------------------------------------

    base_score = get_existing_v12_score(
        candidate
    )


    # --------------------------------------------------------
    # Candidate attributes
    # --------------------------------------------------------

    candidate_color = safe_item_value(
        candidate,
        "color",
        "baseColour"
    )

    candidate_fit = safe_item_value(
        candidate,
        "fit"
    )

    candidate_neckline = safe_item_value(
        candidate,
        "neckline"
    )

    candidate_article = safe_item_value(
        candidate,
        "article_type",
        "articleType"
    )

    candidate_fabric = safe_item_value(
        candidate,
        "fabric"
    )

    candidate_details = normalize_details(
        safe_item_value(
            candidate,
            "details",
            default=[]
        )
    )


    # --------------------------------------------------------
    # Uploaded item fabric
    # --------------------------------------------------------

    uploaded_fabric = safe_item_value(
        uploaded_item,
        "fabric"
    )


    # --------------------------------------------------------
    # Body type
    # --------------------------------------------------------

    try:

        body_bonus = body_type_style_score(

            body_type=body_type,

            requested_item=requested_item,

            fit=candidate_fit,

            neckline=candidate_neckline,

            details=candidate_details,

            article_type=candidate_article
        )

    except Exception:

        body_bonus = 0


    # --------------------------------------------------------
    # Undertone
    # --------------------------------------------------------

    try:

        undertone_bonus = undertone_color_score(
            undertone,
            candidate_color
        )

    except Exception:

        undertone_bonus = 0


    # --------------------------------------------------------
    # Fabric
    # --------------------------------------------------------

    fabric_bonus = 0


    if (
        uploaded_fabric
        and
        candidate_fabric
    ):

        try:

            fabric_bonus = (
    score_fabric_compatibility(
        uploaded_fabric,
        candidate_fabric,
        1.0
    )
)

        except Exception:

            fabric_bonus = 0


    # Style + occasion
    # --------------------------------------------------------

    style_occasion_bonus = (
        get_style_occasion_bonus(

            candidate,

            requested_style,

            requested_occasion
        )
    )


    # --------------------------------------------------------
    # Final score
    # --------------------------------------------------------

    final_score = (

        base_score

        +
        style_occasion_bonus

        +
        body_bonus

        +
        undertone_bonus

        +
        fabric_bonus
    )


    # --------------------------------------------------------
    # Return candidate with score breakdown
    # --------------------------------------------------------

    result = dict(
        candidate
    )


    result[
        "v13_score"
    ] = round(
        final_score,
        2
    )


    result[
        "v13_breakdown"
    ] = {

        "v12_base":
            round(
                base_score,
                2
            ),

        "style_occasion":
            round(
                style_occasion_bonus,
                2
            ),

        "body_type":
            round(
                body_bonus,
                2
            ),

        "undertone":
            round(
                undertone_bonus,
                2
            ),

        "fabric":
            round(
                fabric_bonus,
                2
            ),

        "final":
            round(
                final_score,
                2
            )
    }


    return result


# ============================================================
# AI-FASHION-CLOSET
# FIT — FINAL HYBRID RESOLVER
# ============================================================

def resolve_fit(
    article_type=None,
    item_name=None,
    user_text=None,
    ask_user=True
):

    text = " ".join([
        str(article_type or ""),
        str(item_name or ""),
        str(user_text or "")
    ]).lower()


    # ========================================================
    # STRONG TEXT CLUES
    # ========================================================

    if any(
        word in text
        for word in [
            "skinny",
            "skin fit",
            "skin-fit",
            "bodycon",
            "tight",
            "slim fit",
            "slim-fit"
        ]
    ):
        return {
            "fit": "Fitted",
            "source": "text_rule"
        }


    if any(
        word in text
        for word in [
            "baggy"
        ]
    ):
        return {
            "fit": "Baggy",
            "source": "text_rule"
        }


    if any(
        word in text
        for word in [
            "oversized",
            "over-sized"
        ]
    ):
        return {
            "fit": "Oversized",
            "source": "text_rule"
        }


    if any(
        word in text
        for word in [
            "loose",
            "relaxed"
        ]
    ):
        return {
            "fit": "Loose",
            "source": "text_rule"
        }


    if any(
        word in text
        for word in [
            "regular fit",
            "regular-fit"
        ]
    ):
        return {
            "fit": "Regular",
            "source": "text_rule"
        }


    # ========================================================
    # USER CONFIRMATION
    # ========================================================

    if ask_user:

        print("\n" + "=" * 60)
        print("CLOTHING FIT IS UNCERTAIN")
        print("=" * 60)

        print("1. Fitted / Tight")
        print("2. Regular")
        print("3. Loose / Relaxed")
        print("4. Baggy")
        print("5. Oversized")
        print("0. Unknown / Skip")

        choice = input(
            "Select fit (0-5): "
        ).strip()

        mapping = {
            "1": "Fitted",
            "2": "Regular",
            "3": "Loose",
            "4": "Baggy",
            "5": "Oversized",
            "0": "Unknown"
        }

        return {
            "fit": mapping.get(
                choice,
                "Unknown"
            ),
            "source": "user_confirmation"
        }


    return {
        "fit": "Unknown",
        "source": "uncertain"
    }

# ============================================================
# AI-FASHION-CLOSET
# BOTTOM LENGTH — FINAL HYBRID RESOLVER
# ============================================================

def resolve_bottom_length(
    article_type,
    predicted_length=None,
    confidence=0,
    ask_user=True
):

    article_type = str(
        article_type
    ).strip()


    # ========================================================
    # STRONG ARTICLE RULES
    # ========================================================

    if article_type == "Shorts":

        return {
            "length": "Short",
            "source": "article_override"
        }


    if article_type in [
        "Jeans",
        "Trousers",
        "Leggings"
    ]:

        return {
            "length": "Long",
            "source": "article_override"
        }


    # ========================================================
    # USE PREDICTION IF AVAILABLE + CONFIDENT
    # ========================================================

    if (
        predicted_length is not None
        and
        confidence >= 75
    ):

        return {
            "length": predicted_length,
            "source": "model"
        }


    # ========================================================
    # USER CONFIRMATION
    # ========================================================

    if ask_user:

        print("\n" + "=" * 60)
        print("BOTTOM LENGTH IS UNCERTAIN")
        print("=" * 60)

        print("1. Short")
        print("2. Mid")
        print("3. Long")
        print("0. Unknown / Skip")

        choice = input(
            "Select bottom length (0-3): "
        ).strip()

        mapping = {
            "1": "Short",
            "2": "Mid",
            "3": "Long",
            "0": "Unknown"
        }

        return {
            "length":
                mapping.get(
                    choice,
                    "Unknown"
                ),

            "source":
                "user_confirmation"
        }


    return {
        "length": "Unknown",
        "source": "uncertain"
    }


# ============================================================
# AI-FASHION-CLOSET
# GARMENT DETAILS — FINAL HYBRID RESOLVER
# ============================================================

DETAIL_KEYWORDS = {

    "Slit": [
        "slit",
        "side slit",
        "front slit",
        "back slit"
    ],

    "Ruffle": [
        "ruffle",
        "ruffled",
        "frill",
        "frilled"
    ],

    "Pleated": [
        "pleat",
        "pleated"
    ],

    "Cutout": [
        "cutout",
        "cut-out",
        "cut out"
    ],

    "Asymmetrical": [
        "asymmetrical",
        "asymmetric"
    ]
}


def resolve_garment_details(
    item_name=None,
    user_text=None,
    product_description=None,
    ask_user=False
):

    text = " ".join([
        str(item_name or ""),
        str(user_text or ""),
        str(product_description or "")
    ]).lower()


    detected_details = []


    # ========================================================
    # TEXT DETECTION
    # ========================================================

    for detail, keywords in DETAIL_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:

                detected_details.append(
                    detail
                )

                break


    # Remove duplicates
    detected_details = list(
        dict.fromkeys(
            detected_details
        )
    )


    # ========================================================
    # OPTIONAL USER CONFIRMATION
    # ========================================================

    if ask_user and not detected_details:

        print("\n" + "=" * 60)
        print("GARMENT DETAILS")
        print("=" * 60)

        print("Enter numbers separated by commas:")
        print("1. Slit")
        print("2. Ruffle")
        print("3. Pleated")
        print("4. Cutout")
        print("5. Asymmetrical")
        print("0. None / Unknown")


        choice = input(
            "Select details: "
        ).strip()


        mapping = {
            "1": "Slit",
            "2": "Ruffle",
            "3": "Pleated",
            "4": "Cutout",
            "5": "Asymmetrical"
        }


        if choice != "0":

            selections = [
                x.strip()
                for x in choice.split(",")
            ]


            for selection in selections:

                if selection in mapping:

                    detected_details.append(
                        mapping[selection]
                    )


        detected_details = list(
            dict.fromkeys(
                detected_details
            )
        )


    # ========================================================
    # RETURN BOOLEAN ATTRIBUTES
    # ========================================================

    result = {

        "slit":
            "Slit" in detected_details,

        "ruffle":
            "Ruffle" in detected_details,

        "pleated":
            "Pleated" in detected_details,

        "cutout":
            "Cutout" in detected_details,

        "asymmetrical":
            "Asymmetrical" in detected_details,

        "details":
            detected_details,

        "source":
            (
                "text_rule"
                if detected_details
                else "unknown"
            )
    }


    return result

    # --------------------------------------------------------

# ============================================================
# V13 OUTFIT-LEVEL ADAPTER
# ============================================================

def score_v13_outfit_candidate(
    outfit,
    uploaded_item=None,
    requested_item=None,
    requested_style=None,
    requested_occasion=None,
    body_type=None,
    undertone=None
):
    """
    Apply the existing V13 item-level intelligence to every
    actual garment inside a complete outfit candidate.

    The original outfit score is preserved exactly once.
    Only incremental V13 bonuses are added to it.
    """

    if not isinstance(outfit, dict):
        return None

    base_outfit_score = get_existing_v12_score(outfit)

    component_results = {}
    incremental_total = 0.0

    # Actual garments only.
    # No garment is invented.
    components = (
        "dress",
        "top",
        "bottom",
        "footwear",
        "accessory",
    )

    for component in components:

        item = outfit.get(component)

        if not isinstance(item, dict):
            continue

        scored_item = score_v13_candidate(
            candidate=item,
            uploaded_item=uploaded_item,
            requested_item=requested_item,
            requested_style=requested_style,
            requested_occasion=requested_occasion,
            body_type=body_type,
            undertone=undertone,
        )

        if not isinstance(scored_item, dict):
            continue

        breakdown = scored_item.get(
            "v13_breakdown",
            {}
        )

        # score_v13_candidate() already contains the item's
        # own base score. We only take the V13 additions.
        incremental = (
            float(breakdown.get("style_occasion", 0) or 0)
            + float(breakdown.get("body_type", 0) or 0)
            + float(breakdown.get("undertone", 0) or 0)
            + float(breakdown.get("fabric", 0) or 0)
        )

        component_results[component] = {
            "id": item.get("id"),
            "v13_score": scored_item.get(
                "v13_score",
                0
            ),
            "v13_breakdown": breakdown,
            "incremental_v13": round(
                incremental,
                2
            ),
        }

        incremental_total += incremental

    final_score = (
        base_outfit_score
        + incremental_total
    )

    result = dict(outfit)

    result["v13_score"] = round(
        final_score,
        2
    )

    result["v13_breakdown"] = {
        "base_outfit": round(
            base_outfit_score,
            2
        ),
        "components": component_results,
        "v13_incremental": round(
            incremental_total,
            2
        ),
        "final": round(
            final_score,
            2
        ),
    }

    return result

# ============================================================
# RERANK ENTIRE V12 CATALOG
# ============================================================

def rerank_v12_candidates_v13(
    candidates,
    uploaded_item=None,
    requested_item=None,
    requested_style=None,
    requested_occasion=None,
    body_type=None,
    undertone=None
):

    scored_candidates = []


    for candidate in candidates:

        scored = score_v13_candidate(

            candidate=candidate,

            uploaded_item=uploaded_item,

            requested_item=requested_item,

            requested_style=requested_style,

            requested_occasion=requested_occasion,

            body_type=body_type,

            undertone=undertone
        )


        scored_candidates.append(
            scored
        )


    # Highest score first
    scored_candidates.sort(

        key=lambda x:
            x.get(
                "v13_score",
                0
            ),

        reverse=True
    )


    return scored_candidates


# ============================================================
# SELECT BEST ITEM
# ============================================================

def select_best_v13_candidate(
    candidates,
    uploaded_item=None,
    requested_item=None,
    requested_style=None,
    requested_occasion=None,
    body_type=None,
    undertone=None,
    show_top=5
):

    ranked = rerank_v12_candidates_v13(

        candidates=candidates,

        uploaded_item=uploaded_item,

        requested_item=requested_item,

        requested_style=requested_style,

        requested_occasion=requested_occasion,

        body_type=body_type,

        undertone=undertone
    )


    if not ranked:

        return None


    print("\n" + "=" * 70)
    print("AI-FASHION-CLOSET V13 ADVANCED SELECTION")
    print("=" * 70)


    for rank, item in enumerate(
        ranked[:show_top],
        start=1
    ):

        print("\n" + "-" * 60)

        print(
            "Rank:",
            rank
        )

        print(
            "Name:",
            safe_item_value(
                item,
                "name",
                "title",
                default="Unknown"
            )
        )

        print(
            "Article:",
            safe_item_value(
                item,
                "article_type",
                "articleType",
                default="Unknown"
            )
        )

        print(
            "Color:",
            safe_item_value(
                item,
                "color",
                default="Unknown"
            )
        )

        print(
            "Fabric:",
            safe_item_value(
                item,
                "fabric",
                default="Unknown"
            )
        )

        print(
            "Fit:",
            safe_item_value(
                item,
                "fit",
                default="Unknown"
            )
        )

        print(
            "Neckline:",
            safe_item_value(
                item,
                "neckline",
                default="Unknown"
            )
        )

        print(
            "V13 Score:",
            item[
                "v13_score"
            ]
        )

        print(
            "Breakdown:",
            item[
                "v13_breakdown"
            ]
        )


    best_item = ranked[0]


    print("\n" + "=" * 70)
    print("FINAL V13 RECOMMENDATION")
    print("=" * 70)

    print(
        "Selected:",
        safe_item_value(
            best_item,
            "name",
            "title",
            default="Unknown"
        )
    )

    print(
        "Final score:",
        best_item[
            "v13_score"
        ]
    )


    return best_item


print("=" * 70)
print("AI-FASHION-CLOSET V13 RERANKER READY")
print("=" * 70)

print(
    "Ready:",
    callable(
        select_best_v13_candidate
    )
)

# ============================================================
# AI-FASHION-CLOSET
# WEATHER-AWARE STYLING MODULE
# ============================================================

def get_weather_style_advice(
    temperature_c,
    condition="clear"
):

    condition = str(
        condition
    ).strip().lower()

    temperature_c = float(
        temperature_c
    )


    # --------------------------------------------------------
    # WEATHER BUCKET
    # --------------------------------------------------------

    if temperature_c <= 15:

        weather_type = "cold"

        message = (
            f"Layer up 🧥 It's {temperature_c:.0f}°C outside."
        )

    elif temperature_c <= 22:

        weather_type = "cool"

        message = (
            f"It's a little cool outside 🌤️ "
            f"{temperature_c:.0f}°C — light layering would work well."
        )

    elif temperature_c >= 32:

        weather_type = "hot"

        message = (
            f"Keep it light ☀️ It's {temperature_c:.0f}°C outside."
        )

    else:

        weather_type = "normal"

        message = (
            f"Weather looks comfortable 🌤️ "
            f"{temperature_c:.0f}°C outside."
        )


    # --------------------------------------------------------
    # CONDITION OVERRIDES
    # --------------------------------------------------------

    if any(
        word in condition
        for word in [
            "rain",
            "rainy",
            "drizzle",
            "storm"
        ]
    ):

        weather_type = "rainy"

        message = (
            f"Looks rainy 🌧️ It's {temperature_c:.0f}°C outside. "
            "Go for practical footwear and avoid delicate fabrics."
        )


    return {

        "temperature_c":
            temperature_c,

        "condition":
            condition,

        "weather_type":
            weather_type,

        "message":
            message
    }

# ============================================================
# SCORE CLOSET ITEM FOR WEATHER
# ============================================================

def weather_item_score(
    item,
    weather_type
):
    score = 0

    article = str(
        item.get(
            "article_type",
            ""
        )
    ).lower()

    fabric = str(
        item.get(
            "fabric",
            ""
        )
    ).lower()

    name = str(
        item.get(
            "name",
            ""
        )
    ).lower()

    # --------------------------------------------------------
    # COLD
    # --------------------------------------------------------

    if weather_type == "cold":

        if fabric in [
            "wool",
            "denim",
            "cotton"
        ]:
            score += 15

        if article in [
            "jeans",
            "trousers"
        ]:
            score += 10

        if any(
            word in name
            for word in [
                "jacket",
                "hoodie",
                "sweater",
                "cardigan"
            ]
        ):
            score += 30

    # --------------------------------------------------------
    # HOT
    # --------------------------------------------------------

    elif weather_type == "hot":

        if fabric in [
            "cotton",
            "linen"
        ]:
            score += 20

        if article in [
            "tshirts",
            "tops",
            "shorts"
        ]:
            score += 15

    # --------------------------------------------------------
    # RAIN
    # --------------------------------------------------------

    elif weather_type == "rainy":

        if article == "casual shoes":
            score += 15

        if article in [
            "heels",
            "flats"
        ]:
            score -= 20

        if any(
            word in name
            for word in [
                "water resistant",
                "waterproof"
            ]
        ):
            score += 30

    # --------------------------------------------------------
    # NORMAL / COOL
    # --------------------------------------------------------

    else:

        score += 5

    return score

# ============================================================
# WEATHER-AWARE FULL OUTFIT FROM CLOSET
# ============================================================

def build_weather_aware_closet_outfit(
    temperature_c,
    condition="clear",
    occasion="casual",
    style="casual",
    closet=None
):
    weather_info = get_weather_style_advice(
        temperature_c,
        condition
    )

    print("\n" + "=" * 70)
    print("WEATHER STYLE MESSAGE")
    print("=" * 70)

    print(
        weather_info["message"]
    )

    if closet is None:
        closet = []

    if not closet:
        return {
            "success": False,
            "reason": "Closet is empty."
        }

    # --------------------------------------------------------
    # Separate by role
    # --------------------------------------------------------

    role_items = {
        "top": [],
        "bottom": [],
        "dress": [],
        "footwear": [],
        "accessory": []
    }

    for item in closet:

        role = detect_item_role(
            item
        )

        if role in role_items:

            role_items[
                role
            ].append(
                item
            )

    # --------------------------------------------------------
    # COMBINED SCORE
    # --------------------------------------------------------

    def total_score(item):

        score = 0

        item_style = str(
            item.get(
                "style",
                ""
            )
        ).lower()

        item_occasion = str(
            item.get(
                "occasion",
                ""
            )
        ).lower()

        if item_style == style.lower():

            score += 30

        if item_occasion == occasion.lower():

            score += 30

        score += weather_item_score(
            item,
            weather_info[
                "weather_type"
            ]
        )

        return score

    # --------------------------------------------------------
    # PICK BEST
    # --------------------------------------------------------

    def best(items):

        if not items:
            return None

        return max(
            items,
            key=total_score
        )

    best_top = best(
        role_items["top"]
    )

    best_bottom = best(
        role_items["bottom"]
    )

    best_dress = best(
        role_items["dress"]
    )

    best_footwear = best(
        role_items["footwear"]
    )

    best_accessory = best(
        role_items["accessory"]
    )

    outfit_items = []

    # --------------------------------------------------------
    # DRESS LOGIC
    # --------------------------------------------------------

    if (
        best_dress
        and
        occasion.lower()
        in [
            "party",
            "wedding",
            "date"
        ]
    ):

        outfit_items.append(
            best_dress
        )

    else:

        if best_top:

            outfit_items.append(
                best_top
            )

        if best_bottom:

            outfit_items.append(
                best_bottom
            )

    # --------------------------------------------------------
    # FOOTWEAR
    # --------------------------------------------------------

    if best_footwear:

        outfit_items.append(
            best_footwear
        )

    # --------------------------------------------------------
    # ACCESSORY
    # --------------------------------------------------------

    if best_accessory:

        outfit_items.append(
            best_accessory
        )

    # --------------------------------------------------------
    # DISPLAY
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("WEATHER-AWARE CLOSET OUTFIT")
    print("=" * 70)

    for item in outfit_items:

        print("\n" + "-" * 60)

        print(
            "Name:",
            item.get("name")
        )

        print(
            "Article:",
            item.get(
                "article_type"
            )
        )

        print(
            "Color:",
            item.get(
                "color"
            )
        )

        print(
            "Fabric:",
            item.get(
                "fabric"
            )
        )

    # --------------------------------------------------------
    # RETURN
    # --------------------------------------------------------

    return {

        "success":
            len(outfit_items) > 0,

        "weather":
            weather_info,

        "occasion":
            occasion,

        "style":
            style,

        "items":
            outfit_items
    }
# ============================================================
# FINAL ROLE MAPPING + DRESS SUPPORT
# ============================================================

ROLE_ARTICLES = {
    "top": [
        "tshirts",
        "shirts",
        "tops",
        "kurtas"
    ],
    "bottom": [
        "jeans",
        "trousers",
        "shorts"
    ],
    "footwear": [
        "casual shoes",
        "formal shoes",
        "flats",
        "heels"
    ],
    "accessory": [
        "handbags",
        "backpacks"
    ],
    "dress": [
        "dresses"
    ]
}


def detect_item_role(item):

    role = str(
        item.get(
            "role",
            ""
        )
    ).strip().lower()

    category = str(
        item.get(
            "category",
            ""
        )
    ).strip().lower()

    article = str(
        item.get(
            "article_type",
            ""
        )
    ).strip().lower()

    if role in ROLE_ARTICLES:
        return role

    category_map = {
        "tops": "top",
        "top": "top",

        "bottoms": "bottom",
        "bottom": "bottom",

        "footwears": "footwear",
        "footwear": "footwear",

        "accessories": "accessory",
        "accessory": "accessory",

        "dresses": "dress",
        "dress": "dress"
    }

    if category in category_map:
        return category_map[category]

    for possible_role, articles in ROLE_ARTICLES.items():

        if article in articles:
            return possible_role

    return None