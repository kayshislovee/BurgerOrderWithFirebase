import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

// Definisi skema validasi
const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError("");

    // Validasi dengan Zod
    const result = registerSchema.safeParse(form);
    if (!result.success) {
     const fieldErrors: { [key in keyof RegisterForm]?: string } = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof RegisterForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: form.name,
        email: form.email,
        createdAt: serverTimestamp(),
      });
      navigate("/login");
    } catch (err: any) {
      setFirebaseError("Email sudah digunakan atau terjadi kesalahan.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h2>Daftar Akun</h2>
      {firebaseError && <p style={{ color: "red", fontSize: 14 }}>{firebaseError}</p>}
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="Nama lengkap" style={{ padding: 8, width: "100%" }} />
          {errors.name && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.name}</p>}
        </div>
        <div>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="Email" style={{ padding: 8, width: "100%" }} />
          {errors.email && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
        </div>
        <div>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Password (min. 6 karakter)" style={{ padding: 8, width: "100%" }} />
          {errors.password && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.password}</p>}
        </div>
        <button type="submit" style={{ padding: 10, background: "#e25822", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Daftar
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>Sudah punya akun? <a href="/login">Masuk</a></p>
    </div>
  );
}