import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user]);

  return (
    <div style={{ maxWidth: 500, margin: "80px auto", padding: 24 }}>
      <h2>Selamat datang, {userData?.name ?? user?.email}!</h2>
      <p>Email: {user?.email}</p>
      <button onClick={() => navigate("/order")}
  style={{ padding: "8px 16px", background: "#e25822", color: "white", border: "none", borderRadius: 6, cursor: "pointer", marginRight: 8 }}>
  Buat Burger
</button>
      <button onClick={() => signOut(auth)}
        style={{ padding: "8px 16px", background: "#e25822", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
        Keluar
      </button>
    </div>
  );
}