import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import FormInput from "./FormInput"; // 1. IMPORT FORM INPUT LANGSUNG DI SINI
import AuthModal from "./LoginRegister";
import { ArrowLeft, Layers, ShoppingBag } from "lucide-react"; // Icon pendukung

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

  const orderFields = [
    { name: "namaPemesan" as const, label: "Nama Lengkap", placeholder: "Nama lengkap penerima burger", required: "Nama wajib diisi" },
    { 
      name: "noHp" as const, 
      label: "No. HP / WhatsApp", 
      placeholder: "Contoh: 08123456789", 
      required: "No. HP wajib diisi",
      pattern: { value: /^08[0-9]{8,11}$/, message: "Format nomor HP tidak valid (gunakan 08xx)" }
    },
    { name: "alamat" as const, label: "Alamat Lengkap Rumah", placeholder: "Nama jalan, RT/RW, nomor rumah atau unit", required: "Alamat lengkap wajib diisi" },
    { name: "kota" as const, label: "Kota / Kabupaten", placeholder: "Kota tujuan pengiriman", required: "Kota wajib diisi" }
  ];

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
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-xl shadow-slate-200/50 my-10 font-sans text-slate-800">
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      
      {/* Tombol Kembali dengan Style Navigasi Dashboard */}
      <button 
        onClick={onKembali} 
        className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-xl transition mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      {/* Header Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <div className="text-left">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Detail Pemesanan</h2>
          <p className="text-sm text-slate-400 font-medium mt-0.5">Konfirmasi isian burger dan data pengiriman Anda.</p>
        </div>
      </div>

      {/* Ringkasan Isian Burger (Layers) yang Menarik */}
      <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
        <Layers className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-orange-700">Racikan Burgermu:</span>
          <p className="text-sm text-slate-700 font-semibold mt-1 leading-relaxed capitalize">
            {layers.length > 0 ? layers.join(", ") : "Hanya roti kosong"}
          </p>
        </div>
      </div>

      {/* Tampilkan Form Input yang Menggunakan React Hook Form */}
      <FormInput<OrderForm>
        fields={orderFields}
        onSubmit={onSubmit}
        submitLabel="Konfirmasi & Order Sekarang"
        loading={saving}
      />
    </div>
  );
}