/* =========================================================
   MYNTRA SHOPPING PROVIDER

   We keep Myntra behind the same provider interface.

   IMPORTANT:
   Do NOT scrape Myntra.

   The currently published Myntra developer documentation
   is focused on Seller API functionality. We will connect
   this adapter to an authorized Myntra/partner product feed
   when the appropriate access is available.
   ========================================================= */


export async function searchMyntraProducts(
  missingItem = {}
) {
  if (
    process.env.MYNTRA_SHOPPING_ENABLED !==
    "true"
  ) {
    return {
      success: false,
      enabled: false,
      products: [],
      message:
        "Myntra shopping provider is disabled.",
    };
  }


  return {
    success: false,

    enabled: true,

    products: [],

    message:
      "Myntra product search requires an authorized product/partner API connection.",
  };
}