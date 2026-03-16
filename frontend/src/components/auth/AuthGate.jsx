import { useUser } from "@clerk/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

function AuthGate({ children }) {
  const { isLoaded, isSignedIn } = useUser();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    if (loading) return;
    if (!user) return;

    const path = location.pathname;
    const authPages = ["/login", "/signup"];

    // Ignore auth pages to allow Clerk's own flows
    if (authPages.includes(path)) return;

    console.log("AUTH GATE → path:", path, "role:", user.role, "workspace:", user.workspace);

    // ROLE CHECK
    if (!user.role && path !== "/select-role") {
      navigate("/select-role", { replace: true });
      return;
    }

    // WORKSPACE CHECK
    if (user.role && !user.workspace) {
      if (user.role === "admin" && path !== "/create-workspace") {
        navigate("/create-workspace", { replace: true });
        return;
      }
      if (user.role === "teacher" && path !== "/join-workspace") {
        navigate("/join-workspace", { replace: true });
        return;
      }
    }
  }, [isLoaded, isSignedIn, loading, user, location.pathname, navigate]);

  return children;
}

export default AuthGate;
