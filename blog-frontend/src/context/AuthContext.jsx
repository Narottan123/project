"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/service/api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user session on initial mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("blog_token");
        const storedUser = localStorage.getItem("blog_user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify with backend
          try {
            const res = await authApi.me();
            if (res.data?.success) {
              setUser(res.data.data);
              localStorage.setItem("blog_user", JSON.stringify(res.data.data));
            }
          } catch {
            // Token might be expired
            localStorage.removeItem("blog_token");
            localStorage.removeItem("blog_user");
            setUser(null);
            setToken(null);
          }
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const res = await authApi.login(credentials);
      if (res.data?.success) {
        const { user: userData, tokens } = res.data.data;
        setUser(userData);
        setToken(tokens.accessToken);
        localStorage.setItem("blog_token", tokens.accessToken);
        localStorage.setItem("blog_user", JSON.stringify(userData));

        toast.success(`Welcome back, ${userData.name}!`);
        if (userData.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/");
        }
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const res = await authApi.register(userData);
      if (res.data?.success) {
        const { user: newUser, tokens } = res.data.data;
        setUser(newUser);
        setToken(tokens.accessToken);
        localStorage.setItem("blog_token", tokens.accessToken);
        localStorage.setItem("blog_user", JSON.stringify(newUser));

        toast.success("Account created successfully!");
        router.push("/");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = async (socialData) => {
    try {
      setLoading(true);
      const res = await authApi.socialLogin(socialData);
      if (res.data?.success) {
        const { user: userData, tokens } = res.data.data;
        setUser(userData);
        setToken(tokens.accessToken);
        localStorage.setItem("blog_token", tokens.accessToken);
        localStorage.setItem("blog_user", JSON.stringify(userData));

        toast.success(`Logged in with ${socialData.provider}!`);
        router.push("/");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Social login failed.";
      toast.error(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("blog_token");
      localStorage.removeItem("blog_user");
      toast.info("Logged out successfully");
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.me();
      if (res.data?.success) {
        setUser(res.data.data);
        localStorage.setItem("blog_user", JSON.stringify(res.data.data));
      }
    } catch (e) {
      console.error("Refresh user error:", e);
    }
  };

  const setAuthSession = useCallback((newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("blog_token", newToken);
    localStorage.setItem("blog_user", JSON.stringify(newUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        socialLogin,
        logout,
        refreshUser,
        setAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
