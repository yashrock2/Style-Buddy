"""

StyleBuddy AI Fashion Recommendation Engine



This module converts the user's PostgreSQL closet into

complete outfit recommendations.



The recommendation logic is based on the AI Fashion Closet

notebook's compatibility approach:



- Article compatibility

- Occasion compatibility

- Formality compatibility

- Color coordination

- Style/context matching

- Closet-first recommendation

- Missing-role detection

"""



from typing import Any, Dict, List, Optional

from itertools import product

from notebook_engine import score_v13_outfit_candidate





# ============================================================

# ARTICLE COMPATIBILITY

# Based on the notebook's ARTICLE_KNOWLEDGE

# ============================================================



ARTICLE_KNOWLEDGE = {

    "shirts": {

        "bottoms": ["Jeans", "Trousers"],

        "footwears": ["Casual Shoes", "Formal Shoes"],

        "accessories": ["Backpacks", "Handbags"],

    },



    "tshirts": {

        "bottoms": ["Jeans", "Shorts"],

        "footwears": ["Casual Shoes", "Flats"],

        "accessories": ["Backpacks", "Handbags"],

    },



    "tops": {

        "bottoms": ["Jeans", "Trousers", "Shorts"],

        "footwears": ["Flats", "Heels", "Casual Shoes"],

        "accessories": ["Handbags", "Backpacks"],

    },



    "kurtas": {

        "bottoms": ["Trousers", "Jeans"],

        "footwears": ["Flats", "Formal Shoes"],

        "accessories": ["Handbags", "Backpacks"],

    },



    "dresses": {

        "bottoms": [],

        "footwears": ["Heels", "Flats"],

        "accessories": ["Handbags"],

    },

}





DEFAULT_ARTICLE_STRATEGY = {

    "bottoms": [

        "Jeans",

        "Trousers",

        "Shorts",

    ],

    "footwears": [

        "Casual Shoes",

        "Formal Shoes",

        "Flats",

        "Heels",

    ],

    "accessories": [

        "Handbags",

        "Backpacks",

    ],

}





# ============================================================

# NORMALIZATION HELPERS

# ============================================================



def normalize(value: Any) -> str:

    if value is None:

        return ""



    return str(value).strip().lower()





def display(value: Any, fallback: str = "") -> str:

    if value is None:

        return fallback



    value = str(value).strip()



    return value if value else fallback





def article_type(item: Dict[str, Any]) -> str:

    return normalize(

        item.get("articleType")

        or item.get("article_type")

    )





def category(item: Dict[str, Any]) -> str:

    return normalize(

        item.get("category")

    )





def color(item: Dict[str, Any]) -> str:

    return normalize(

        item.get("color")

    )





def fabric(item: Dict[str, Any]) -> str:

    return normalize(

        item.get("fabric")

    )





# ============================================================

# ROLE DETECTION

# ============================================================



def detect_role(item: Dict[str, Any]) -> Optional[str]:



    article = article_type(item)

    cat = category(item)



    text = f"{article} {cat}"



    # Dress

    if (

        "dress" in text

        or article == "dresses"

    ):

        return "dress"



    # Footwear

    footwear_words = [

        "shoe",

        "shoes",

        "heels",

        "flats",

        "sneakers",

        "boots",

        "sandals",

        "loafers",

        "footwear",

    ]



    if any(word in text for word in footwear_words):

        return "footwear"



    # Bottoms

    bottom_words = [

        "jeans",

        "trousers",

        "pants",

        "shorts",

        "bottom",

        "bottoms",

        "bottomwear",

    ]



    if any(word in text for word in bottom_words):

        return "bottom"



    # Accessories

    accessory_words = [

        "handbag",

        "handbags",

        "backpack",

        "backpacks",

        "bag",

        "bags",

        "belt",

        "watch",

        "accessory",

        "accessories",

    ]



    if any(word in text for word in accessory_words):

        return "accessory"



    # Tops

    top_words = [

        "shirt",

        "shirts",

        "tshirt",

        "tshirts",

        "t-shirt",

        "top",

        "tops",

        "kurta",

        "kurtas",

    ]



    if any(word in text for word in top_words):

        return "top"



    if "top" in cat or "topwear" in cat:

        return "top"



    if "bottom" in cat or "bottomwear" in cat:

        return "bottom"



    if "footwear" in cat:

        return "footwear"



    if "accessor" in cat:

        return "accessory"



    return None





# ============================================================

# OCCASION / STYLE HELPERS

# ============================================================



def normalize_occasion(value: Any) -> str:



    value = normalize(value)



    if value in ("", "automatic"):

        return "casual"



    aliases = {

        "work": "office",

        "business": "office",

        "college": "college",

        "party": "party",

        "wedding": "wedding",

        "date": "date",

        "travel": "travel",

        "casual": "casual",

        "formal": "formal",

        "office": "office",

    }



    return aliases.get(value, value)





def normalize_style(value: Any) -> str:



    value = normalize(value)



    if not value:

        return "casual"



    aliases = {

        "smart casual": "smart_casual",

        "smart-casual": "smart_casual",

        "smartcasual": "smart_casual",

        "minimal": "minimal",

        "college": "college",

        "party": "party",

        "formal": "formal",

        "casual": "casual",

    }



    return aliases.get(value, value)





# ============================================================

# ARTICLE STRATEGY

# ============================================================



def get_article_strategy(

    user_item: Dict[str, Any]

) -> Dict[str, List[str]]:



    article = article_type(user_item)



    strategy = ARTICLE_KNOWLEDGE.get(

        article

    )



    if strategy:

        return strategy



    return DEFAULT_ARTICLE_STRATEGY





# ============================================================

# COLOR COMPATIBILITY

# ============================================================



NEUTRALS = {

    "black",

    "white",

    "grey",

    "gray",

    "beige",

    "cream",

    "brown",

    "navy",

}





COLOR_FAMILIES = {

    "red": {

        "red",

        "maroon",

        "burgundy",

        "pink",

        "orange",

    },



    "blue": {

        "blue",

        "navy",

        "sky blue",

        "light blue",

        "royal blue",

    },



    "green": {

        "green",

        "olive",

        "mint",

        "teal",

    },



    "yellow": {

        "yellow",

        "mustard",

        "gold",

    },



    "purple": {

        "purple",

        "violet",

        "lavender",

    },



    "brown": {

        "brown",

        "tan",

        "beige",

        "cream",

    },

}





def color_family(value: str) -> str:



    value = normalize(value)



    if not value:

        return ""



    for family, colors in COLOR_FAMILIES.items():



        if value in colors:

            return family



    return value





def color_combo_score(

    first: Dict[str, Any],

    second: Dict[str, Any]

) -> float:



    first_color = color(first)

    second_color = color(second)



    if not first_color or not second_color:

        return 0.0



    if first_color == second_color:

        return 2.0



    if (

        first_color in NEUTRALS

        or second_color in NEUTRALS

    ):

        return 10.0



    first_family = color_family(first_color)

    second_family = color_family(second_color)



    # Same family

    if first_family == second_family:

        return 6.0



    # Some useful complementary relationships

    complementary = {

        frozenset(["blue", "orange"]),

        frozenset(["red", "green"]),

        frozenset(["purple", "yellow"]),

        frozenset(["green", "red"]),

    }



    if frozenset([

        first_family,

        second_family,

    ]) in complementary:

        return 8.0



    return 3.0





# ============================================================

# OCCASION SCORE

# ============================================================



def occasion_score(

    item: Dict[str, Any],

    requested_occasion: str

) -> float:



    requested_occasion = normalize_occasion(

        requested_occasion

    )



    item_occasion = normalize(

        item.get("occasion")

    )



    if not item_occasion:

        return 0.0



    if item_occasion == requested_occasion:

        return 15.0



    # Casual can often work for college/travel

    if (

        requested_occasion in {

            "college",

            "travel",

        }

        and item_occasion == "casual"

    ):

        return 7.0



    return 0.0





# ============================================================

# FORMALITY SCORE

# ============================================================



def formality_score(

    item: Dict[str, Any],

    requested_occasion: str

) -> float:



    formality = normalize(

        item.get("formality")

    )



    occasion = normalize_occasion(

        requested_occasion

    )



    if not formality:

        return 0.0



    formal_occasions = {

        "formal",

        "office",

        "wedding",

    }



    casual_occasions = {

        "casual",

        "college",

        "travel",

    }



    if occasion in formal_occasions:



        if formality in {

            "formal",

            "semi-formal",

            "semi formal",

        }:

            return 12.0



    if occasion in casual_occasions:



        if formality in {

            "casual",

            "smart casual",

            "smart_casual",

        }:

            return 10.0



    if occasion in {"party", "date"}:



        if formality in {

            "semi-formal",

            "semi formal",

            "smart casual",

            "smart_casual",

            "party",

        }:

            return 10.0



    return 0.0





# ============================================================

# STYLE SCORE

# ============================================================



def style_score(

    item: Dict[str, Any],

    requested_style: str

) -> float:



    requested_style = normalize_style(

        requested_style

    )



    item_style = normalize_style(

        item.get("style")

    )



    if not item_style:

        return 0.0



    if item_style == requested_style:

        return 12.0



    # Closely related styles

    related = {

        "casual": {

            "smart_casual",

            "college",

        },



        "smart_casual": {

            "casual",

            "formal",

        },



        "college": {

            "casual",

            "smart_casual",

        },



        "minimal": {

            "casual",

            "smart_casual",

        },



        "party": {

            "smart_casual",

            "formal",

        },

    }



    if item_style in related.get(

        requested_style,

        set()

    ):

        return 6.0



    return 0.0





# ============================================================

# VIBE / ARTICLE BONUS

# ============================================================



def article_context_score(

    item: Dict[str, Any],

    role: str,

    occasion: str,

    style: str

) -> float:



    article = article_type(item)



    occasion = normalize_occasion(

        occasion

    )



    style = normalize_style(

        style

    )



    score = 0.0



    # Party

    if occasion == "party":



        if article == "heels":

            score += 15



        if article in {

            "handbags",

            "handbag",

        }:

            score += 10



        if article in {

            "dresses",

            "dress",

        }:

            score += 12



    # Wedding

    if occasion == "wedding":



        if article in {

            "heels",

            "flats",

            "formal shoes",

        }:

            score += 10



        if article in {

            "dresses",

            "dress",

            "kurtas",

        }:

            score += 10



    # Office

    if occasion == "office":



        if article in {

            "shirts",

            "shirt",

            "trousers",

            "formal shoes",

        }:

            score += 10



    # College

    if occasion == "college":



        if article in {

            "tshirts",

            "tshirt",

            "jeans",

            "shorts",

            "backpacks",

            "casual shoes",

        }:

            score += 8



    # Smart casual

    if style == "smart_casual":



        if article in {

            "shirts",

            "trousers",

            "jeans",

            "flats",

            "casual shoes",

        }:

            score += 5



    # Minimal

    if style == "minimal":



        if color(item) in NEUTRALS:

            score += 8



    return score





# ============================================================

# ITEM CONTEXT SCORE

# ============================================================



def item_context_score(

    item: Dict[str, Any],

    role: str,

    occasion: str,

    style: str

) -> float:



    return (

        occasion_score(

            item,

            occasion

        )

        +

        formality_score(

            item,

            occasion

        )

        +

        style_score(

            item,

            style

        )

        +

        article_context_score(

            item,

            role,

            occasion,

            style

        )

    )





# ============================================================

# COMPATIBILITY SCORE

# ============================================================



def compatibility_score(

    top: Optional[Dict[str, Any]],

    bottom: Optional[Dict[str, Any]],

    footwear: Optional[Dict[str, Any]],

    accessory: Optional[Dict[str, Any]],

    occasion: str,

    style: str

) -> float:



    score = 0.0



    # --------------------------------------------------------

    # Top -> Bottom

    # --------------------------------------------------------



    if top and bottom:



        top_article = article_type(top)



        allowed = ARTICLE_KNOWLEDGE.get(

            top_article,

            DEFAULT_ARTICLE_STRATEGY

        ).get(

            "bottoms",

            []

        )



        if article_type(bottom) in [

            normalize(x)

            for x in allowed

        ]:

            score += 20.0



        score += color_combo_score(

            top,

            bottom

        )



    # --------------------------------------------------------

    # Top -> Footwear

    # --------------------------------------------------------



    if top and footwear:



        top_article = article_type(top)



        allowed = ARTICLE_KNOWLEDGE.get(

            top_article,

            DEFAULT_ARTICLE_STRATEGY

        ).get(

            "footwears",

            []

        )



        if article_type(footwear) in [

            normalize(x)

            for x in allowed

        ]:

            score += 15.0



        score += color_combo_score(

            top,

            footwear

        )



    # --------------------------------------------------------

    # Top -> Accessory

    # --------------------------------------------------------



    if top and accessory:



        top_article = article_type(top)



        allowed = ARTICLE_KNOWLEDGE.get(

            top_article,

            DEFAULT_ARTICLE_STRATEGY

        ).get(

            "accessories",

            []

        )



        if article_type(accessory) in [

            normalize(x)

            for x in allowed

        ]:

            score += 12.0



        score += color_combo_score(

            top,

            accessory

        )



    # --------------------------------------------------------

    # Bottom -> Footwear

    # --------------------------------------------------------



    if bottom and footwear:



        score += color_combo_score(

            bottom,

            footwear

        )



    # --------------------------------------------------------

    # Footwear -> Accessory

    # --------------------------------------------------------



    if footwear and accessory:



        score += color_combo_score(

            footwear,

            accessory

        )



    # --------------------------------------------------------

    # Context bonuses

    # --------------------------------------------------------



    for item, role in [

        (top, "top"),

        (bottom, "bottom"),

        (footwear, "footwear"),

        (accessory, "accessory"),

    ]:



        if item:



            score += item_context_score(

                item,

                role,

                occasion,

                style

            )



    # --------------------------------------------------------

    # Controlled color variety

    # Similar to the notebook's color-variety scoring

    # --------------------------------------------------------



    colors = [

        color(item)

        for item in [

            bottom,

            footwear,

            accessory,

        ]

        if item and color(item)

    ]



    unique_colors = len(

        set(colors)

    )



    if unique_colors >= 3:

        score += 10.0



    elif unique_colors == 2:

        score += 5.0



    elif unique_colors == 1 and len(colors) >= 2:

        score -= 8.0



    return round(

        score,

        2

    )





# ============================================================

# RANK ITEMS INSIDE EACH ROLE

# ============================================================



def rank_role_items(

    items: List[Dict[str, Any]],

    role: str,

    occasion: str,

    style: str

) -> List[Dict[str, Any]]:



    ranked = []



    for item in items:



        score = item_context_score(

            item,

            role,

            occasion,

            style

        )



        ranked.append(

            {

                "item": item,

                "score": score,

            }

        )



    ranked.sort(

        key=lambda x: x["score"],

        reverse=True

    )



    return ranked





# ============================================================

# BUILD OUTFIT CANDIDATES

# ============================================================



def selected_item_matches(

    item: Optional[Dict[str, Any]],

    selected_item: Optional[Dict[str, Any]],

) -> bool:

    """Return True only when the candidate is the exact selected closet item."""



    if not item or not selected_item:

        return False



    selected_id = selected_item.get("id")

    item_id = item.get("id")



    if selected_id is None or item_id is None:

        return False



    return str(selected_id) == str(item_id)





def build_candidates(

    closet: List[Dict[str, Any]],

    occasion: str,

    style: str,

    selected_item: Optional[Dict[str, Any]] = None,

    max_candidates_per_role: int = 8,

) -> List[Dict[str, Any]]:



    roles = {

        "top": [],

        "bottom": [],

        "dress": [],

        "footwear": [],

        "accessory": [],

    }



    # ------------------------------------------------------------

    # Build role buckets from the ACTUAL closet.

    # ------------------------------------------------------------



    for item in closet:

        detected_role = detect_role(item)



        if detected_role in roles:

            roles[detected_role].append(item)



    # ------------------------------------------------------------

    # Rank the actual closet items.

    # ------------------------------------------------------------



    ranked = {

        role: rank_role_items(

            items,

            role,

            occasion,

            style,

        )[:max_candidates_per_role]

        for role, items in roles.items()

    }



    # ------------------------------------------------------------

    # If the user explicitly selected an item, that exact item

    # becomes the anchor for the recommendation.

    # ------------------------------------------------------------



    if selected_item:

        selected_role = detect_role(selected_item)



        if selected_role in ranked:

            selected_candidates = [

                item_data

                for item_data in ranked[selected_role]

                if selected_item_matches(

                    item_data["item"],

                    selected_item,

                )

            ]



            # The selected item should not silently disappear because

            # it ranked below the normal candidate limit.

            if not selected_candidates:

                selected_candidates = [{

                    "item": selected_item,

                    "score": item_context_score(

                        selected_item,

                        selected_role,

                        occasion,

                        style,

                    ),

                }]



            ranked[selected_role] = selected_candidates



    candidates = []



    # ========================================================

    # DRESS OUTFITS

    # ========================================================



    if ranked["dress"]:



        dress_options = ranked["dress"]

        footwear_options = ranked["footwear"]

        accessory_options = ranked["accessory"]



        for dress_data in dress_options:



            dress = dress_data["item"]



            # Dress alone is valid.

            if not footwear_options:

                candidates.append(

                    {

                        "dress": dress,

                        "top": None,

                        "bottom": None,

                        "footwear": None,

                        "accessory": None,

                        "score": dress_data["score"],

                    }

                )



            for footwear_data in footwear_options:



                footwear = footwear_data["item"]



                if accessory_options:



                    for accessory_data in accessory_options:



                        accessory = accessory_data["item"]



                        score = (

                            dress_data["score"]

                            + footwear_data["score"]

                            + accessory_data["score"]

                        )



                        score += color_combo_score(

                            dress,

                            footwear,

                        )



                        score += color_combo_score(

                            dress,

                            accessory,

                        )



                        score += color_combo_score(

                            footwear,

                            accessory,

                        )



                        score += item_context_score(

                            dress,

                            "dress",

                            occasion,

                            style,

                        )



                        candidates.append(

                            {

                                "dress": dress,

                                "top": None,

                                "bottom": None,

                                "footwear": footwear,

                                "accessory": accessory,

                                "score": round(score, 2),

                            }

                        )



                else:



                    score = (

                        dress_data["score"]

                        + footwear_data["score"]

                        + color_combo_score(

                            dress,

                            footwear,

                        )

                    )



                    candidates.append(

                        {

                            "dress": dress,

                            "top": None,

                            "bottom": None,

                            "footwear": footwear,

                            "accessory": None,

                            "score": round(score, 2),

                        }

                    )



    # ========================================================

    # TOP + BOTTOM OUTFITS

    # ========================================================



    if ranked["top"] and ranked["bottom"]:



        footwear_options = ranked["footwear"]

        accessory_options = ranked["accessory"]



        # The selected item may be footwear/accessory rather than the

        # top or bottom. In that case, those exact items are also locked.

        if selected_item:

            selected_role = detect_role(selected_item)



            if selected_role == "footwear":

                footwear_options = [

                    item_data

                    for item_data in footwear_options

                    if selected_item_matches(

                        item_data["item"],

                        selected_item,

                    )

                ]



            elif selected_role == "accessory":

                accessory_options = [

                    item_data

                    for item_data in accessory_options

                    if selected_item_matches(

                        item_data["item"],

                        selected_item,

                    )

                ]



        for top_data in ranked["top"]:



            top = top_data["item"]



            for bottom_data in ranked["bottom"]:



                bottom = bottom_data["item"]



                # ---------------------------------------------

                # Check article compatibility

                # ---------------------------------------------



                strategy = ARTICLE_KNOWLEDGE.get(

                    article_type(top),

                    DEFAULT_ARTICLE_STRATEGY,

                )



                allowed_bottoms = [

                    normalize(x)

                    for x in strategy.get(

                        "bottoms",

                        [],

                    )

                ]



                if (

                    allowed_bottoms

                    and article_type(bottom) not in allowed_bottoms

                ):

                    continue



                # ---------------------------------------------

                # No footwear available

                # ---------------------------------------------



                if not footwear_options:



                    score = (

                        top_data["score"]

                        + bottom_data["score"]

                        + color_combo_score(

                            top,

                            bottom,

                        )

                    )



                    candidates.append(

                        {

                            "dress": None,

                            "top": top,

                            "bottom": bottom,

                            "footwear": None,

                            "accessory": None,

                            "score": round(score, 2),

                        }

                    )



                    continue



                # ---------------------------------------------

                # Footwear

                # ---------------------------------------------



                for footwear_data in footwear_options:



                    footwear = footwear_data["item"]



                    allowed_footwear = [

                        normalize(x)

                        for x in strategy.get(

                            "footwears",

                            [],

                        )

                    ]



                    if (

                        allowed_footwear

                        and article_type(footwear) not in allowed_footwear

                    ):

                        continue



                    # -----------------------------------------

                    # Accessory

                    # -----------------------------------------



                    if accessory_options:



                        for accessory_data in accessory_options:



                            accessory = accessory_data["item"]



                            score = compatibility_score(

                                top,

                                bottom,

                                footwear,

                                accessory,

                                occasion,

                                style,

                            )



                            score += (

                                top_data["score"]

                                + bottom_data["score"]

                                + footwear_data["score"]

                                + accessory_data["score"]

                            )



                            candidates.append(

                                {

                                    "dress": None,

                                    "top": top,

                                    "bottom": bottom,

                                    "footwear": footwear,

                                    "accessory": accessory,

                                    "score": round(score, 2),

                                }

                            )



                    else:



                        score = compatibility_score(

                            top,

                            bottom,

                            footwear,

                            None,

                            occasion,

                            style,

                        )



                        score += (

                            top_data["score"]

                            + bottom_data["score"]

                            + footwear_data["score"]

                        )



                        candidates.append(

                            {

                                "dress": None,

                                "top": top,

                                "bottom": bottom,

                                "footwear": footwear,

                                "accessory": None,

                                "score": round(score, 2),

                            }

                        )



    candidates.sort(

        key=lambda candidate: candidate["score"],

        reverse=True,

    )



    return candidates





# ============================================================

# MISSING ROLE DETECTION

# ============================================================



# ============================================================

# DYNAMIC OUTFIT COMPLETION REASONING

# ============================================================



def analyze_outfit_completion(

    closet: List[Dict[str, Any]],

    selected_item: Optional[Dict[str, Any]],

    occasion: str,

    style: str,

) -> Dict[str, Any]:

    """

    Dynamically determines whether the selected item can form a

    complete outfit from the user's actual closet.



    This function does NOT assume that every outfit requires the

    same categories. Requirements are derived from the selected

    item's article compatibility strategy and the actual closet.

    """



    if not selected_item:

        return {

            "complete": False,

            "anchorRole": None,

            "requiredRoles": [],

            "availableRoles": [],

            "missingRoles": [],

            "reason": "No selected wardrobe item was provided.",

        }



    anchor_role = detect_role(selected_item)



    if not anchor_role:

        return {

            "complete": False,

            "anchorRole": None,

            "requiredRoles": [],

            "availableRoles": [],

            "missingRoles": [],

            "reason": "The selected wardrobe item could not be classified.",

        }



    # ------------------------------------------------------------

    # Build actual closet role buckets.

    # ------------------------------------------------------------



    role_items = {

        "top": [],

        "bottom": [],

        "dress": [],

        "footwear": [],

        "accessory": [],

    }



    for item in closet:

        detected = detect_role(item)



        if detected in role_items:

            role_items[detected].append(item)



    # ------------------------------------------------------------

    # One-piece outfits

    #

    # A dress is already a complete main garment.

    # Do NOT require a bottom.

    # ------------------------------------------------------------



       # ------------------------------------------------------------

    # Determine completion requirements dynamically.

    # ------------------------------------------------------------



    completion_roles = {

        "top": "not_applicable",

        "bottom": "not_applicable",

        "dress": "not_applicable",

        "footwear": "optional",

        "accessory": "optional",

    }



    if anchor_role == "dress":



        completion_roles["dress"] = "required"

        completion_roles["bottom"] = "not_applicable"

        completion_roles["footwear"] = "optional"

        completion_roles["accessory"] = "optional"



    elif anchor_role == "top":



        article = article_type(selected_item)



        strategy = ARTICLE_KNOWLEDGE.get(

            article,

            DEFAULT_ARTICLE_STRATEGY

        )



        if strategy.get("bottoms"):

            completion_roles["bottom"] = "required"



        if strategy.get("footwears"):

            completion_roles["footwear"] = "recommended"



        if strategy.get("accessories"):

            completion_roles["accessory"] = "optional"



        completion_roles["top"] = "required"



    elif anchor_role == "bottom":



        completion_roles["bottom"] = "required"

        completion_roles["top"] = "required"

        completion_roles["footwear"] = "optional"

        completion_roles["accessory"] = "optional"



    elif anchor_role == "footwear":



        completion_roles["footwear"] = "required"



        if role_items["dress"]:

            completion_roles["dress"] = "required"



        elif role_items["top"] and role_items["bottom"]:

            completion_roles["top"] = "required"

            completion_roles["bottom"] = "required"



        elif role_items["top"]:

            completion_roles["top"] = "required"

            completion_roles["bottom"] = "required"



        elif role_items["bottom"]:

            completion_roles["top"] = "required"



    elif anchor_role == "accessory":



        completion_roles["accessory"] = "required"



        if role_items["dress"]:

            completion_roles["dress"] = "required"



        elif role_items["top"] and role_items["bottom"]:

            completion_roles["top"] = "required"

            completion_roles["bottom"] = "required"



        elif role_items["top"]:

            completion_roles["top"] = "required"

            completion_roles["bottom"] = "required"



        elif role_items["bottom"]:

            completion_roles["top"] = "required"



    required_roles = [
        role
        for role, status in completion_roles.items()
        if status == "required"
        and role != anchor_role
    ]

    recommended_roles = [
        role
        for role, status in completion_roles.items()
        if status == "recommended"
        and role != anchor_role
    ]

    optional_roles = [
        role
        for role, status in completion_roles.items()
        if status == "optional"
        and role != anchor_role
    ]

    not_applicable_roles = [
        role
        for role, status in completion_roles.items()
        if status == "not_applicable"
        and role != anchor_role
    ]

    # ------------------------------------------------------------
    # Check whether suitable items actually exist in the closet.
    # ------------------------------------------------------------

    available_roles = []
    missing_roles = []
    recommended_available_roles = []
    optional_available_roles = []
    best_matches = {}

    # ------------------------------------------------------------
    # Required roles
    # ------------------------------------------------------------

    for required_role in required_roles:

        candidates = role_items.get(
            required_role,
            []
        )

        if not candidates:
            missing_roles.append(required_role)
            continue

        ranked = rank_role_items(
            candidates,
            required_role,
            occasion,
            style
        )

        if ranked:
            best_matches[required_role] = ranked[0]["item"]
            available_roles.append(required_role)
        else:
            missing_roles.append(required_role)

    # ------------------------------------------------------------
    # Recommended roles
    # ------------------------------------------------------------
    #
    # Recommended roles are actively searched in the actual
    # closet, but their absence does NOT make the outfit incomplete.
    #
    # ------------------------------------------------------------

    for recommended_role in recommended_roles:

        candidates = role_items.get(
            recommended_role,
            []
        )

        if not candidates:
            continue

        ranked = rank_role_items(
            candidates,
            recommended_role,
            occasion,
            style
        )

        if ranked:
            best_matches[recommended_role] = ranked[0]["item"]
            recommended_available_roles.append(
                recommended_role
            )

    # ------------------------------------------------------------
    # Optional roles
    # ------------------------------------------------------------

    for optional_role in optional_roles:

        candidates = role_items.get(
            optional_role,
            []
        )

        if not candidates:
            continue

        ranked = rank_role_items(
            candidates,
            optional_role,
            occasion,
            style
        )

        if ranked:
            best_matches[optional_role] = ranked[0]["item"]
            optional_available_roles.append(
                optional_role
            )

    complete = len(missing_roles) == 0

    if complete:
        reason = (
            "The selected item satisfies all required "
            "outfit roles using the actual closet."
        )
    else:
        reason = (
            "The selected item cannot be fully completed "
            "because one or more required roles are unavailable."
        )

    return {
        "complete": complete,
        "anchorRole": anchor_role,
        "roleStatus": completion_roles,
        "requiredRoles": required_roles,
        "recommendedRoles": recommended_roles,
        "optionalRoles": optional_roles,
        "notApplicableRoles": not_applicable_roles,
        "availableRoles": available_roles,
        "missingRoles": missing_roles,
        "recommendedAvailableRoles": recommended_available_roles,
        "optionalAvailableRoles": optional_available_roles,
        "bestMatches": best_matches,
        "reason": reason,
    }


# FORMAT ITEM FOR FRONTEND

# ============================================================



def format_item(

    item: Optional[Dict[str, Any]]

) -> Optional[Dict[str, Any]]:



    if not item:

        return None



    return {

        "id": item.get("id"),



        "imageUrl": item.get(

            "imageUrl"

        ),



        "category": item.get(

            "category"

        ),



        "articleType": item.get(

            "articleType"

        ) or item.get(

            "article_type"

        ),



        "color": item.get(

            "color"

        ),



        "pattern": item.get(

            "pattern"

        ),



        "fabric": item.get(

            "fabric"

        ),



        "sleeve": item.get(

            "sleeve"

        ),



        "neckline": item.get(

            "neckline"

        ),



        "fit": item.get(

            "fit"

        ),



        "length": item.get(

            "length"

        ),



        "details": item.get(

            "details"

        ),



        "confidence": item.get(

            "confidence"

        ),

    }





# ============================================================

# BUILD EXPLANATION

# ============================================================



def build_explanation(

    candidate: Dict[str, Any],

    occasion: str,

    style: str

) -> str:



    items = []



    if candidate.get("dress"):

        items.append("dress")



    if candidate.get("top"):

        items.append("top")



    if candidate.get("bottom"):

        items.append("bottom")



    if candidate.get("footwear"):

        items.append("footwear")



    if candidate.get("accessory"):

        items.append("accessory")



    item_text = ", ".join(items)



    return (

        f"This outfit uses your closet pieces for a "

        f"{style.replace('_', ' ')} look suitable for "

        f"{occasion}. The pieces were selected using "

        f"article compatibility, color coordination, "

        f"and occasion/style matching."

    )





# ============================================================

# MAIN PUBLIC FUNCTION

# ============================================================



def generate_recommendation(

    closet: List[Dict[str, Any]],

    occasion: str = "casual",

    style: str = "casual",

    role: str = "Full Outfit",

    message: str = "",

    selected_item: Optional[Dict[str, Any]] = None,

    body_type: Optional[str] = None,

    undertone: Optional[str] = None,

) -> Dict[str, Any]:



    if not isinstance(closet, list) or not closet:



        return {

            "success": False,

            "reason": "Closet is empty.",

            "items": [],

            "selectedItems": [],

            "missingItems": [],

            "score": 0,

        }



    occasion = normalize_occasion(

        occasion

    )



    style = normalize_style(

        style

    )

    # --------------------------------------------------------

    # Resolve the selected item against the ACTUAL closet.

    # This prevents a stale or fabricated item from being treated

    # as a wardrobe item.

    # --------------------------------------------------------



    if selected_item and selected_item.get("id") is not None:

        selected_id = str(selected_item.get("id"))



        actual_selected_item = next(

            (

                item

                for item in closet

                if item.get("id") is not None

                and str(item.get("id")) == selected_id

            ),

            None,

        )



        selected_item = actual_selected_item



    # --------------------------------------------------------

    # Build candidate outfits

    # --------------------------------------------------------



    candidates = build_candidates(

        closet=closet,

        occasion=occasion,

        style=style,

        selected_item=selected_item,

    )



    # --------------------------------------------------------

    # V13 outfit-level reranking

    #

    # Only complete candidates are sent through V13.

    # The actual selected closet item is used as context when

    # one exists. No wardrobe item is invented.

    # --------------------------------------------------------



    if candidates:



        v13_context_item = (

            selected_item

            if isinstance(selected_item, dict)

            else {}

        )



        scored_candidates = []



        for candidate in candidates:



            scored = score_v13_outfit_candidate(

                outfit=candidate,

                uploaded_item=v13_context_item,

                requested_item=role,

                requested_style=style,

                requested_occasion=occasion,

                body_type=body_type,

                undertone=undertone,

            )



            if isinstance(scored, dict):

                scored_candidates.append(scored)



        if scored_candidates:



            scored_candidates.sort(

                key=lambda candidate:

                    candidate.get(

                        "v13_score",

                        candidate.get("score", 0)

                    ),

                reverse=True,

            )



            candidates = scored_candidates



    # --------------------------------------------------------

    # If no complete candidate exists, construct the

    # strongest partial outfit from available pieces.

    # --------------------------------------------------------



    if not candidates:



        roles = {

            "top": [],

            "bottom": [],

            "dress": [],

            "footwear": [],

            "accessory": [],

        }



        for item in closet:



            detected = detect_role(item)



            if detected in roles:

                roles[detected].append(item)



        selected = []



        # If the user selected a real closet item, keep that exact item

        # in the partial outfit as well.

        if selected_item:

            selected_role = detect_role(selected_item)



            if selected_role in roles:

                selected.append(selected_item)



        if selected_item and detect_role(selected_item) == "dress":

            # A selected dress is already the main garment.

            pass



        else:



            if roles["top"]:

                if not (

                    selected_item

                    and detect_role(selected_item) == "top"

                ):

                    selected.append(

                        max(

                            roles["top"],

                            key=lambda item:

                                item_context_score(

                                    item,

                                    "top",

                                    occasion,

                                    style

                                )

                        )

                    )



            if roles["bottom"]:

                if not (

                    selected_item

                    and detect_role(selected_item) == "bottom"

                ):

                    selected.append(

                        max(

                            roles["bottom"],

                            key=lambda item:

                                item_context_score(

                                    item,

                                    "bottom",

                                    occasion,

                                    style

                                )

                        )

                    )



        if roles["footwear"]:

            if not (

                selected_item

                and detect_role(selected_item) == "footwear"

            ):

                selected.append(

                    max(

                        roles["footwear"],

                        key=lambda item:

                            item_context_score(

                                item,

                                "footwear",

                                occasion,

                                style

                            )

                    )

                )



        if roles["accessory"]:

            if not (

                selected_item

                and detect_role(selected_item) == "accessory"

            ):

                selected.append(

                    max(

                        roles["accessory"],

                        key=lambda item:

                            item_context_score(

                                item,

                                "accessory",

                                occasion,

                                style

                            )

                    )

                )



        missing = []



        formatted_items = [

            format_item(item)

            for item in selected

        ]



        return {

            "success": True,

            "occasion": occasion,

            "style": style,

            "role": role,

            "score": 0,

            "items": formatted_items,

            "selectedItems": formatted_items,

            "missingItems": missing,

            "explanation": (

                "A partial outfit was created from the "

                "available closet pieces."

            ),

        }



    # --------------------------------------------------------

    # BEST CANDIDATE

    # --------------------------------------------------------



    best = candidates[0]



    selected_items = []



    for key in [

        "dress",

        "top",

        "bottom",

        "footwear",

        "accessory",

    ]:



        item = best.get(key)



        if item:



            selected_items.append(

                format_item(item)

            )

      # --------------------------------------------------------

    # Dynamic completion analysis

    # --------------------------------------------------------



    completion = analyze_outfit_completion(

        closet=closet,

        selected_item=selected_item,

        occasion=occasion,

        style=style,

    )



    # --------------------------------------------------------

    # Dynamic completion priority

    # --------------------------------------------------------



    completion_priority = calculate_completion_priority(

        completion=completion,

        selected_item=selected_item,

        occasion=occasion,

        style=style,

    )



    # --------------------------------------------------------

    # Build genuinely missing items

    # --------------------------------------------------------



    missing_items = []



    for missing_role in completion.get(

        "missingRoles",

        []

    ):

        missing_items.append({

            "role": missing_role,

            "reason": (

                f"No suitable {missing_role} was found in the "

                f"current closet for this outfit."

            ),

        })



    # --------------------------------------------------------

    # Return

    # --------------------------------------------------------



    result = {

        "success": True,



        "completion": completion,



        "completionPriority": completion_priority,



        "occasion": occasion,



        "style": style,



        "role": role,



        "score": round(

            best.get(

                "v13_score",

                best.get("score", 0)

            ),

            2

        ),



        "v13Score": round(

            best.get(

                "v13_score",

                best.get("score", 0)

            ),

            2

        ),



        "v13Breakdown": best.get(

            "v13_breakdown",

            {}

        ),



        "items": selected_items,



        "selectedItems": selected_items,



        "missingItems": missing_items,



        "explanation": build_explanation(

            best,

            occasion,

            style

        ),



        # Useful for later "Show Another"

        "candidateCount": len(

            candidates

        ),

    }



    return result





# ============================================================

# DYNAMIC COMPLETION PRIORITY

# ============================================================



def calculate_completion_priority(
    completion,
    selected_item,
    occasion,
    style
):
    """
    Dynamically rank outfit completion roles.

    Priority considers:
    - structural importance of the role
    - whether a suitable closet item exists
    - occasion/style context
    - compatibility with the selected anchor item
    - compatibility with the other already-available outfit pieces

    This intentionally does NOT use a fixed top -> bottom -> shoes order.
    """

    if not completion:
        return []

    role_status = completion.get(
        "roleStatus",
        {}
    )

    best_matches = completion.get(
        "bestMatches",
        {}
    )

    anchor_role = completion.get(
        "anchorRole"
    )

    anchor_item = selected_item

    priority_candidates = []

    # ------------------------------------------------------------
    # Build the current outfit context from the actual closet.
    #
    # The selected item is the anchor. Other roles come only from
    # bestMatches, which were already found in the actual closet.
    # ------------------------------------------------------------

    outfit_context = {}

    if anchor_item and anchor_role:
        outfit_context[anchor_role] = anchor_item

    for role, item in best_matches.items():
        if item:
            outfit_context[role] = item

    # ------------------------------------------------------------
    # Rank every applicable completion role.
    # ------------------------------------------------------------

    for role, status in role_status.items():

        if role == anchor_role:
            continue

        if status == "not_applicable":
            continue

        candidate_item = best_matches.get(role)

        # --------------------------------------------------------
        # Structural state
        # --------------------------------------------------------

        if status == "required":
            state_score = 100.0
        elif status == "recommended":
            state_score = 50.0
        elif status == "optional":
            state_score = 15.0
        else:
            state_score = 0.0

        # --------------------------------------------------------
        # Availability
        # --------------------------------------------------------

        availability_score = 20.0 if candidate_item else 0.0

        # --------------------------------------------------------
        # Occasion/style/context quality
        # --------------------------------------------------------

        context_score = 0.0

        if candidate_item:
            context_score = item_context_score(
                candidate_item,
                role,
                occasion,
                style
            )

        # --------------------------------------------------------
        # Compatibility with the complete current context.
        #
        # Do not only compare against the selected item.
        # Compare the candidate against every other real closet
        # piece currently participating in the outfit.
        # --------------------------------------------------------

        pair_scores = []

        if candidate_item:

            for other_role, other_item in outfit_context.items():

                if other_role == role:
                    continue

                if not other_item:
                    continue

                pair_scores.append(
                    color_combo_score(
                        candidate_item,
                        other_item
                    )
                )

            if pair_scores:
                compatibility_score_value = (
                    sum(pair_scores) / len(pair_scores)
                )
            else:
                compatibility_score_value = 0.0

        else:
            compatibility_score_value = 0.0

        # --------------------------------------------------------
        # Extra compatibility signal for role relationships.
        #
        # This uses the existing outfit compatibility engine when
        # enough role information exists, without imposing a fixed
        # category order.
        # --------------------------------------------------------

        outfit_compatibility_score = 0.0

        if candidate_item:

            context_top = outfit_context.get("top")
            context_bottom = outfit_context.get("bottom")
            context_footwear = outfit_context.get("footwear")
            context_accessory = outfit_context.get("accessory")

            if role == "top":
                context_top = candidate_item
            elif role == "bottom":
                context_bottom = candidate_item
            elif role == "footwear":
                context_footwear = candidate_item
            elif role == "accessory":
                context_accessory = candidate_item
            elif role == "dress":
                # Dresses are one-piece garments, so their pairwise
                # color compatibility above remains the meaningful
                # completion signal here.
                pass

            outfit_compatibility_score = compatibility_score(
                context_top,
                context_bottom,
                context_footwear,
                context_accessory,
                occasion,
                style
            )

        priority_score = (
            state_score
            + availability_score
            + context_score
            + compatibility_score_value
            + outfit_compatibility_score
        )

        priority_candidates.append({
            "role": role,
            "status": status,
            "priorityScore": round(
                priority_score,
                2
            ),
            "hasClosetMatch": bool(
                candidate_item
            ),
            "bestMatch": candidate_item,
            "contextScore": round(
                context_score,
                2
            ),
            "compatibilityScore": round(
                compatibility_score_value,
                2
            ),
            "outfitCompatibilityScore": round(
                outfit_compatibility_score,
                2
            ),
        })

    priority_candidates.sort(
        key=lambda x: x["priorityScore"],
        reverse=True
    )

    return priority_candidates
