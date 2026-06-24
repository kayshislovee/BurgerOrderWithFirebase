import { useForm } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import FormDataPemesan from "./FormProfil";

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
  const { register, handleSubmit, formState: { errors } } = useForm<OrderForm>();

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
    <FormDataPemesan onSubmit={onSubmit} />
  );
}