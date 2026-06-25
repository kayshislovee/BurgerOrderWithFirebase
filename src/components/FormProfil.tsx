import { useForm } from "react-hook-form";
// Menggunakan 'import type' untuk tipe data khusus react-hook-form
import type { Path, FieldValues } from "react-hook-form";

// Beri nama tipe data yang jelas agar tidak bentrok
type FormFieldItem<T> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  required?: string;
  pattern?: {
    value: RegExp;
    message: string;
  };
};

type CustomFormInputProps<T extends FieldValues> = {
  fields: FormFieldItem<T>[];
  onSubmit: (data: T) => void;
  submitLabel: string;
};

// Pastikan fungsi komponen ini diexport dengan benar dan tidak bentrok dengan import lain
export default function FormInput<T extends FieldValues>({
  fields,
  onSubmit,
  submitLabel,
}: CustomFormInputProps<T>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {fields.map((field) => {
        const error = errors[field.name];

        return (
          <div key={field.name} className="flex flex-col gap-1.5 text-left">
            <label className="text-sm font-semibold text-slate-700">
              {field.label}
              {field.required && <span className="text-orange-500 ml-0.5">*</span>}
            </label>

            <input
              type={field.type || "text"}
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

            {error && (
              <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
                 {error.message as string}
              </span>
            )}
          </div>
        );
      })}

      <button
        type="submit"
        className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-xl shadow-slate-900/10 transition transform active:scale-[0.98] duration-150 flex items-center justify-center gap-2"
      >
        {submitLabel}
      </button>
    </form>
  );
}