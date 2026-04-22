// src/utils/idTarjeta.js
export const idTarjeta = (id) => {
  switch (id) {
    case 0:
      return {
        id: 0, // Agregar el ID
        name: "Vacío",
        abrev: "V",
        color: "#000000",
        amarilla: 0,
        roja: 0,
      };
    case 1:
      return {
        id: 1, // Agregar el ID
        name: "Amarilla",
        abrev: "A",
        color: "#FFFF00",
        amarilla: 1,
        roja: 0,
      };
    case 2:
      return {
        id: 2, // Agregar el ID
        name: "Roja",
        abrev: "R",
        color: "#FF0000",
        amarilla: 0,
        roja: 1,
      };
    case 3:
      return {
        id: 3, // Agregar el ID
        name: "2 Amarillas / Roja",
        abrev: "AA/R",
        color: "#FF0000",
        amarilla: 2,
        roja: 1,
      };
    case 4:
      return {
        id: 4, // Agregar el ID
        name: "1 Amarilla / Roja Directa",
        abrev: "A/R",
        color: "#FF0000",
        amarilla: 1,
        roja: 1,
      };
    case 5:
      return {
        id: 5, // Agregar el ID
        name: "Roja a Evaluar",
        abrev: "RE",
        color: "#FF9F11",
        amarilla: 0,
        roja: 2,
      };
    case 6:
      return {
        id: 6, // Agregar el ID
        name: "1 Amarilla / Roja a Evaluar",
        abrev: "A/RE",
        color: "#FF9F11",
        amarilla: 1,
        roja: 2,
      };
    case 7:
      return {
        id: 7, // Agregar el ID
        name: "2 Amarillas / Roja a Evaluar",
        abrev: "AA/RE",
        color: "#FF9F11",
        amarilla: 2,
        roja: 2,
      };
    case 8:
      return {
        id: 8, // Agregar el ID
        name: "Suspendido",
        abrev: "S",
        color: "#000000",
        amarilla: 0,
        roja: 0,
      };
    case 9:
      return {
        id: 9, // Agregar el ID
        name: "Habilitado",
        abrev: "H",
        color: "#92D050",
        amarilla: 0,
        roja: 0,
      };
    case 10:
      return {
        id: 10, // Agregar el ID
        name: "Descanso",
        abrev: "*",
        color: "#A9957B",
        amarilla: 0,
        roja: 0,
      };
    case 11:
      return {
        id: 11,
        name: "Conmoción",
        abrev: "IR",
        color: "#7C3AED",
        amarilla: 0,
        roja: 0,
        description:
          "Conmoción registrada con suspensión temporal del deportista.",
      };

    // case 11:
    //   return {
    //     id: 11, // Agregar el ID
    //     name: "Informe",
    //     abrev: "i",
    //     color: "#4169e1",
    //     amarilla: 0,
    //     roja: 0,
    //     description:
    //       "Tras el informe recibido por el árbitro principal del partido en el encuentro entre la UPC vs ULIMA, válido por la semifinal de ida de la liga universitaria de futbol varones 2025, la comisión organizadora amplia la fecha de suspensión al deportista indicado en el informe.",
    //   };
    default:
      return {
        id: -1, // Para tarjetas no reconocidas
        name: "Tarjeta No Reconocida",
        abrev: "TNR",
        color: "#000000",
        amarilla: 0,
        roja: 0,
      };
  }
};
