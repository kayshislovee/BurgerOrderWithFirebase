import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [firebaseError, setFirebaseError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError("");

    const schema = mode === "login" ? loginSchema : registerSchema;
    const result = schema.safeParse(form);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err: z.ZodIssue) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          name: form.name,
          email: form.email,
          createdAt: serverTimestamp(),
        });
      }
      onClose(); // tutup modal setelah berhasil
    } catch {
      setFirebaseError(mode === "login" ? "Email atau password salah." : "Email sudah digunakan.");
    }
  };

  return (
    // Overlay
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999
    }}>
      {/* Modal box — stop propagation supaya klik dalam modal tidak tutup */}
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: 12, padding: 32,
        width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.2)"
      }}>
        {/* Tab login/register */}
        <div style={{ display: "flex", marginBottom: 24, borderBottom: "1px solid #eee" }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); setFirebaseError(""); }}
              style={{
                flex: 1, padding: "10px 0", background: "none", border: "none",
                borderBottom: mode === m ? "2px solid #e25822" : "2px solid transparent",
                color: mode === m ? "#e25822" : "#999", fontWeight: 600, cursor: "pointer"
              }}>
              {m === "login" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>

        {firebaseError && <p style={{ color: "red", fontSize: 13, marginBottom: 12 }}>{firebaseError}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <div>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Nama lengkap" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
              {errors.name && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.name}</p>}
            </div>
          )}
          <div>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="Email" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
            {errors.email && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
          </div>
          <div>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Password" style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }} />
            {errors.password && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.password}</p>}
          </div>
          <button type="submit" style={{
            padding: 10, background: "#e25822", color: "white",
            border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600
          }}>
            {mode === "login" ? "Masuk" : "Daftar"}
          </button>
        </form>

        
      </div>
    </div>
  );
}