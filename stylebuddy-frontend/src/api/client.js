const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("stylebuddy_access_token");

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // If the access token has expired, try to refresh it.
  if (response.status === 401 && token && path !== "/auth/refresh") {
    const refreshToken = localStorage.getItem("stylebuddy_refresh_token");

    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken,
          }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();

          localStorage.setItem(
            "stylebuddy_access_token",
            data.accessToken
          );

          if (data.refreshToken) {
            localStorage.setItem(
              "stylebuddy_refresh_token",
              data.refreshToken
            );
          }

          headers.set(
            "Authorization",
            `Bearer ${data.accessToken}`
          );

          response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
          });
        } else {
          localStorage.removeItem("stylebuddy_access_token");
          localStorage.removeItem("stylebuddy_refresh_token");
        }
      } catch {
        localStorage.removeItem("stylebuddy_access_token");
        localStorage.removeItem("stylebuddy_refresh_token");
      }
    }
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    try {
      const data = await response.json();

      message =
        data.message ||
        data.detail ||
        message;
    } catch {
      // Keep the default message.
    }

    const error = new Error(message);
    error.status = response.status;

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}