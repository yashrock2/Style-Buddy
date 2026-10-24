import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({});

async function testGemini() {
  try {
    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: "Say hello to StyleBuddy in one short sentence.",
    });

    console.log("Gemini response:");
    console.log(interaction.output_text);
  } catch (error) {
    console.error("Gemini test failed:");
    console.error(error);
  }
}

testGemini();