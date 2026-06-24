import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, orderBy, getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import FormOrder from "../components/FormOrder";
import AuthModal from "../components/LoginRegister";

type Ingredient = "daging" | "sayur" | "keju" | "tomat" | "saus";

const INGREDIENTS: { id: Ingredient; label: string; color: string }[] = [
  { id: "daging", label: "Daging", color: "brown" },
  { id: "sayur", label: "Sayur", color: "green" },
  { id: "keju", label: "Keju", color: "gold" },
  { id: "tomat", label: "Tomat", color: "red" },
  { id: "saus", label: "Saus", color: "maroon" },
];

export default function BurgerOrder() {
  const { user } = useAuth();
  const [layers, setLayers] = useState<Ingredient[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [step, setStep] = useState<"pilih" | "data" | "selesai">("pilih");

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "users", user.uid)).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    } else {
      setUserData(null);
    }
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("uid", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    }
    setLoadingHistory(false);
  };

  const toggleSidebar = () => {
    if (!showSidebar) fetchHistory();
    setShowSidebar(prev => !prev);
  };

  const addIngredient = (id: Ingredient) => {
    setLayers(prev => [id, ...prev]);
  };

  const removeIngredient = (index: number) => {
    setLayers(prev => prev.filter((_, i) => i !== index));
  };

  const getColor = (id: Ingredient) =>
    INGREDIENTS.find(i => i.id === id)?.color ?? "#ccc";

  const getLabel = (id: Ingredient) =>
    INGREDIENTS.find(i => i.id === id)?.label ?? id;

  if (step === "data") {
    return (
      <FormOrder
        layers={layers}
        onKembali={() => setStep("pilih")}
        onSelesai={() => setStep("selesai")}
      />
    );
  }

  if (step === "selesai") {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 24, textAlign: "center", fontFamily: "sans-serif" }}>
        <p style={{ fontSize: 48 }}>🍔</p>
        <h2>Order Berhasil!</h2>
        <p style={{ color: "#666" }}>Pesanan kamu sedang diproses.</p>
        <button onClick={() => { setStep("pilih"); setLayers([]); }}
          style={{ padding: "10px 24px", background: "#e25822", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
          Order Lagi
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>

      {/* Tombol sidebar */}
      <button onClick={toggleSidebar} style={{
        position: "fixed", top: 16, left: 16,
        background: "#e25822", color: "white", border: "none",
        borderRadius: 8, padding: "8px 16px", cursor: "pointer", zIndex: 100
      }}>
        {user ? "☰ Akun" : "☰ Menu"}
      </button>

      {/* Sidebar */}
      {showSidebar && (
        <div onClick={toggleSidebar} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: 300, background: "white", padding: 24,
            display: "flex", flexDirection: "column", gap: 16,
            overflowY: "auto"
          }}>
            <button onClick={toggleSidebar} style={{
              alignSelf: "flex-end", background: "none", border: "none",
              fontSize: 20, cursor: "pointer"
            }}>✕</button>

            {user ? (
              <>
                <div style={{ background: "#fdf6ec", borderRadius: 8, padding: 16 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>👤 {userData?.name ?? "Pengguna"}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{user.email}</p>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>🧾 Riwayat Order</h3>
                  {loadingHistory && <p style={{ fontSize: 13, color: "#999" }}>Memuat...</p>}
                  {!loadingHistory && history.length === 0 && (
                    <p style={{ fontSize: 13, color: "#999" }}>Belum ada order.</p>
                  )}
                  {history.map((order, i) => (
                    <div key={order.id} style={{
                      background: "#f9f9f9", borderRadius: 8,
                      padding: 12, marginBottom: 8, fontSize: 13
                    }}>
                      <p style={{ margin: "0 0 4px", fontWeight: 600 }}>Order #{i + 1}</p>
                      <p style={{ margin: "0 0 4px", color: "#555" }}>Nama: {order.namaPemesan}</p>
                      <p style={{ margin: 0, color: "#555" }}>Isian: {order.layers?.join(", ")}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#aaa" }}>
                        {order.createdAt?.toDate().toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>

                <button onClick={() => { signOut(auth); setShowSidebar(false); }}
                  style={{
                    marginTop: "auto", padding: 10, background: "#e25822",
                    color: "white", border: "none", borderRadius: 8, cursor: "pointer"
                  }}>
                  Keluar
                </button>
              </>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#555" }}>
                  Login untuk melihat riwayat order kamu.
                </p>
                <button onClick={() => { setShowSidebar(false); setShowAuthModal(true); }}
                  style={{
                    padding: 10, background: "#e25822", color: "white",
                    border: "none", borderRadius: 8, cursor: "pointer"
                  }}>
                  Masuk / Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      <h2 style={{ margin: "0 0 24px" }}>Buat Burger Kamu</h2>

      {/* Visual Burger */}
      <div style={{ background: "#fdf6ec", borderRadius: 12, padding: 24, marginBottom: 24, minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <div style={{ width: 200, height: 40, background: "#D2691E", borderRadius: "50% 50% 10% 10%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 500 }}>
          Roti Atas
        </div>

        {layers.length === 0 && (
          <p style={{ color: "#aaa", fontSize: 13, padding: "16px 0" }}>Belum ada isian</p>
        )}

        {layers.map((layer, i) => (
          <div key={i} onClick={() => removeIngredient(i)}
            title="Klik untuk hapus"
            style={{
              width: 180, height: 28, background: getColor(layer),
              borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontSize: 12,
              cursor: "pointer", userSelect: "none"
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {getLabel(layer)} ✕
          </div>
        ))}

        <div style={{ width: 200, height: 32, background: "#D2691E", borderRadius: "10% 10% 50% 50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 500 }}>
          Roti Bawah
        </div>
      </div>

      {/* Tombol isian */}
      <p style={{ fontSize: 13, color: "#666", marginBottom: 10 }}>Tambah isian (klik layer di burger untuk hapus):</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
        {INGREDIENTS.map(ing => (
          <button key={ing.id} onClick={() => addIngredient(ing.id)}
            style={{
              padding: "8px 16px", background: ing.color, color: "white",
              border: "none", borderRadius: 20, cursor: "pointer", fontSize: 13
            }}>
            + {ing.label}
          </button>
        ))}
      </div>

      {/* Tombol lanjut */}
      <button onClick={() => {
        if (layers.length === 0) return alert("Tambahkan isian burger dulu!");
        setStep("data");
      }} style={{
        width: "100%", padding: 12, background: "#e25822",
        color: "white", border: "none", borderRadius: 8,
        fontSize: 15, cursor: "pointer"
      }}>
        Lanjut →
      </button>
    </div>
  );
}