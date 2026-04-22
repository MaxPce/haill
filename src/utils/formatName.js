export const formatearNombreCompleto = (nombre) => {
  // Palabras que deben mantenerse en minúscula
  const palabrasMinusculas = ["del", "el", "de", "la"];

  // Separamos el nombre en un array de palabras
  return nombre
    .toLowerCase()
    .split(" ")
    .map((palabra) => {
      // Si la palabra está en la lista de palabras en minúscula, la devolvemos tal cual
      if (palabrasMinusculas.includes(palabra)) {
        return palabra;
      }
      // En caso contrario, convertimos la primera letra a mayúscula y el resto a minúscula
      return palabra.charAt(0).toUpperCase() + palabra.slice(1);
    })
    .join(" "); // Unimos las palabras de nuevo en un string
};
