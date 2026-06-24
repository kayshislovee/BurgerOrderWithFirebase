import { useForm } from "react-hook-form";
import "./FormProfil.css";

type OrderForm = {
  namaPemesan: string;
  noHp: string;
  alamat: string;
  kota: string;
};

export default function FormDataPemesan({ onSubmit }: { onSubmit: (data: OrderForm) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<OrderForm>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
      <h3 className="form-title">Detail Pemesan</h3>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Nama lengkap</label>
          <input
            className={errors.namaPemesan ? "input error" : "input"}
            placeholder="Nama lengkap"
            {...register("namaPemesan", { required: "Nama wajib diisi" })}
          />
          {errors.namaPemesan && <p className="error-message">{errors.namaPemesan.message}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">No. HP</label>
          <input
            className={errors.noHp ? "input error" : "input"}
            placeholder="08123456789"
            {...register("noHp", {
              required: "No. HP wajib diisi",
              pattern: { value: /^08[0-9]{8,11}$/, message: "Format no. HP tidak valid" }
            })}
          />
          {errors.noHp && <p className="error-message">{errors.noHp.message}</p>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Alamat lengkap</label>
        <input
          className={errors.alamat ? "input error" : "input"}
          placeholder="Jl. Contoh No. 123"
          {...register("alamat", { required: "Alamat wajib diisi" })}
        />
        {errors.alamat && <p className="error-message">{errors.alamat.message}</p>}
      </div>

      <div className="form-group">
        <label className="form-label">Kota</label>
        <input
          className={errors.kota ? "input error" : "input"}
          placeholder="Kota"
          {...register("kota", { required: "Kota wajib diisi" })}
        />
        {errors.kota && <p className="error-message">{errors.kota.message}</p>}
      </div>

      <button type="submit" className="btn-primary">Order Sekarang</button>
    </form>
  );
}