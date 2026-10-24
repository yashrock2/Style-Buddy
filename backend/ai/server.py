from pathlib import Path
import tempfile

from flask import Flask, request, jsonify

from inference import analyze_clothing_image
from recommendation_engine import generate_recommendation

from notebook_engine import (
    get_weather_style_advice,
    score_v13_outfit_candidate,
)

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({
        "success": True,
        "service": "StyleBuddy AI",
        "status": "running",
    })


@app.post("/analyze")
def analyze():

    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "No image was provided."
        }), 400

    uploaded_file = request.files["image"]

    if not uploaded_file.filename:
        return jsonify({
            "success": False,
            "message": "Invalid image filename."
        }), 400

    temp_directory = (
        Path(__file__).resolve().parent / "temp"
    )

    temp_directory.mkdir(
        exist_ok=True
    )

    temp_path = None

    try:

        file_suffix = Path(
            uploaded_file.filename
        ).suffix or ".jpg"

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=file_suffix,
            dir=temp_directory
        ) as temp_file:

            temp_path = Path(temp_file.name)

            uploaded_file.save(
                temp_path
            )

        result = analyze_clothing_image(
            temp_path
        )

        return jsonify({
            "success": True,
            "result": result,
        })

    except Exception as error:

        print(
            "AI analysis error:",
            repr(error)
        )

        return jsonify({
            "success": False,
            "message": "AI analysis failed."
        }), 500

    finally:

        if temp_path and temp_path.exists():
            temp_path.unlink()


@app.post("/recommend")
def recommend():

    try:

        data = request.get_json(silent=True) or {}

        closet = data.get("closet", [])
        occasion = data.get("occasion", "casual")
        style = data.get("style", "casual")
        role = data.get("role", "Full Outfit")

        # User's natural-language request
        message = data.get("message", "")

        # Exact wardrobe item selected/detected by Node
        selected_item = data.get("selectedItem", None)

        # User profile signals for V13 personalization
        body_type = data.get("bodyType", None)
        undertone = data.get("undertone", None)

        temperature_c = data.get("temperatureC", None)
        weather_condition = data.get(
            "weatherCondition",
            "clear"
        )

        print(
            "🌤️ Weather received:",
            temperature_c,
            weather_condition,
            flush=True
        )

        print(
            "💬 User message:",
            message,
            flush=True
        )

        print(
            "👕 Selected item:",
            selected_item,
            flush=True
        )

        if not isinstance(closet, list):
            return jsonify({
                "success": False,
                "message": "Invalid closet data."
            }), 400

        if not closet:
            return jsonify({
                "success": False,
                "message": "Closet is empty."
            }), 400

        # ----------------------------------------------------
        # MAIN RECOMMENDATION ENGINE
        # ----------------------------------------------------

        result = generate_recommendation(
            closet=closet,
            occasion=occasion,
            style=style,
            role=role,
            message=message,
            selected_item=selected_item,
            body_type=body_type,
            undertone=undertone,
        )

        # ----------------------------------------------------
        # WEATHER INTELLIGENCE
        # Weather informs the response but does NOT replace
        # the main recommendation engine.
        # ----------------------------------------------------

        if temperature_c is not None:

            result["weather"] = get_weather_style_advice(
                temperature_c=temperature_c,
                condition=weather_condition,
            )

        print(
            "🤖 Recommendation result:",
            result,
            flush=True
        )

        return jsonify({
            "success": True,
            "outfit": result,
        })

    except Exception as error:

        print(
            "AI recommendation error:",
            repr(error)
        )

        return jsonify({
            "success": False,
            "message": "AI recommendation failed."
        }), 500


@app.post("/v13/score-outfit")
def score_v13_outfit():
    """
    Score an already-selected outfit with V13.

    IMPORTANT:
    - Does NOT select wardrobe items.
    - Does NOT determine missing items.
    - Does NOT trigger shopping.
    - Scores only the exact outfit supplied by the caller.
    """

    try:
        data = request.get_json(silent=True) or {}

        outfit = data.get("outfit")

        if not isinstance(outfit, dict):
            return jsonify({
                "success": False,
                "message": "Invalid outfit data."
            }), 400

        body_type = data.get("bodyType", None)
        undertone = data.get("undertone", None)
        style = data.get("style", "casual")
        occasion = data.get("occasion", "casual")
        requested_item = data.get("requestedItem", None)
        selected_item = data.get("selectedItem", None)

        scored_outfit = score_v13_outfit_candidate(
            outfit=outfit,
            uploaded_item=selected_item,
            requested_item=requested_item,
            requested_style=style,
            requested_occasion=occasion,
            body_type=body_type,
            undertone=undertone,
        )

        if not isinstance(scored_outfit, dict):
            return jsonify({
                "success": False,
                "message": "V13 could not score the outfit."
            }), 500

        return jsonify({
            "success": True,
            "outfit": scored_outfit,
        })

    except Exception as error:
        print(
            "V13 outfit scoring error:",
            repr(error),
            flush=True
        )

        return jsonify({
            "success": False,
            "message": "V13 outfit scoring failed."
        }), 500


if __name__ == "__main__":

    print("=" * 60)
    print("STYLEBUDDY AI SERVER")
    print("=" * 60)
    print(
        "AI service running on http://127.0.0.1:8000"
    )
    print("=" * 60)

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=False,
    )