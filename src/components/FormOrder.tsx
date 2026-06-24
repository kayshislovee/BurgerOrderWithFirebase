import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import FormDataPemesan from "./FormProfil";
import AuthModal from "./LoginRegister";

type OrderForm = {
  namaPemesan: string;
  noHp: string;
  alamat: string;
  kota: string;
};

export default function FormOrder({
  layers,
  onKembali,
  onSelesai,
}: {
  layers: string[];
  onKembali: () => void;
  onSelesai: () => void;
}) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (data: OrderForm) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        email: user.email,
        ...data,
        layers,
        createdAt: serverTimestamp(),
      });
      onSelesai();
    } catch (e) {
      alert("Gagal menyimpan order.");
    }
    setSaving(false);
  };

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      <button onClick={onKembali} style={{
        background: "none", border: "1px solid #ccc",
        borderRadius: 6, padding: "6px 12px", cursor: "pointer", marginBottom: 16
      }}>
        ← Kembali
      </button>
      <h2 style={{ margin: "0 0 8px" }}>Data Pemesan</h2>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Isian burger: {layers.join(", ")}
      </p>
      {saving ? (
        <p>Memproses...</p>
      ) : (
        <FormDataPemesan onSubmit={onSubmit} />
      )}
    </div>
  );
}