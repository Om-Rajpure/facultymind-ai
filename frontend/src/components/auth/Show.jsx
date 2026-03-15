import { useAuth } from "@clerk/react";

/**
 * Custom Show component to handle Clerk authentication visibility.
 * Following Rule 4: Use <Show when="signed-in"> or <Show when="signed-out">.
 */
const Show = ({ when, children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;

  if (when === "signed-in" && isSignedIn) {
    return <>{children}</>;
  }

  if (when === "signed-out" && !isSignedIn) {
    return <>{children}</>;
  }

  return null;
};

export default Show;
