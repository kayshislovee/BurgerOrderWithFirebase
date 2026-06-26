import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, orderBy, getDoc, doc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import FormOrder from "../components/FormOrder";
import AuthModal from "../components/LoginRegister";
import bunTop from "../assets/buntop.png";
import bunBottom from "../assets/bunbot.png";
import patty from "../assets/patty.png";
import lettuce from "../assets/lettuce.png";
import cheese from "../assets/cheese.png";
import tomato from "../assets/tomato.png";
import sauce from "../assets/sauce.png";
import { onAuthStateChanged } from "firebase/auth";
import { Menu, X, LogOut, ShoppingBag, MapPin, Phone, Mail, ChevronDown, ChevronUp, User, Home, Hamburger,UtensilsCrossed, ArrowRight } from "lucide-react";
import addSound from "../assets/pop.mp3"; 
import removeSound from "../assets/whop.mp3";


// di dalam komponen:
type Ingredient = "daging" | "sayur" | "keju" | "tomat" | "saus";

const INGREDIENTS: { id: Ingredient; label: string; color: string; image: string; emoji: string }[] = [
  { id: "daging", label: "Daging", color: "#8B4513", image: patty, emoji: "" },
  { id: "sayur", label: "Sayur", color: "#16A34A", image: lettuce, emoji: "" },
  { id: "keju", label: "Keju", color: "#F59E0B", image: cheese, emoji: "" },
  { id: "tomat", label: "Tomat", color: "#DC2626", image: tomato, emoji: "" },
  { id: "saus", label: "Saus", color: "#BE123C", image: sauce, emoji: "" },
];

export default function BurgerOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [layers, setLayers] = useState<Ingredient[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [step, setStep] = useState<"pilih" | "data" | "selesai">("pilih");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const playAddSound = () => new Audio(addSound).play();
  const playRemoveSound = () => new Audio(removeSound).play();

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    console.log("auth state changed:", currentUser?.email); // tambah ini
    if (currentUser) {
      const snap = await getDoc(doc(db, "users", currentUser.uid));
      console.log("snap exists:", snap.exists(), snap.data()); // tambah ini
      if (snap.exists()) setUserData(snap.data());
    } else {
      setUserData(null);
    }
  });
  return unsubscribe;
}, []);

{showAuthModal && (
  <AuthModal onClose={() => {
    setShowAuthModal(false);
    setTimeout(() => setShowSidebar(true), 150); // buka sidebar lagi setelah login
  }} />
)}




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
  playAddSound();
  setLayers(prev => [id, ...prev]);
};

const removeIngredient = (index: number) => {
  playRemoveSound();
  setLayers(prev => prev.filter((_, i) => i !== index));
};

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center shadow-xl shadow-slate-200/60 relative overflow-hidden">
        
        {/* Dekorasi Background Halus */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl"></div>

        {/* Kombinasi Icon Centang & Burger */}
        <div className="relative flex justify-center mb-6">
          <div className="bg-orange-50 text-orange-600 p-5 rounded-3xl relative">
            <Hamburger className="w-10 h-10" />
            
          </div>
        </div>

        {/* Teks Utama */}
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Pesanan Berhasil Dibuat!
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
          Koki kami sedang menyiapkan lapisan burgermu. Mohon tunggu sebentar, pesanan akan segera diantar hangat.
        </p>

        {/* Pembatas Estetik */}
        <div className="my-6 border-t border-dashed border-slate-200"></div>

        {/* Status Mini Transaksi */}
        <div className="bg-slate-50/80 rounded-2xl p-4 mb-8 text-left space-y-2.5 border border-slate-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Metode Pembayaran</span>
            <span className="text-slate-700 font-bold">Bayar di Tempat (COD)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
           
          </div>
        </div>

        {/* Tombol Aksi Pesan Lagi */}
        <button
          onClick={() => {
            setStep("pilih");
            setLayers([]);
          }}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 px-6 rounded-xl shadow-xl shadow-slate-900/10 transition transform active:scale-[0.98] duration-150 flex items-center justify-center gap-2 group"
        >
          Buat Racikan Baru 
          <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-amber-50">

      {/* Tombol sidebar — SEKARANG DIKONDISIKAN AGAR HILANG SAAT SIDEBAR TERBUKA */}
      {!showSidebar && (
        <button 
          onClick={toggleSidebar} 
          className="fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
        >
          <Menu size={16} />
          {user ? `${userData?.name?.split(" ")[0] ?? "Akun"}` : "Masuk"}
        </button>
      )}

    {/* Sidebar overlay */}
    
      <div
  onClick={toggleSidebar}
  className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
>
  <div
    onClick={e => e.stopPropagation()}
    className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
  >
          {/* Header sidebar */}
          <div className="bg-orange-500 px-6 py-5 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">
              {user ? "Akun Saya" : "Menu"}
            </h2>
            <button onClick={toggleSidebar} className="text-white text-xl hover:opacity-70">
              <X size={20} />
            </button>
          </div>
          

            <div className="flex flex-col gap-4 p-5 flex-1 overflow-y-auto">
              {user ? (
                <>
                  {/* Profil */}
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700 font-bold text-lg">
                        {(userData?.name ?? user.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{userData?.name ?? "Pengguna"}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </div>

                 {/* Riwayat */}
<div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
  <div>
    <div className="flex items-center gap-2 mb-2">
      <ShoppingBag size={15} className="text-gray-500" />
      <h3 className="font-semibold text-gray-700 text-sm">Riwayat Order</h3>
    </div>
    {loadingHistory && <p className="text-gray-400 text-sm">Memuat...</p>}
    {!loadingHistory && history.length === 0 && (
      <p className="text-gray-400 text-sm">Belum ada order.</p>
    )}
    <div className="flex flex-col gap-2">
      {history.map((order, i) => (
        <div key={order.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-gray-700 text-sm">Order #{i + 1}</p>
            <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="text-orange-500 text-xs hover:underline flex items-center gap-1">
              {expandedOrder === order.id
                ? <><ChevronUp size={12} /> Tutup</>
                : <><ChevronDown size={12} /> Detail</>}
            </button>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
  <UtensilsCrossed size={11} />
  <span>{order.layers?.join(", ")}</span>
</div>
          <p className="text-gray-300 text-xs mt-1">
            {order.createdAt?.toDate().toLocaleString("id-ID")}
          </p>
          {expandedOrder === order.id && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <User size={12} /> <span>{order.namaPemesan}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Phone size={12} /> <span>{order.noHp}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <MapPin size={12} /> <span>{order.alamat}, {order.kota}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 text-xs">
                <Mail size={12} /> <span>{order.email}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
</div>
                  

                  {/* Logout */}
                  <button onClick={() => { signOut(auth); setShowSidebar(false); }}
  className="mt-auto w-full py-3 border border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
  <LogOut size={15} />
  LogOut
</button>

                  <button
  onClick={() => { setShowSidebar(false); navigate("/"); }}
  className="w-full py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
>
  <Home size={15} />
  Kembali ke Dashboard
</button>
                </>
              ) : (
                <div className="flex flex-col gap-3 mt-4">
                  <p className="text-gray-500 text-sm">Masuk untuk melihat riwayat ordermu.</p>
                  <button
                    onClick={() => { setShowSidebar(false); setTimeout(() => setShowAuthModal(true), 100); }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                  >
                    Masuk / Daftar
                  </button>
                  <button
  onClick={() => { setShowSidebar(false); navigate("/"); }}
  className="w-full py-3 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
>
  <Home size={15} />
  Kembali ke Dashboard
</button>
                </div>
              )}
            </div>
          </div>
        </div>
      

     {showAuthModal && (
  <AuthModal onClose={() => {
    setShowAuthModal(false);
    setShowSidebar(false);
  }} />
)}
      {/* Konten utama */}
      <div className="max-w-md mx-auto px-5 pt-20 pb-10">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Burger Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Rakit burgermu sendiri, sesukamu</p>
        </div>

        {/* Visual burger */}
        <div className="bg-white rounded-3xl shadow-sm border border-amber-100 p-6 mb-6 flex flex-col items-center gap-2 min-h-64">
          <img src={bunTop} alt="Roti atas" className="w-48 drop-shadow-md" />

          {layers.length === 0 && (
            <p className="text-gray-300 text-sm py-4">Tambahkan isian di bawah</p>
          )}

          <div className="flex flex-col items-center gap-2 w-48">
            {layers.map((layer, i) => {
              const ingredient = INGREDIENTS.find(item => item.id === layer);
              return (
                <button
                  key={i}
                  onClick={() => removeIngredient(i)}
                  title="Klik untuk hapus"
                  className="w-full p-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                >
                  <img src={ingredient?.image} alt={ingredient?.label} className="w-full rounded-xl shadow-sm" />
                </button>
              );
            })}
          </div>

          <img src={bunBottom} alt="Roti bawah" className="w-48 drop-shadow-md" />
        </div>

        {/* Info layer */}
        {layers.length > 0 && (
          <p className="text-center text-xs text-gray-400 -mt-3 mb-4">
            {layers.length} isian • klik gambar untuk hapus
          </p>
        )}

        {/* Tombol isian */}
        <div className="bg-white rounded-2xl border border-amber-100 p-4 mb-5">
          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Pilih Isian</p>
          <div className="flex flex-wrap gap-2">
            {INGREDIENTS.map(ing => (
              <button
                key={ing.id}
                onClick={() => addIngredient(ing.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
                style={{ backgroundColor: ing.color }}
              >
                <span>{ing.emoji}</span>
                <span>{ing.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tombol lanjut */}
        <button
          onClick={() => {
            if (layers.length === 0) return alert("Tambahkan isian burger dulu!");
            setStep("data");
          }}
          className="w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-base rounded-2xl shadow-md transition-all"
        >
          Lanjut ke Pemesanan →
        </button>
      </div>
    </div>
  );
}