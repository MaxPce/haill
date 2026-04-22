import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";
import { idTarjeta } from "../../utils/idTarjeta.js";
import { formatearNombreCompleto } from "../../utils/formatName.js";

const TablaSanciones = () => {
  const { idevent, idsport } = useParams();
  const [config, setConfig] = useState(null);
  const [sanciones, setSanciones] = useState([]);
  const [descansos, setDescansos] = useState([]);

  const getConfig = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/config_category`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
      setConfig(response.data);
    } catch (error) {
      console.error("Error fetching config", error);
    }
  };

  const getSanciones = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getsanciones`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
      setSanciones(response.data);
    } catch (error) {
      console.error("Error fetching sanciones", error);
    }
  };

  const getParticipantsWithDescanso = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/getparticipantdescansowithfecha`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
      const descansosMapped = response.data.map((descanso) => ({
        idinstitution: descanso.ParticipantBye.Institution.idinstitution,
        nro_fecha: descanso.nro_fecha,
        siglas: descanso.ParticipantBye.Institution.abrev
      }));
      setDescansos(descansosMapped);
    } catch (error) {
      console.error("Error fetching descansos", error);
    }
  };

  useEffect(() => {
    if (idevent && idsport) {
      getConfig();
      getSanciones();
      getParticipantsWithDescanso();
    }
  }, [idevent, idsport]);

  const fechasGrupo = Array.from(
    { length: config?.nro_fechas_grupo || 0 },
    (_, i) => `fecha${i + 1}`
  );

  const etapasFaseFinal =
    config?.nro_etapas_final === 4
      ? ["Octavos", "Cuartos", "Semis", "Final"]
      : ["Semis", "Final"];

  const ordenarSanciones = (sanciones) => {
    const importanciaTarjeta = (tarjeta) => {
      const { abrev } = idTarjeta(tarjeta);
      if (abrev === "R" || abrev === "AA/R") return 2;
      if (abrev === "A") return 1;
      return 0;
    };

    return sanciones.sort((a, b) => {
      const importanciaA = importanciaTarjeta(a.idtipotarjeta);
      const importanciaB = importanciaTarjeta(b.idtipotarjeta);

      if (importanciaA !== importanciaB) {
        return importanciaB - importanciaA;
      }

      return b.nro_fecha - a.nro_fecha;
    });
  };

  const generarEstructuraSanciones = () => {
    if (!config || !sanciones.length) return [];

    const sancionesOrdenadas = ordenarSanciones(sanciones);

    const sancionesPorAcreditado = sancionesOrdenadas.reduce((acc, sancion) => {
      const key = `${sancion.idacreditation}-${sancion.idinstitution}`;
      const tarjeta = idTarjeta(sancion.idtipotarjeta);

      if (!acc[key]) {
        acc[key] = {
          nro: Object.keys(acc).length + 1,
          siglas: sancion.institution.abrev,
          name: sancion.accreditation.persona,
          ...fechasGrupo.reduce(
            (accFechas, fecha) => ({ ...accFechas, [fecha]: "" }),
            {}
          ),
          Octavos: "",
          Cuartos: "",
          Semis: "",
          Final: "",
        };
      }

      let posicion;

      // Diferenciar entre fase de grupos (idtypephase 1) y fase final (idtypephase 2)
      if (sancion.idtypephase === 1) {
        // Fase de grupos
        posicion = `fecha${sancion.nro_fecha}`;
      } else if (sancion.idtypephase === 2) {
        // Fase final
        const etapaIndex = sancion.nro_fecha - 1;
        if (etapaIndex < etapasFaseFinal.length) {
          posicion = etapasFaseFinal[etapaIndex];
        }
      }

      // Si no se determina la posición, salimos
      if (!posicion) return acc;

      const tarjetaExistente = acc[key][posicion];

      // Aplicar la lógica para asignar la tarjeta
      if (
        tarjetaExistente === "H" &&
        (tarjeta.abrev === "A" || tarjeta.abrev.startsWith("R"))
      ) {
        acc[key][posicion] = tarjeta.abrev;
      } else if (!tarjetaExistente) {
        acc[key][posicion] = tarjeta.abrev;
      }

      return acc;
    }, {});

    // Añadir los descansos en las fechas correspondientes
    descansos.forEach(({ idinstitution, nro_fecha, siglas }) => {
      Object.values(sancionesPorAcreditado).forEach((sancion) => {
        if (sancion.siglas === siglas) {
          const fechaKey = `fecha${nro_fecha}`;
          if (!sancion[fechaKey]) {
            sancion[fechaKey] = idTarjeta(10).abrev; // Colocar "D" para descanso
          }
        }
      });
    });

    return Object.values(sancionesPorAcreditado);
  };


  const sancionesData = generarEstructuraSanciones();

  const leyendas = [
    { color: "bg-yellow-500", label: "TARJETA AMARILLA", code: "A" },
    { color: "bg-red-500", label: "TARJETA ROJA", code: "R" },
    { color: "bg-black", label: "SUSPENDIDO", code: "S" },
    // { color: "bg-green-500", label: "HABILITADO", code: "H" },
    { color: "bg-orange-500", label: "ROJA A EVALUAR", code: "RE" },
    { color: "bg-gray-500", label: "DESCANSO", code: "D" },
  ];

  return (
    <div className="container mx-auto p-1 mt-1">
      <div className="mt-1 text-center">
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
              {fechasGrupo.map((fecha, i) => (
                <th key={i} className="bg-blue-600 text-white px-4 py-2">
                  {i + 1}° FECHA
                </th>
              ))}
              {etapasFaseFinal.map((etapa, i) => (
                <th key={i} className="bg-blue-600 text-white px-4 py-2">
                  {etapa.toUpperCase()}
                </th>
              ))}
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
                <td className="px-4 py-2 max-w-xs truncate text-left">
                  {formatearNombreCompleto(sancion.name)}
                </td>
                {fechasGrupo.map((fecha, i) => (
                  <td
                    key={i}
                    className={`px-4 py-2 text-center ${getColorClass(
                      sancion[fecha]
                    )}`}
                  >
                    {sancion[fecha]}
                  </td>
                ))}
                {etapasFaseFinal.map((etapa) => (
                  <td
                    key={etapa}
                    className={`px-4 py-2 text-center ${getColorClass(
                      sancion[etapa]
                    )}`}
                  >
                    {sancion[etapa]}
                  </td>
                ))}
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
    case "AA/R":
      return "bg-red-500 text-white";
    case "A/R":
      return "bg-red-500 text-white";
    case "RE":
    case "A/RE":
    case "AA/RE":
      return "bg-orange-500 text-white";
    case "S":
      return "bg-black text-white";
    case "H":
      return "bg-green-500 text-white";
    case "D":
      return "bg-gray-500 text-white";
    default:
      return "";
  }
};

export default TablaSanciones;