"""
StyleBuddy Closet Loader

Loads the authenticated user's closet from PostgreSQL
and converts Prisma ClosetItem records into the format
expected by the AI Fashion Closet recommendation engine.
"""

from typing import Any, Dict, List


def normalize_value(value: Any) -> str:
    """
    Convert database values into clean strings.
    """
    if value is None:
        return ""

    return str(value).strip()


def prisma_item_to_recommendation_item(item: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convert one PostgreSQL ClosetItem record into the
    recommendation-engine format.

    We intentionally preserve the original AI attributes.
    """

    details = item.get("details")

    if not isinstance(details, dict):
        details = {}

    ai_details = details.get("ai", {})

    if not isinstance(ai_details, dict):
        ai_details = {}

    return {
        "id": item.get("id"),

        "imageUrl": normalize_value(
            item.get("imageUrl")
        ),

        "category": normalize_value(
            item.get("category")
        ),

        "articleType": normalize_value(
            item.get("articleType")
        ),

        "color": normalize_value(
            item.get("color")
        ),

        "pattern": normalize_value(
            item.get("pattern")
        ),

        "fabric": normalize_value(
            item.get("fabric")
        ),

        "sleeve": normalize_value(
            item.get("sleeve")
        ),

        "neckline": normalize_value(
            item.get("neckline")
        ),

        "fit": normalize_value(
            item.get("fit")
        ),

        "length": normalize_value(
            item.get("length")
        ),

        "details": details,

        "confidence": item.get("confidence"),

        # Keep the richer AI result available to the
        # recommendation engine without modifying it.
        "ai": ai_details,
    }


def load_user_closet(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Convert all PostgreSQL ClosetItem records into
    recommendation-engine items.
    """

    if not items:
        return []

    return [
        prisma_item_to_recommendation_item(item)
        for item in items
        if isinstance(item, dict)
    ]