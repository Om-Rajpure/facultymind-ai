import { useUser } from "@clerk/react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function AuthRedirectGate() {
  const { isLoaded, isSignedIn } = useUser();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return;
    if (loading) return;
    if (!user) return;

    // ROLE CHECK
    if (!user.role) {
      navigate("/select-role", { replace: true });
      return;
    }

    // WORKSPACE CHECK
    if (!user.workspace) {
      if (user.role === "admin") {
        navigate("/create-workspace", { replace: true });
        return;
      }
      if (user.role === "teacher") {
        navigate("/join-workspace", { replace: true });
        return;
      }
    }

    // DASHBOARD ACCESS
    if (user.role === "admin") {
      navigate("/admin-dashboard", { replace: true });
      return;
    }
    if (user.role === "teacher") {
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [isLoaded, isSignedIn, loading, user]);

  return null;
}

export default AuthRedirectGate;
