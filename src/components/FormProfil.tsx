import FormInput from "./FormInput";

type OrderForm = {
  namaPemesan: string;
  noHp: string;
  alamat: string;
  kota: string;
};

export default function FormDataPemesan({ onSubmit }: { onSubmit: (data: OrderForm) => void }) {
  return (
    <FormInput<OrderForm>
      fields={[
        { name: "namaPemesan", label: "Nama Lengkap", placeholder: "Nama lengkap" },
        {
          name: "noHp", label: "No. HP", placeholder: "08123456789",
          required: "No. HP wajib diisi",
          pattern: { value: /^08[0-9]{8,11}$/, message: "Format no. HP tidak valid" }
        },
        { name: "alamat", label: "Alamat", placeholder: "Alamat lengkap", required: "Alamat wajib diisi" },
        { name: "kota", label: "Kota", placeholder: "Kota", required: "Kota wajib diisi" },
      ]}
      onSubmit={onSubmit}
      submitLabel="Order Sekarang"
    />
  );
}