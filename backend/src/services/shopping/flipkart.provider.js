import axios from "axios";

/* =========================================================
   FLIPKART SHOPPING PROVIDER

   Required environment variables:

   FLIPKART_AFFILIATE_ID
   FLIPKART_AFFILIATE_TOKEN
   ========================================================= */


export async function searchFlipkartProducts(
  missingItem = {}
) {
  if (
    process.env.FLIPKART_SHOPPING_ENABLED !==
    "true"
  ) {
    return {
      success: false,
      enabled: false,
      products: [],
      message:
        "Flipkart shopping provider is disabled.",
    };
  }


  const affiliateId =
    process.env.FLIPKART_AFFILIATE_ID;

  const affiliateToken =
    process.env.FLIPKART_AFFILIATE_TOKEN;


  if (
    !affiliateId ||
    !affiliateToken
  ) {
    return {
      success: false,
      enabled: true,
      products: [],
      message:
        "Flipkart affiliate credentials are not configured.",
    };
  }


  const query =
    missingItem.searchQuery ||
    missingItem.name;


  if (!query) {
    return {
      success: false,
      enabled: true,
      products: [],
      message:
        "Flipkart search query is empty.",
    };
  }


  const response =
    await axios.get(
      "https://affiliate-api.flipkart.net/affiliate/1.0/search.json",
      {
        params: {
          query,
          resultCount: 10,
        },

        headers: {
          "Fk-Affiliate-Id":
            affiliateId,

          "Fk-Affiliate-Token":
            affiliateToken,
        },

        timeout: 20000,
      }
    );


  const list =
    response.data?.productInfoList ||
    [];


  const products =
    list.map(
      (entry) => {
        const product =
          entry?.productBaseInfoV1 ||
          entry?.productBaseInfo ||
          {};


        const imageUrls =
          product?.imageUrls ||
          {};


        const image =
          imageUrls["400x400"] ||
          imageUrls["200x200"] ||
          imageUrls["unknown"] ||
          null;


        const price =
          product?.price?.sellingPrice ??
          product?.price?.sellingPriceValue ??
          null;


        const url =
          product?.productUrl ||
          product?.productURL ||
          product?.productUrlWithTrackingId ||
          null;


        return {
          provider:
            "flipkart",

          store:
            "Flipkart",

          id:
            product?.productId ||
            null,

          name:
            product?.title ||
            "Flipkart product",

          price:
            price !== null
              ? Number(price)
              : null,

          currency:
            "INR",

          image,

          url,

          available:
            true,
        };
      }
    );


  return {
    success: true,
    enabled: true,
    products,
  };
}