export const formatWhatsappUrl = (phoneOrWa?: string) => {
  if (!phoneOrWa) return "";
  let digits = phoneOrWa.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("01") && digits.length === 11) {
    digits = "88" + digits;
  }
  return `https://wa.me/${digits}`;
};

export const getBranchStyle = (branchId: string) => {
  switch (branchId) {
    case "root":
      return {
        border: "border-amber-500",
        left: "border-l-amber-500",
        header: "bg-emerald-950 text-amber-300",
      };
    case "child-1":
    case "boro-taraf":
      return {
        border: "border-emerald-600",
        left: "border-l-emerald-600",
        header: "bg-emerald-800 text-white",
      };
    case "child-2":
    case "mejo-taraf":
      return {
        border: "border-amber-600",
        left: "border-l-amber-600",
        header: "bg-amber-700 text-white",
      };
    case "child-3":
    case "choto-taraf":
      return {
        border: "border-sky-600",
        left: "border-l-sky-600",
        header: "bg-sky-800 text-white",
      };
    case "child-4":
      return {
        border: "border-purple-600",
        left: "border-l-purple-600",
        header: "bg-purple-800 text-white",
      };
    case "child-5":
      return {
        border: "border-rose-600",
        left: "border-l-rose-600",
        header: "bg-rose-800 text-white",
      };
    default:
      return {
        border: "border-teal-600",
        left: "border-l-teal-600",
        header: "bg-teal-800 text-white",
      };
  }
};
