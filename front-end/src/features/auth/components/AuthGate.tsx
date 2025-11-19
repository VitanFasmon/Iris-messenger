import React from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../../../lib/tokenStore";

const AuthGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const token = getAccessToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default AuthGate;
