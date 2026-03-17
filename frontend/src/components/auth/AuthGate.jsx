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

    console.log("AUTH STATE:", {
      role: user.role,
      workspace: user.workspace,
      profileComplete: !!(user.age && user.department && user.experience && user.institution)
    });

    // 2. Determine Profile Status
    const isProfileComplete = !!(user.age && user.department && user.experience && user.institution);

    // 3. FULL REDIRECT PRIORITY LOGIC
    
    // Priority 1: Profile incomplete -> /profile-setup
    if (!isProfileComplete) {
      if (path !== "/profile-setup") {
        console.log("AUTH GATE → Redirecting to /profile-setup");
        navigate("/profile-setup", { replace: true });
      }
      return;
    }

    // Priority 2: Profile complete but role missing -> /select-role
    if (!user.role) {
      if (path !== "/select-role") {
        console.log("AUTH GATE → Redirecting to /select-role");
        navigate("/select-role", { replace: true });
      }
      return;
    }

    // Priority 3: Role exists but workspace missing
    if (!user.workspace) {
      if (user.role === "admin") {
        if (path !== "/create-workspace") {
          console.log("AUTH GATE → Redirecting to /create-workspace");
          navigate("/create-workspace", { replace: true });
        }
        return;
      }

      if (user.role === "teacher") {
        if (path !== "/join-workspace") {
          console.log("AUTH GATE → Redirecting to /join-workspace");
          navigate("/join-workspace", { replace: true });
        }
        return;
      }
    }

    // Priority 4: Everything complete -> Dashboards
    // Only redirect if on root or onboarding pages
    const onboardingPages = ["/", "/profile-setup", "/select-role", "/create-workspace", "/join-workspace"];
    if (onboardingPages.includes(path)) {
      if (user.role === "admin") {
        console.log("AUTH GATE → Redirecting to /admin-dashboard");
        navigate("/admin-dashboard", { replace: true });
      } else if (user.role === "teacher") {
        console.log("AUTH GATE → Redirecting to /dashboard");
        navigate("/dashboard", { replace: true });
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
