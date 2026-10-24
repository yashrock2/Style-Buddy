import axios from "axios";

const AI_RECOMMENDATION_URL =
  process.env.AI_RECOMMENDATION_URL ||
  "http://127.0.0.1:8000/recommend";

export async function getAiRecommendation({
  closet,
  message = "",
  selectedItem = null,
  occasion = "casual",
  style = "casual",
  role = "Full Outfit",
  temperatureC = null,
  weatherCondition = "clear",
  bodyType = null,
  undertone = null,
}) {
  try {
    const response = await axios.post(
      AI_RECOMMENDATION_URL,
      {
        closet,
        message,
        selectedItem,
        occasion,
        style,
        role,
        temperatureC,
        weatherCondition,
        bodyType,
        undertone,
      },
      {
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "AI recommendation service error:",
      error?.response?.data || error.message
    );

    throw new Error(
      "Unable to generate AI recommendation."
    );
  }
}

export async function scoreV13Outfit({
  outfit,
  bodyType = null,
  undertone = null,
  style = "casual",
  occasion = "casual",
  requestedItem = null,
  selectedItem = null,
}) {
  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/v13/score-outfit",
      {
        outfit,
        bodyType,
        undertone,
        style,
        occasion,
        requestedItem,
        selectedItem,
      },
      {
        timeout: 30000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "V13 outfit scoring service error:",
      error?.response?.data || error.message
    );

    throw new Error(
      "Unable to score outfit with V13."
    );
  }
}

