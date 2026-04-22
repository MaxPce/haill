import React from "react";

const sancionesData = [
  {
    nro: 1,
    siglas: "UCV-LIM",
    name: "Uribe Guanilo Luis Antonio",
    fecha1: "",
    fecha2: "",
    fecha3: "R",
    fecha4: "S",
    fecha5: "",
    fecha6: "H",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 2,
    siglas: "UNMSM",
    name: "Montalvo Mittem Jhon Anthony",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 3,
    siglas: "UNFV",
    name: "Veliz Figueroa Lorenzo Noel",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "A",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 4,
    siglas: "USIL",
    name: "Tan Martínez Patrick Eder",
    fecha1: "",
    fecha2: "A",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 5,
    siglas: "UNFV",
    name: "Puelles Melgarejo Deynor Mifflin",
    fecha1: "",
    fecha2: "",
    fecha3: "R",
    fecha4: "S",
    fecha5: "",
    fecha6: "H",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 6,
    siglas: "UNMSM",
    name: "Calizaya Zúñiga Josue Daniel",
    fecha1: "",
    fecha2: "",
    fecha3: "A",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 7,
    siglas: "UNMSM",
    name: "Ayala Santiago Ronald Gustavo",
    fecha1: "",
    fecha2: "A",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 8,
    siglas: "PUCP",
    name: "Ferrari Truyenque Paolo Raeld",
    fecha1: "",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "A",
    fecha7: "",
    fecha8: "",
  },
  {
    nro: 9,
    siglas: "UNI",
    name: "Centeno Vilchez Juan Fabrizio",
    fecha1: "A",
    fecha2: "",
    fecha3: "",
    fecha4: "",
    fecha5: "",
    fecha6: "",
    fecha7: "",
    fecha8: "",
  },
];

const leyendas = [
  { color: "bg-yellow-500", label: "TARJETA AMARILLA", code: "A" },
  { color: "bg-red-500", label: "TARJETA ROJA", code: "R" },
  { color: "bg-black", label: "SUSPENDIDO", code: "S" },
  { color: "bg-green-500", label: "HABILITADO", code: "H" },
  { color: "bg-orange-500", label: "ROJA A EVALUAR", code: "R/E" },
  { color: "bg-gray-500", label: "DESCANSO", code: "D" },
];

const SancionesSection = () => {
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
          CONTROL DE TARJETAS Y SANCIONES
        </h4>
      </div>
      <div className="flex justify-center space-x-4 mt-4">
        {leyendas.map((leyenda, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className={`w-6 h-6 ${leyenda.color} block`}></span>
            <span>{leyenda.label}</span>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto mt-8">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr>
              <th className="bg-blue-600 text-white px-4 py-2">N°</th>
              <th className="bg-blue-600 text-white px-4 py-2">SIGLAS</th>
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
            </tr>
          </thead>
          <tbody>
            {sancionesData.map((sancion, index) => (
              <tr
                key={index}
                className="bg-gray-100 border-b hover:bg-gray-200"
              >
                <td className="px-4 py-2 text-center">{sancion.nro}</td>
                <td className="px-4 py-2 text-center">{sancion.siglas}</td>
                <td className="px-4 py-2">{sancion.name}</td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha1
                  )}`}
                >
                  {sancion.fecha1}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha2
                  )}`}
                >
                  {sancion.fecha2}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha3
                  )}`}
                >
                  {sancion.fecha3}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha4
                  )}`}
                >
                  {sancion.fecha4}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha5
                  )}`}
                >
                  {sancion.fecha5}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha6
                  )}`}
                >
                  {sancion.fecha6}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha7
                  )}`}
                >
                  {sancion.fecha7}
                </td>
                <td
                  className={`px-4 py-2 text-center ${getColorClass(
                    sancion.fecha8
                  )}`}
                >
                  {sancion.fecha8}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const getColorClass = (value) => {
  switch (value) {
    case "A":
      return "bg-yellow-500 text-white";
    case "R":
      return "bg-red-500 text-white";
    case "S":
      return "bg-black text-white";
    case "H":
      return "bg-green-500 text-white";
    case "R/E":
      return "bg-orange-500 text-white";
    case "D":
      return "bg-gray-500 text-white";
    default:
      return "";
  }
};

export default SancionesSection;
