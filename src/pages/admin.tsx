import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy,onSnapshot,doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { Package, Users, RefreshCw ,Trash2} from "lucide-react";



type OrderStatus = "diproses" | "diantar" | "selesai";

export default function Admin() {
  const { isAdmin, checking } = useIsAdmin();
  const [tab, setTab] = useState<"orders" | "users">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, "orders"), orderBy("createdAt", "desc")));
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "users"));
     console.log("jumlah user:", snap.docs.length); // tambah ini
  console.log("data:", snap.docs.map(d => d.data()));
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
  if (!isAdmin || tab !== "orders") return;
  setLoading(true);
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const unsub = onSnapshot(q, snap => {
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  });
  return unsub;
}, [isAdmin, tab]);
useEffect(() => {
  if (!isAdmin || tab !== "users") return;
  fetchUsers();
}, [isAdmin, tab]);

  if (checking) return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>;
  if (!isAdmin) return <Navigate to="/" />;

  const deleteOrder = async (orderId: string) => {
  if (!confirm("Hapus order ini?")) return;
  await deleteDoc(doc(db, "orders", orderId));
};
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Admin</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "orders" ? "bg-orange-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            <Package size={16} /> Order
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab === "users" ? "bg-orange-500 text-white" : "bg-white text-slate-500 border border-slate-200"}`}
          >
            <Users size={16} /> Pengguna
          </button>
          <button
            onClick={() => tab === "orders" ? fetchOrders() : fetchUsers()}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Tab Order */}
        {tab === "orders" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Pemesan</th>
                  <th className="text-left px-4 py-3">Isian</th>
                  <th className="text-left px-4 py-3">Kontak</th>
                  <th className="text-left px-4 py-3">Waktu</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-700">{order.namaPemesan}</td>
                    <td className="px-4 py-3 text-slate-500">{order.layers?.join(", ")}</td>
                    <td className="px-4 py-3 text-slate-500">
                      <p>{order.noHp}</p>
                      <p className="text-xs text-slate-400">{order.alamat}, {order.kota}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {order.createdAt?.toDate().toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3">
  <div className="w-24 bg-slate-100 rounded-full h-1.5">
    <div
      className="h-1.5 bg-orange-400 rounded-full transition-all"
      style={{
        width: order.status === "diproses" ? "33%" :
               order.status === "diantar" ? "66%" :
               order.status === "selesai" ? "100%" : "0%"
      }}
    />
  </div>
  
  <p className="text-xs text-slate-400 mt-1">{order.status ?? "diproses"}</p>
  
</td>
  <td className="px-4 py-3">                  {/* ← td aksi mulai di sini */}
    <button
      onClick={() => deleteOrder(order.id)}
      className="text-red-400 hover:text-red-600 transition-colors"
      title="Hapus order"
    >
      <Trash2 size={15} />
    </button>
  </td>
                  </tr>
                  
                ))}
              </tbody>
            </table>
            {orders.length === 0 && !loading && (
              <p className="text-center text-slate-400 py-8">Belum ada order.</p>
              
            )}
            
          </div>
          
        )}
        

        {/* Tab Users */}
        {tab === "users" && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Nama</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Role</th>
                  
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-700">{u.name ?? u.nama ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${u.role === "admin" ? "bg-orange-100 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                        {u.role ?? "user"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}