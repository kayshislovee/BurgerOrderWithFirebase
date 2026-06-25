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
  fields,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
}: FormInputProps<T>) {
  const { register, handleSubmit, formState: { errors } } = useForm<T>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {fields.map(field => (
        <div key={field.name as string}>
          <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>
            {field.label}
          </label>
          <input
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            {...register(field.name, {
              required: field.required,
              pattern: field.pattern,
            })}
            style={{
              width: "100%", padding: 8, borderRadius: 6,
              border: errors[field.name as string] ? "1px solid red" : "1px solid #ccc",
              boxSizing: "border-box"
            }}
          />
          {errors[field.name as string] && (
            <p style={{ color: "red", fontSize: 12, margin: "4px 0 0" }}>
              {errors[field.name as string]?.message as string}
            </p>
          )}
        </div>
      ))}

      <button type="submit" disabled={loading} style={{
        padding: 12, background: loading ? "#ccc" : "#e25822",
        color: "white", border: "none", borderRadius: 8,
        cursor: loading ? "default" : "pointer", fontSize: 15, fontWeight: 600
      }}>
        {loading ? "Memproses..." : submitLabel}
      </button>
    </form>
  );
}