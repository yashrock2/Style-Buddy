import { searchProducts } from "./product.provider.js";

async function testProductSearch() {
  try {
    console.log("======================================");
    console.log("🧪 STYLEBUDDY PRODUCT CSV TEST");
    console.log("======================================");

    const result = await searchProducts({
      name: "Black Relaxed Fit Jeans",
      category: "Bottomwear",
      articleType: "Jeans",
      color: "Black",
      occasion: "College",
      style: "Casual",
      searchQuery: "black relaxed fit jeans",
    });

    console.log("\n======================================");
    console.log("📦 SEARCH RESULT");
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

testProductSearch();