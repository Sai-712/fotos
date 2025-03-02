/** @jsxImportSource react */
import { GoogleOAuthProvider } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const GoogleAuthConfig: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Client ID is missing. Make sure it's defined in the .env file.");
    return null;
  }

  console.log("GOOGLE_CLIENT_ID:", GOOGLE_CLIENT_ID);

  return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{children}</GoogleOAuthProvider>;
};
