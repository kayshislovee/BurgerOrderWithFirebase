import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setChecking(false);
      return;
    }
    getDoc(doc(db, "users", user.uid)).then(snap => {
      setIsAdmin(snap.exists() && snap.data().role === "admin");
      setChecking(false);
    });
  }, [user]);

  return { isAdmin, checking };
}