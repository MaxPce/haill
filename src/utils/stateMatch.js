export const stateMatch = (id) => {
  switch (id) {
    case -2:
      return {
        name: "Eliminado",
        tag: "Eliminado",
        color: "bg-red-600 text-white",
      };
    case -1:
      return {
        name: "No Definido",
        tag: "No Definido",
        color: "bg-gray-500 text-white",
      };
    case 0:
      return {
        name: "No Habilitado",
        tag: "JUEGO BAJO PROTESTA",
        color: "bg-gray-400 text-white",
      };
    case 1:
      return {
        name: "Habilitado",
        tag: "Por Jugarse",
        color: "bg-blue-600 text-white",
      };
    case 2:
      return {
        name: "En Progreso",
        tag: "En Vivo",
        color: "bg-red-400 text-white",
      };
    case 3:
      return {
        name: "Finalizado",
        tag: "Finalizado",
        color: "bg-yellow-600 text-white",
      };
    case 4:
      return {
        name: "Oficializado",
        tag: "Finalizado",
        color: "bg-green-600 text-white",
      };
    default:
      return {
        name: "",
        tag: "",
        color: "bg-black text-white",
      };
  }
};
