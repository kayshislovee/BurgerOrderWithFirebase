import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs, orderBy, getDoc, doc, limit, startAfter } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import FormOrder from "../components/FormOrder";
import AuthModal from "../components/LoginRegister";
import bunTop from "../assets/buntop.png";
import bunBottom from "../assets/bunbot.png";
import patty from "../assets/patty.png";
import lettuce from "../assets/lettuce.png";
import cheese from "../assets/cheese.png";
import tomato from "../assets/tomato.png";
import sauce from "../assets/sauce.png";
import { useRef, useCallback } from "react";

import {
  Menu,
  X,
  LogOut,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
  User,
  Home,
  Hamburger,
  UtensilsCrossed,
  ArrowRight,
  GripVertical
} from "lucide-react";
import addSound from "../assets/pop.mp3";
import removeSound from "../assets/whop.mp3";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Ingredient = "daging" | "sayur" | "keju" | "tomat" | "saus";



const INGREDIENTS: { id: Ingredient; label: string; color: string; image: string; emoji: string }[] = [
  { id: "daging", label: "Daging", color: "#8B4513", image: patty, emoji: "" },
  { id: "sayur", label: "Sayur", color: "#16A34A", image: lettuce, emoji: "" },
  { id: "keju", label: "Keju", color: "#F59E0B", image: cheese, emoji: "" },
  { id: "tomat", label: "Tomat", color: "#DC2626", image: tomato, emoji: "" },
  { id: "saus", label: "Saus", color: "#BE123C", image: sauce, emoji: "" },
];


function SortableItem({ id, layer, onRemove }: { id: string; layer: Ingredient; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const ingredient = INGREDIENTS.find(i => i.id === layer);

  return (
     <div ref={setNodeRef} style={style} className={`relative w-full flex justify-center rounded-xl transition-all ${isDragging ? "opacity-50 scale-95" : "hover:ring-2 hover:ring-orange-300"}`}>
      <div {...attributes} {...listeners} className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing px-1 text-gray-300 hover:text-gray-500 z-10">
        <GripVertical size={16} />
      </div>
      <button
        onClick={onRemove}
        title="Klik untuk hapus • Seret untuk pindah posisi"
        className="w-full p-0 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
      >
        <img src={ingredient?.image} alt={ingredient?.label} className="w-full rounded-xl" />
      </button>
    </div>
  );
}



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

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = active.data.current?.sortable?.index as number | undefined;
    const newIndex = over.data.current?.sortable?.index as number | undefined;
    if (typeof oldIndex !== "number" || typeof newIndex !== "number") return;

    setLayers(prev => arrayMove(prev, oldIndex, newIndex));
  };
const [lastDoc, setLastDoc] = useState<any>(null);
const [hasMore, setHasMore] = useState(true);
const observerRef = useRef<IntersectionObserver | null>(null);
const lastOrderRef = useCallback((node: HTMLDivElement | null) => {
  if (loadingHistory) return;
  if (observerRef.current) observerRef.current.disconnect();
  observerRef.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      fetchHistory(lastDoc);
    }
  });
  if (node) observerRef.current.observe(node);
}, [loadingHistory, hasMore, lastDoc]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        setUserData(null);
      }
    });

    return unsubscribe;
  }, []);

 

const fetchHistory = async (startAfterDoc?: any) => {
  if (!user) return;
  setLoadingHistory(true);
  try {
     const LIMIT = 5;
    const q = startAfterDoc
      ? query(
          collection(db, "orders"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          startAfter(startAfterDoc),
          limit(LIMIT)
        )
      : query(
          collection(db, "orders"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(LIMIT)
        );

    const snap = await getDocs(q);
    const newOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setHistory(prev => startAfterDoc ? [...prev, ...newOrders] : newOrders);
    setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
    setHasMore(snap.docs.length === LIMIT);
  } catch (e) {
    console.error(e);
  }
  setLoadingHistory(false);
};

  const toggleSidebar = () => {
  if (!showSidebar) {
    setHistory([]);
    setLastDoc(null);
    setHasMore(true);
    fetchHistory();
  }
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

  const ingredientCount = layers.reduce((acc, layer) => {
  acc[layer] = (acc[layer] ?? 0) + 1;
  return acc;
}, {} as Record<Ingredient, number>);


  if (step === "data") {
    return <FormOrder layers={layers} onKembali={() => setStep("pilih")} onSelesai={() => setStep("selesai")} />;
  }

  if (step === "selesai") {
    return (
      <div className="min-h-screen bg-amber-50">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-slate-100 p-8 text-center shadow-xl shadow-slate-200/60 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />

          <div className="relative flex justify-center mb-6">
            <div className="bg-orange-50 text-orange-600 p-5 rounded-3xl relative">
              <Hamburger className="w-10 h-10" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pesanan Berhasil Dibuat!</h2>
          <p className="text-sm text-slate-500 font-medium mt-2 max-w-xs mx-auto leading-relaxed">
            Koki kami sedang menyiapkan lapisan burgermu. Mohon tunggu sebentar, pesanan akan segera diantar hangat.
          </p>

          <div className="my-6 border-t border-dashed border-slate-200" />
          <div className="bg-slate-50/80 rounded-2xl p-4 mb-8 text-left space-y-2.5 border border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Metode Pembayaran</span>
              <span className="text-slate-700 font-bold">Bayar di Tempat (COD)</span>
            </div>
          </div>

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
      {!showSidebar && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
        >
          <Menu size={16} />
          {user ? `${userData?.name?.split(" ")[0] ?? "Akun"}` : "Masuk"}
        </button>
      )}

      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${showSidebar ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div
          onClick={e => e.stopPropagation()}
          className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="bg-orange-500 px-6 py-5 flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">{user ? "Akun Saya" : "Menu"}</h2>
            <button onClick={toggleSidebar} className="text-white text-xl hover:opacity-70">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col gap-4 p-5 flex-1 overflow-y-auto">
            {user ? (
              <>
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

                <div className="flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingBag size={15} className="text-gray-500" />
                      <h3 className="font-semibold text-gray-700 text-sm">Riwayat Order</h3>
                    </div>
                    {loadingHistory && <p className="text-gray-400 text-xs text-center py-2">Memuat...</p>}
                    {!loadingHistory && history.length === 0 && (
                     <p className="text-gray-300 text-xs text-center py-2">Semua order sudah ditampilkan</p>
                    )}
                    <div className="flex flex-col gap-2">
                      {history.map((order, i) => (
                        <div
                          key={order.id}
                          ref={i === history.length - 1 ? lastOrderRef : null}
                          className="bg-gray-50 rounded-xl p-3 border border-gray-100"
                        >
                          <div className="flex justify-between items-center">
                            <p className="font-semibold text-gray-700 text-sm">Order #{i + 1}</p>
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="text-orange-500 text-xs hover:underline flex items-center gap-1"
                            >
                              {expandedOrder === order.id ? (
                                <><ChevronUp size={12} /> Tutup</>
                              ) : (
                                <><ChevronDown size={12} /> Detail</>
                              )}
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

                <button
                  onClick={() => {
                    signOut(auth);
                    setShowSidebar(false);
                  }}
                  className="mt-auto w-full py-3 border border-orange-300 text-orange-500 hover:bg-orange-50 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={15} />
                  LogOut
                </button>

                <button
                  onClick={() => {
                    setShowSidebar(false);
                    navigate("/");
                  }}
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
                  onClick={() => {
                    setShowSidebar(false);
                    setTimeout(() => setShowAuthModal(true), 100);
                  }}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Masuk / Daftar
                </button>
                <button
                  onClick={() => {
                    setShowSidebar(false);
                    navigate("/");
                  }}
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
        <AuthModal
          onClose={() => {
            setShowAuthModal(false);
            setShowSidebar(false);
          }}
        />
      )}

      <div className="max-w-md mx-auto px-5 pt-20 pb-10">
        <div className="text-center mb-6">
        
        <h1 className="text-3xl font-bold text-gray-800 relative inline-block pb-1">
           Burger Builder
  
</h1>
        <p className="text-gray-400 text-sm mt-3">Rakit burgermu sendiri, sesukamu</p>
      </div>

        <div className="relative bg-white rounded-3xl shadow-sm border border-amber-100 p-6 mb-6 flex flex-col items-center gap-2 min-h-64 overflow-hidden">
  {/* subtle dots pattern */}
  <div className="absolute inset-0 opacity-[0.03]" style={{
    backgroundImage: "radial-gradient(circle, #92400e 1px, transparent 1px)",
    backgroundSize: "20px 20px"
  }} />
  {/* subtle warm glow di tengah */}
  <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-transparent to-amber-50/20 pointer-events-none" />
          <img src={bunTop} alt="Roti atas" className="relative z-10 w-48 drop-shadow-md" />
          {layers.length > 0 && (
    <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
      {layers.length} isian
    </div>
  )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={layers.map((layer, i) => `${layer}-${i}`)} strategy={verticalListSortingStrategy}>
              <div className="relative z-10 flex flex-col items-center gap-2 w-48">
                {layers.map((layer, i) => (
                  <SortableItem
                    key={`${layer}-${i}`}
                    id={`${layer}-${i}`}
                    layer={layer}
                    onRemove={() => removeIngredient(i)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <img src={bunBottom} alt="Roti bawah" className="w-48 drop-shadow-md" />
        </div>

        {layers.length > 0 && (
        <p className="text-center text-xs text-gray-400 -mt-3 mb-4">
          ↕ Seret layer untuk ubah urutan • Klik untuk hapus
        </p>
      )}

        <div className="bg-white rounded-2xl border border-amber-100 p-4 mb-5">
          <p className="text-xs text-gray-400 font-medium mb-3 uppercase tracking-wide">Pilih Isian</p>
          <div className="flex flex-wrap gap-2">
            {INGREDIENTS.map(ing => (
  <button
    key={ing.id}
    onClick={() => addIngredient(ing.id)}
    className="relative flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all shadow-sm"
    style={{ backgroundColor: ing.color }}
  >
   
    <span>{ing.label}</span>

    {/* Badge counter */}
    {ingredientCount[ing.id] > 0 && (
      <span className="absolute -top-2 -right-2 bg-white text-orange-500 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm border border-orange-100">
        {ingredientCount[ing.id]}
      </span>
    )}
  </button>
))}
          </div>
        </div>

      <button
  onClick={() => {
    if (layers.length === 0) return alert("Tambahkan isian burger dulu!");
    setStep("data");
  }}
  className="group relative w-full py-4 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-base rounded-2xl shadow-md transition-all"
>
  <span>Lanjut ke Pemesanan</span>
  <ArrowRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-transform group-hover:translate-x-1" />
</button>
      </div>
    </div>
  );
}

