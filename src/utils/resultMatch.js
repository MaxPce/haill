export const resultMatch = (state) => {
  switch (state) {
    case 0:
      return {
        label: "N", // No disputado
        color: "bg-gray-200 text-yellow-800",
      };
    case 1:
      return {
        label: "G", // Ganar
        color: "bg-green-100 text-green-800",
      };
    case 2:
      return {
        label: "E", // Empate
        color: "bg-yellow-100 text-gray-800",
      };
    case 3:
      return {
        label: "P", // Perder
        color: "bg-red-100 text-red-800",
      };
    case 4:
      return {
        label: "D", // Descanso
        color: "bg-blue-100 text-blue-800",
      };
    case 5: {
      return {
        label: "W", // WO
        color: "bg-gray-800 text-white-800",
      };
    }
    default:
      return {
        label: "",
        color: "bg-black text-white",
      };
  }
};
