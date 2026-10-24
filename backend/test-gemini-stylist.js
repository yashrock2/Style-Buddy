import "dotenv/config";
import { generateGeminiStylistResponse } from "./src/services/gemini-stylist.service.js";

const testCloset = [
  {
    id: "item-1",
    name: "Blue T-Shirt",
    color: "Blue",
    articleType: "Tshirts",
    category: "Top",
    pattern: "Solid",
    fabric: "Cotton",
  },
  {
    id: "item-2",
    name: "Black Jeans",
    color: "Black",
    articleType: "Jeans",
    category: "Bottom",
    pattern: "Solid",
    fabric: "Denim",
  },
  {
    id: "item-3",
    name: "White Sneakers",
    color: "White",
    articleType: "Sneakers",
    category: "Footwear",
    pattern: "Solid",
    fabric: null,
  },
];

const selectedItem = testCloset[0];

async function testGeminiStylist() {
  try {
    const result = await generateGeminiStylistResponse({
      message:
        "Create a casual college outfit around my selected wardrobe item.",

      closet: testCloset,

      selectedItem: selectedItem,

      occasion: "College",

      style: "Casual",

      temperatureC: 29,

      weatherCondition: "clear",
    });

    console.log("\n===== GEMINI SELECTED ITEM TEST =====\n");

    console.log("Selected item:");
    console.log(JSON.stringify(selectedItem, null, 2));

    console.log("\nGemini result:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n===== GEMINI SELECTED ITEM TEST FAILED =====\n");

    console.error(error);
  }
}

testGeminiStylist();