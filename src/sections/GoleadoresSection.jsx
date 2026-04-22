import React from "react";

const goleadoresData = [
  {
    nro: 1,
    univ: "UPC",
    name: "Gonzales Zela Mariano",
    fecha1: 2,
    fecha2: 1,
    fecha3: "",
    fecha4: "",
    fecha5: 2,
    fecha6: 1,
    fecha7: 1,
    fecha8: 2,
    total: 9,
  },
  {
    nro: 2,
    univ: "USIL",
    name: "Biffi Bajak Giuseppe Valentino",
    fecha1: "",
    fecha2: 1,
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: 1,
    fecha7: "",
    fecha8: 2,
    total: 4,
  },
  {
    nro: 3,
    univ: "USIL",
    name: "Rodriguez Pimentel Fabrizio Gonzalo",
    fecha1: "",
    fecha2: "",
    fecha3: 1,
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: 1,
    fecha8: 2,
    total: 4,
  },
  {
    nro: 4,
    univ: "UPN",
    name: "Sanchez Vera Aaroom",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: 4,
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
    total: 4,
  },
  {
    nro: 5,
    univ: "UNMSM",
    name: "Pérez Jiménez Yordani Ademir",
    fecha1: "",
    fecha2: 2,
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: 1,
    fecha8: 1,
    total: 4,
  },
  {
    nro: 6,
    univ: "UNMSM",
    name: "Quispe Delgado Gabriel Jeferson",
    fecha1: "",
    fecha2: 2,
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: 1,
    fecha7: "",
    fecha8: 1,
    total: 4,
  },
  {
    nro: 7,
    univ: "UNFV",
    name: "Ruiz Serpa Leonardo Gabriel",
    fecha1: 1,
    fecha2: "",
    fecha3: 1,
    fecha4: "",
    fecha5: "",
    fecha6: 1,
    fecha7: "",
    fecha8: 1,
    total: 4,
  },
  {
    nro: 8,
    univ: "EOFAP",
    name: "Bendezu Ocharan Adrain",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: 4,
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
    total: 4,
  },
  {
    nro: 9,
    univ: "EOFAP",
    name: "Humareda Paye Bruno Jeanfranco",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: 4,
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
    total: 4,
  },
  {
    nro: 10,
    univ: "UNMSM",
    name: "Fuentes Albines Adriano Iarley",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: 1,
    fecha8: 2,
    total: 3,
  },
  {
    nro: 11,
    univ: "UNMSM",
    name: "Leyva Pintado Jose Marco Antonio",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: 1,
    fecha7: 2,
    fecha8: "",
    total: 3,
  },
  {
    nro: 12,
    univ: "UNFV",
    name: "Ninaquispe Najarro Alvaro Gonzalo",
    fecha1: "",
    fecha2: "",
    fecha3: 1,
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: 1,
    total: 2,
  },
];

const GoleadoresSection = () => {
  return (
    <div className="container mx-auto p-4 mt-16">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-blue-600">
          FEDUP Centenario Liga Universitaria División 1 Región Lima 2024
        </h2>
        <h3 className="text-5xl font-extrabold text-gray-900 mt-4">
          Fútbol Masculino
        </h3>
      </div>
      <div className="mt-8 text-center">
        <h4 className="text-3xl font-bold text-gray-800">
          TABLA DE GOLEADORES
        </h4>
      </div>
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="bg-blue-600 text-white px-4 py-2">N°</th>
              <th className="bg-blue-600 text-white px-4 py-2">UNIV.</th>
              <th className="bg-blue-600 text-white px-4 py-2">
                APELLIDOS Y NOMBRES
              </th>
              <th className="bg-blue-600 text-white px-4 py-2">1° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">2° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">3° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">4° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">5° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">6° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">7° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">8° FECHA</th>
              <th className="bg-blue-600 text-white px-4 py-2">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {goleadoresData.map((goleador, index) => (
              <tr
                key={index}
                className="bg-gray-100 border-b hover:bg-gray-200"
              >
                <td className="px-4 py-2 text-center">{goleador.nro}</td>
                <td className="px-4 py-2 text-center">{goleador.univ}</td>
                <td className="px-4 py-2">{goleador.name}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha1}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha2}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha3}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha4}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha5}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha6}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha7}</td>
                <td className="px-4 py-2 text-center">{goleador.fecha8}</td>
                <td className="px-4 py-2 text-center font-bold">
                  {goleador.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GoleadoresSection;
