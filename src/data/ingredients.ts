export type Ingredient = "daging" | "sayur" | "keju" | "tomat" | "saus";

export const INGREDIENTS: { id: Ingredient; label: string; color: string; durasi: number }[] = [
  { id: "daging", label: "Daging", color: "#8B4513", durasi: 60 },
  { id: "sayur", label: "Sayur", color: "#16A34A", durasi: 10 },
  { id: "keju", label: "Keju", color: "#F59E0B", durasi: 10 },
  { id: "tomat", label: "Tomat", color: "#DC2626", durasi: 10 },
  { id: "saus", label: "Saus", color: "#BE123C", durasi: 10 },
];