import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";

type Ingredient = "daging" | "sayur" | "keju" | "tomat" | "saus";

const INGREDIENTS: { id: Ingredient; label: string; color: string }[] = [
  { id: "daging", label: "Daging", color: "brown" },
  { id: "sayur", label: "Sayur", color: "green" },
  { id: "keju", label: "Keju", color: "gold" },
  { id: "tomat", label: "Tomat", color: "red" },
  { id: "saus", label: "Saus", color: "maroon" },
];

export default function BurgerOrder() {
  const [layers, setLayers] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [namaPemesan, setNamaPemesan] = useState("");

  const addIngredient = (id: Ingredient) => {
    setLayers(prev => [id, ...prev]);
    setSaved(false);
  };

  const removeIngredient = (index: number) => {
    setLayers(prev => prev.filter((_, i) => i !== index));
    setSaved(false);
  };

  const handleOrder = async () => {
  if (layers.length === 0) return alert("Tambahkan isian burger dulu!");
  if (!namaPemesan.trim()) return alert("Masukkan nama pemesan dulu!");
  setSaving(true);
  try {
    await addDoc(collection(db, "orders"), {
      uid: auth.currentUser?.uid,
      email: auth.currentUser?.email,  
       namaPemesan,
      layers,
      createdAt: serverTimestamp(),
    });
    setSaved(true);
  } catch (e) {
    alert("Gagal menyimpan order.");
  }
  setSaving(false);
};

  const getColor = (id: Ingredient) =>
    INGREDIENTS.find(i => i.id === id)?.color ?? "#ccc";

  const getLabel = (id: Ingredient) =>
    INGREDIENTS.find(i => i.id === id)?.label ?? id;

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", padding: 24, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Buat Burger Kamu</h2>
        
      </div>

      {/* Visual Burger */}
      <div style={{ background: "#fdf6ec", borderRadius: 12, padding: 24, marginBottom: 24, minHeight: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>

        {/* Roti Atas */}
        <div style={{ width: 200, height: 40, background: "#D2691E", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 500 }}>
          Roti Atas
        </div>

        
        {layers.map((layer, i) => (
          <div key={i} onClick={() => removeIngredient(i)}
            title="Klik untuk hapus"
            style={{
              width: 180, height: 28, background: getColor(layer),
              borderRadius: 6, display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontSize: 12,
              cursor: "pointer", userSelect: "none", transition: "opacity .2s"
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            {getLabel(layer)} ✕
          </div>
        ))}

        {/* Roti Bawah */}
        <div style={{ width: 200, height: 32, background: "#D2691E",  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 500 }}>
          Roti Bawah
        </div>
      </div>    

      <input
  value={namaPemesan}
  onChange={e => setNamaPemesan(e.target.value)}
  placeholder="Nama pemesan"
  style={{ width: "100%", padding: 8, marginBottom: 16, borderRadius: 6, border: "1px solid #ccc" }}
/>

      {/* Tombol tambah isian */}
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

      

      {/* Tombol order */}
      <button onClick={handleOrder} disabled={saving || saved}
        style={{
          width: "100%", padding: 12, background: saved ? "#4caf50" : "#e25822",
          color: "white", border: "none", borderRadius: 8,
          fontSize: 15, cursor: saving || saved ? "default" : "pointer"
        }}>
        {saving ? "Menyimpan..." : saved ? "Order Tersimpan!" : "Pesan Sekarang"}
      </button>

      {saved && (
        <p style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: "#4caf50" }}>
          Order berhasil disimpan ke database!
        </p>
      )}
    </div>
  );
}