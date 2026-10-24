import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { services, isMockMode } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the logged-in user when the app starts.
  useEffect(() => {
    const token = localStorage.getItem("stylebuddy_access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    services.auth
      .me()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("stylebuddy_access_token");
        localStorage.removeItem("stylebuddy_refresh_token");
        localStorage.removeItem("stylebuddy_current_user_id");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login existing verified user.
  const signIn = async (payload) => {
    const data = await services.auth.login(payload);

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

    localStorage.setItem(
      "stylebuddy_current_user_id",
      data.user.id
    );

    setUser(data.user);

    return data.user;
  };

  // Register a new user.
  // IMPORTANT: registration does NOT log the user in.
  const signUp = async (payload) => {
    const data = await services.auth.register(payload);

    localStorage.setItem(
      "stylebuddy_current_user_id",
      data.userId
    );

    return data;
  };

  // Verify the email OTP.
  const verifyEmail = async (payload) => {
    const data = await services.auth.verifyEmail(payload);

    return data;
  };

  // Logout and revoke the refresh token.
  const signOut = async () => {
    const refreshToken = localStorage.getItem(
      "stylebuddy_refresh_token"
    );

    try {
      if (refreshToken) {
        await services.auth.logout({
          refreshToken,
        });
      }
    } finally {
      localStorage.removeItem("stylebuddy_access_token");
      localStorage.removeItem("stylebuddy_refresh_token");
      localStorage.removeItem("stylebuddy_current_user_id");

      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        verifyEmail,
        signOut,
        isMockMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);