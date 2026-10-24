import axios from "axios";

/* =========================================================
   AMAZON SHOPPING PROVIDER

   Uses Amazon Creators API.

   Required environment variables:

   AMAZON_SHOPPING_ENABLED=true

   AMAZON_CREATORS_CLIENT_ID=
   AMAZON_CREATORS_CLIENT_SECRET=
   AMAZON_CREATORS_PARTNER_TAG=
   AMAZON_CREATORS_CREDENTIAL_VERSION=3.2

   IMPORTANT:
   - Credentials stay on backend only.
   - Never expose these values to React/frontend.
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const AMAZON_MARKETPLACE =
  "www.amazon.in";

const AMAZON_API_BASE =
  "https://creatorsapi.amazon";

const AMAZON_CREDENTIAL_VERSION =
  process.env.AMAZON_CREATORS_CREDENTIAL_VERSION ||
  "3.2";


/* =========================================================
   TOKEN CACHE
   ========================================================= */

let cachedToken = null;
let cachedTokenExpiresAt = 0;


/* =========================================================
   GET AMAZON TOKEN ENDPOINT
   ========================================================= */

function getAmazonTokenUrl() {
  switch (
    String(AMAZON_CREDENTIAL_VERSION).trim()
  ) {
    case "3.1":
      return "https://api.amazon.com/auth/o2/token";

    case "3.2":
      return "https://api.amazon.co.uk/auth/o2/token";

    case "3.3":
      return "https://api.amazon.co.jp/auth/o2/token";

    default:
      throw new Error(
        `Unsupported Amazon Creators API credential version: ${AMAZON_CREDENTIAL_VERSION}`
      );
  }
}


/* =========================================================
   GET ACCESS TOKEN
   ========================================================= */

async function getAmazonAccessToken() {
  const now =
    Date.now();


  /* -------------------------------------------------------
     Reuse cached token when still valid.
     ------------------------------------------------------- */

  if (
    cachedToken &&
    now < cachedTokenExpiresAt
  ) {
    return cachedToken;
  }


  /* -------------------------------------------------------
     Read credentials.
     ------------------------------------------------------- */

  const clientId =
    process.env.AMAZON_CREATORS_CLIENT_ID;

  const clientSecret =
    process.env.AMAZON_CREATORS_CLIENT_SECRET;


  if (
    !clientId ||
    !clientSecret
  ) {
    throw new Error(
      "Amazon Creators API credentials are not configured."
    );
  }


  const tokenUrl =
    getAmazonTokenUrl();


  /* -------------------------------------------------------
     Request OAuth access token.
     ------------------------------------------------------- */

  const response =
    await axios.post(
      tokenUrl,
      {
        grant_type:
          "client_credentials",

        client_id:
          clientId,

        client_secret:
          clientSecret,

        scope:
          "creatorsapi::default",
      },
      {
        headers: {
          "Content-Type":
            "application/json",
        },

        timeout: 15000,
      }
    );


  const accessToken =
    response.data?.access_token ||
    null;


  const expiresIn =
    Number(
      response.data?.expires_in ||
      3600
    );


  if (!accessToken) {
    throw new Error(
      "Amazon did not return an access token."
    );
  }


  /* -------------------------------------------------------
     Cache token slightly before actual expiry.
     ------------------------------------------------------- */

  cachedToken =
    accessToken;


  cachedTokenExpiresAt =
    Date.now() +
    Math.max(
      60,
      expiresIn - 60
    ) *
      1000;


  return cachedToken;
}


/* =========================================================
   NORMALIZE AMAZON PRODUCT
   ========================================================= */

function normalizeAmazonProduct(
  item
) {
  if (!item) {
    return null;
  }


  /* -------------------------------------------------------
     Amazon title
     ------------------------------------------------------- */

  const title =
    item?.itemInfo?.title?.displayValue ||
    item?.itemInfo?.title ||
    "Amazon product";


  /* -------------------------------------------------------
     Amazon image
     ------------------------------------------------------- */

  const image =
    item?.images?.primary?.medium?.url ||
    item?.images?.primary?.small?.url ||
    item?.images?.primary?.large?.url ||
    null;


  /* -------------------------------------------------------
     Amazon price

     Creators API currently exposes OffersV2.
     Keep the older offers path as a defensive fallback.
     ------------------------------------------------------- */

  const price =
    item?.offersV2?.listings?.[0]
      ?.price?.amount ??
    item?.offers?.listings?.[0]
      ?.price?.amount ??
    null;


  /* -------------------------------------------------------
     Product URL
     ------------------------------------------------------- */

  const url =
    item?.detailPageURL ||
    null;


  return {
    provider:
      "amazon",

    store:
      "Amazon",

    id:
      item?.asin ||
      null,

    name:
      title,

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


/* =========================================================
   SEARCH AMAZON PRODUCTS
   ========================================================= */

export async function searchAmazonProducts(
  missingItem = {}
) {
  /* -------------------------------------------------------
     Provider disabled?
     ------------------------------------------------------- */

  if (
    process.env.AMAZON_SHOPPING_ENABLED !==
    "true"
  ) {
    return {
      success: false,
      enabled: false,
      products: [],
      message:
        "Amazon shopping provider is disabled.",
    };
  }


  /* -------------------------------------------------------
     Partner tag
     ------------------------------------------------------- */

  const partnerTag =
    process.env.AMAZON_CREATORS_PARTNER_TAG;


  if (!partnerTag) {
    return {
      success: false,
      enabled: true,
      products: [],
      message:
        "Amazon Partner Tag is not configured.",
    };
  }


  /* -------------------------------------------------------
     Search query

     IMPORTANT:
     This query comes from the AI-determined
     missing item.

     This provider does NOT decide what is missing.
     ------------------------------------------------------- */

  const searchQuery =
    missingItem.searchQuery ||
    missingItem.name;


  if (!searchQuery) {
    return {
      success: false,
      enabled: true,
      products: [],
      message:
        "Amazon search query is empty.",
    };
  }


  /* -------------------------------------------------------
     Get access token
     ------------------------------------------------------- */

  const accessToken =
    await getAmazonAccessToken();


  /* -------------------------------------------------------
     SearchItems payload
     ------------------------------------------------------- */

  const payload = {
    keywords:
      searchQuery,

    searchIndex:
      "All",

    itemPage:
      1,

    itemCount:
      10,

    partnerTag,

    marketplace:
      AMAZON_MARKETPLACE,

    resources: [
      "images.primary.medium",
      "images.primary.small",

      "itemInfo.title",

      "offersV2.listings.price",
      "offersV2.listings.availability",
    ],
  };


  /* -------------------------------------------------------
     Amazon Creators API request
     ------------------------------------------------------- */

  let response;


  try {
    response =
      await axios.post(
        `${AMAZON_API_BASE}/catalog/v1/searchItems`,
        payload,
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",

            "x-marketplace":
              AMAZON_MARKETPLACE,
          },

          timeout:
            20000,
        }
      );
  } catch (error) {
    const amazonError =
      error?.response?.data;

    console.error(
      "Amazon Creators API error:",
      amazonError ||
        error?.message ||
        error
    );

    return {
      success: false,
      enabled: true,
      products: [],
      message:
        "Amazon product search failed.",
      error:
        amazonError ||
        error?.message ||
        "Unknown Amazon API error.",
    };
  }


  /* -------------------------------------------------------
     Extract products
     ------------------------------------------------------- */

  const items =
    response.data?.searchResult?.items ||
    [];


  const products =
    items
      .map(
        normalizeAmazonProduct
      )
      .filter(Boolean)
      .filter(
        (product) =>
          product.id ||
          product.url
      );


  /* -------------------------------------------------------
     Return normalized products
     ------------------------------------------------------- */

  return {
    success:
      products.length > 0,

    enabled:
      true,

    products,

    query:
      searchQuery,

    message:
      products.length > 0
        ? `Found ${products.length} Amazon products.`
        : "No Amazon products were found.",
  };
}