import React, { useEffect } from "react";
import { useUser } from "@clerk/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLoadingScreen from "./AuthLoadingScreen";

function AuthGate({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Wait for everything to be ready
    if (!isLoaded) return;
    if (!isSignedIn) return;
    if (loading) return;
    if (!user) return;

    const path = location.pathname;
    const authPages = ["/login", "/signup"];

    // 2. Ignore auth pages to allow Clerk's own flows
    if (authPages.includes(path)) return;

    console.log("AUTH GATE → path:", path, "role:", user.role, "workspace:", user.workspace);

    // 3. ROLE CHECK (Highest Priority)
    if (!user.role) {
      if (path !== "/select-role") {
        navigate("/select-role", { replace: true });
      }
      return;
    }

    // 4. WORKSPACE CHECK
    if (!user.workspace) {
      if (user.role === "admin") {
        if (path !== "/create-workspace") {
          navigate("/create-workspace", { replace: true });
        }
        return;
      }

      if (user.role === "teacher") {
        if (path !== "/join-workspace") {
          navigate("/join-workspace", { replace: true });
        }
        return;
      }
    }

    // 5. OPTIONAL DASHBOARD REDIRECT
    // If user completes onboarding but lands on "/"
    if (user.workspace && path === "/") {
      if (user.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
        return;
      }
      if (user.role === "teacher") {
        navigate("/dashboard", { replace: true });
        return;
      }
    }
  }, [isLoaded, isSignedIn, loading, user, location.pathname, navigate]);

  // 6. Show redirect loader while waiting for backend sync
  if (isSignedIn && (loading || !user)) {
    return <AuthLoadingScreen />;
  }

  return children;
}

export default AuthGate;
