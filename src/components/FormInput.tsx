import { useForm } from "react-hook-form";
import type { Path } from "react-hook-form";

type FieldConfig<T> = {
  name: Path<T>;
  label: string;
  placeholder: string;
  type?: string;
  required?: string;
  pattern?: { value: RegExp; message: string };
};

type FormInputProps<T extends Record<string, string>> = {
  fields: FieldConfig<T>[];
  onSubmit: (data: T) => void;
  submitLabel?: string;
  loading?: boolean;
};

export default function FormInput<T extends Record<string, string>>({
  fields = [], // Ditambahkan default value [] agar tidak crash jika fields undefined
  onSubmit,
  submitLabel = "Submit",
  loading = false,
}: FormInputProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5 text-left" noValidate>
      {/* Optional Chaining (?.) ditambahkan sebagai pengaman ganda */}
      {fields?.map(field => {
        const error = errors[field.name as string];
        
        return (
          <div key={field.name as string} className="flex flex-col gap-1.5">
            {/* Label Bergaya Modern */}
            <label className="text-sm font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-orange-500 ml-0.5">*</span>}
            </label>
            
            {/* Input dengan Transisi Halus & Sinkron dengan Dashboard */}
            <input
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              {...register(field.name, {
                required: field.required,
                pattern: field.pattern,
              })}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 text-slate-800 placeholder:text-slate-400 font-medium text-sm transition duration-200 outline-none
                ${
                  error
                    ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/20"
                    : "border-slate-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white"
                }
              `}
            />

            {/* Pesan Error yang Rapi */}
            {error && (
              <p className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
                 {error?.message as string}
              </p>
            )}
          </div>
        );
      })}

      {/* Tombol Berwarna Hitam Tegas (Slate-900) khas Utama Website Anda */}
      <button 
        type="submit" 
        disabled={loading} 
        className={`w-full mt-2 font-semibold py-3.5 px-6 rounded-xl transition transform active:scale-[0.98] duration-150 flex items-center justify-center gap-2 text-white shadow-xl
          ${
            loading 
              ? "bg-slate-300 cursor-not-allowed shadow-none" 
              : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10 cursor-pointer"
          }
        `}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Memproses...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}