import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CheckCircle, ChefHat, Bike } from "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { key: "diproses", label: "Sedang Dimasak", icon: ChefHat, color: "text-orange-500" },
  { key: "diantar", label: "Sedang Diantar", icon: Bike, color: "text-blue-500" },
  { key: "selesai", label: "Pesanan Selesai", icon: CheckCircle, color: "text-green-500" },
];

export default function OrderProgress({ orderId, onSelesai }: { orderId: string; onSelesai: () => void }) {
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // realtime listener dari Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", orderId), snap => {
      if (snap.exists()) {
        const data = snap.data();
        setOrder(data);
        if (data.status === "diproses") {
          setTimeLeft(data.durasi ?? 60);
        }
      }
    });
    return unsub;
  }, [orderId]);

  // timer countdown saat status "diproses"
  useEffect(() => {
    if (!order || order.status !== "diproses") return;
    if (timeLeft <= 0) {
      // timer habis, otomatis update status ke diantar
      updateDoc(doc(db, "orders", orderId), { status: "diantar" });
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, order?.status]);

  const handleDiterima = async () => {
    await updateDoc(doc(db, "orders", orderId), { status: "selesai" });
    
  };

  if (!order) return <p className="text-gray-400 text-sm text-center">Memuat status...</p>;

  const currentStep = STEPS.findIndex(s => s.key === order.status);
  const persen = order.status === "diproses"
    ? Math.round(((order.durasi - timeLeft) / order.durasi) * 100)
    : order.status === "diantar" ? 66 : 100;

  const menit = Math.floor(timeLeft / 60);
  const detik = timeLeft % 60;

  return (
    <div className="flex flex-col gap-6">

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = i <= currentStep;
          return (
            <div key={s.key} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${active ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white"}`}>
                <Icon size={18} className={active ? s.color : "text-slate-300"} />
              </div>
              <p className={`text-xs font-semibold text-center ${active ? "text-slate-700" : "text-slate-300"}`}>
                {s.label}
              </p>
              {i < STEPS.length - 1 && (
                <div className="absolute" />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-2">
        <motion.div
          className="h-2 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${persen}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Info status */}
      {order.status === "diproses" && (
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-1">Estimasi selesai dimasak:</p>
          <p className="text-3xl font-bold text-orange-500">
            {menit}:{String(detik).padStart(2, "0")}
          </p>
         
        </div>
      )}

      {order.status === "diantar" && (
        <div className="text-center">
          <p className="text-slate-500 text-sm mb-4">Burger kamu sedang dalam perjalanan!</p>
          <button
            onClick={handleDiterima}
            className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
          >
             Pesanan Diterima
          </button>
        </div>
      )}
{order.status === "selesai" && (
  <div className="text-center flex flex-col gap-4">
    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
      <CheckCircle size={32} className="text-green-500" />
    </div>
    <div>
      <p className="text-green-600 font-bold text-lg">Pesanan Diterima!</p>
      <p className="text-gray-400 text-sm mt-1">Selamat menikmati burgermu </p>
    </div>
    <button
      onClick={onSelesai}
      className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors mt-2"
    >
      Buat Pesanan Baru
    </button>
  </div>
)}
     
    </div>
  );
}
