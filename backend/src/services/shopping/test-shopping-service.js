import { searchMissingItem } from "./shopping.service.js";

async function testShoppingService() {
  try {
    console.log("======================================");
    console.log("🧪 STYLEBUDDY SHOPPING SERVICE TEST");
    console.log("======================================");

    // This represents an item that Gemini has already
    // determined is genuinely missing.
    const result = await searchMissingItem({
      missingItem: {
        name: "Black Relaxed Fit Jeans",
        category: "Bottomwear",
        articleType: "Jeans",
        color: "Black",
        style: "Casual",
        occasion: "College",
        searchQuery: "black relaxed fit jeans",
      },
    });

    console.log("\n======================================");
    console.log("🛍️ SHOPPING SERVICE RESULT");
    console.log("======================================");

    console.log(
      JSON.stringify(result, null, 2)
    );

    console.log("\n======================================");
    console.log("✅ TEST COMPLETED");
    console.log("======================================");
  } catch (error) {
    console.error("\n❌ TEST FAILED");
    console.error(error);
  }
}

testShoppingService();