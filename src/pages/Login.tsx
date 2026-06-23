import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<LoginForm>>({});
  const [firebaseError, setFirebaseError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError("");

    
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: { [key in keyof LoginForm]?: string } = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as keyof LoginForm;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    try {
      await signInWithEmailAndPassword(auth, form.email, form.password);
      navigate("/pesanburger");
    } catch (err: any) {
      setFirebaseError("Email atau password salah.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "80px auto", padding: 24 }}>
      <h2>Masuk</h2>
      {firebaseError && <p style={{ color: "red", fontSize: 14 }}>{firebaseError}</p>}
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <input name="email" type="email" value={form.email} onChange={handleChange}
            placeholder="Email" style={{ padding: 8, width: "100%" }} />
          {errors.email && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.email}</p>}
        </div>
        <div>
          <input name="password" type="password" value={form.password} onChange={handleChange}
            placeholder="Password" style={{ padding: 8, width: "100%" }} />
          {errors.password && <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>{errors.password}</p>}
        </div>
        <button type="submit" style={{ padding: 10, background: "#e25822", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}>
          Masuk
        </button>
      </form>
      <p style={{ marginTop: 16, fontSize: 14 }}>Belum punya akun? <a href="/register">Daftar</a></p>
    </div>
  );
}