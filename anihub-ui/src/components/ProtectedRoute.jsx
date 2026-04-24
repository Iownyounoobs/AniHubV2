import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "../utils/firebase-config";
import LoadingSpinner from "./LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setIsAuth(!!user);
      setChecking(false);
    });
    return () => unsubscribe();
  }, []);

  if (checking) return <LoadingSpinner message="Loading..." />;
  if (!isAuth) return <Navigate to="/login" replace />;
  return children;
}
