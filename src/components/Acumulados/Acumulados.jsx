import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { useParams } from "react-router-dom";
import { formatIdSport } from "../../utils/formatIdSport.js";

const Acumulados = () => {
  const { idevent, idsport } = useParams();
  const [acumulados, setAcumulados] = useState([]);
  const [useAbrev, setUseAbrev] = useState(true); // Estado para alternar entre abrev y nombre

  const formattedSport = formatIdSport(Number(idsport));

  useEffect(() => {
    const getAcumulados = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/getacumulados`, {
          idevent: Number(idevent),
          idsport: Number(idsport),
        });
        console.log("acumulado", response.data);
        setAcumulados(response.data); // Guardar los datos en el estado
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    if (idevent && idsport) {
      getAcumulados();
    }
  }, [idevent, idsport]);

  // Función para obtener el subtítulo basado en el deporte
  const getSubtitulo = (formattedSport) => {
    switch (formattedSport) {
      case 1: // Fútbol
        return "Se está tomando estos criterios: COEF > PTS > DG > GF";
      case 2: // Futsal
        return "Se está tomando estos criterios: COEF > PTS > DG > GF";
      case 3: // Voleibol
        return "Se está tomando estos criterios: COEF > PTS > G > Ratio Set > Ratio Puntos";
      case 4: // Basquetbol
        return "Se está tomando estos criterios: COEF > PTS > DP";
      case 5: // Handball
        return "Se está tomando estos criterios: COEF > PTS > DP";
      default:
        return "Criterios de desempate no especificados para este deporte.";
    }
  };

  const cantGrupos = useMemo(() => {
    if (!acumulados.length) return 0;
    // Toma el mayor idgrupo como cantidad de grupos
    return Math.max(...acumulados.map(a => Number(a?.idgrupo) || 0));
  }, [acumulados]);
  
  const cantParticipantes = acumulados.length;
  
  const bloque = useMemo(() => {
    if (cantGrupos <= 0) return 0;
    const b = Math.floor(cantParticipantes / cantGrupos);
    // Asegura mínimo 1 para evitar % 0
    return Math.max(1, b);
  }, [cantGrupos, cantParticipantes]);
  
  const getRowStyle = (index) => {
    const styles = {};

    console.log("cantGrupos, bloque, index", cantGrupos, bloque, index);
  
    // Cada 'bloque' participantes, dibuja una línea (excepto antes del primero)
    if (bloque > 0 && index > 0 && index % bloque === 0) {
      styles.borderTop = "4px solid #cbd5e1"; // border-gray-400
    }
  
    // (Opcional) Mantener el fondo rojo para las últimas 8 filas
    // if (index >= Math.max(0, acumulados.length - 8)) {
    //   styles.backgroundColor = "#fecaca"; // bg-red-200
    // }
  
    return styles;
  };
  

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800">
        Tabla de Acumulados
      </h1>
      <h2 className="text-xl font-medium text-center mb-6 text-gray-600">
        {getSubtitulo(formattedSport)}
      </h2>
      <div className="flex justify-end mb-6">
        <label className="mr-2 text-gray-700 font-medium">
          Mostrar nombre completo:
        </label>
        <div className="relative inline-block w-10 mr-2 align-middle select-none">
          <input
            type="checkbox"
            name="toggle"
            id="toggle"
            checked={!useAbrev}
            onChange={() => setUseAbrev(!useAbrev)}
            className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
          />
          <label
            htmlFor="toggle"
            className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${!useAbrev ? "bg-green-400" : "bg-gray-300"
              }`}
          ></label>
          <style jsx>{`
            .toggle-checkbox:checked {
              right: 0;
              border-color: #34d399;
            }
            .toggle-checkbox:checked + .toggle-label {
              background-color: #34d399;
            }
          `}</style>
        </div>
      </div>
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nro
            </th>
            <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Institución
            </th>
            {formattedSport === 1 ||
              formattedSport === 2 ||
              formattedSport === 5 ? (
              <>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COEF.
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PJ
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTS
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DG
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  GF
                </th>
              </>
            ) : formattedSport === 3 ? (
              <>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COEF.
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PJ
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTS
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  G
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ratio Set
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ratio Puntos
                </th>
              </>
            ) : (
              <>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  COEF.
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PJ
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PTS
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DP
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {acumulados.map((acum, index) => (
            <tr
              key={index}
              style={getRowStyle(index)}
              className="text-left hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">
                {acum.posicion}
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex items-center text-sm font-medium text-gray-900">
                <img
                  src={`${acum.participant?.Institution?.path_base}${acum.participant?.Institution?.image_path}`}
                  alt={acum.participant?.Institution?.abrev}
                  className="h-8 w-auto mr-3"
                />
                <span className="text-left">
                  {useAbrev
                    ? acum.participant?.Institution?.abrev
                    : acum.participant?.Institution?.name}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {acum.coeficiente}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {acum.pj}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                {acum.pts}
              </td>
              {formattedSport === 1 ||
                formattedSport === 2 ||
                formattedSport === 5 ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.dp}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.pf}
                  </td>
                </>
              ) : formattedSport === 3 ? (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.g}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.ratioSet === "99.999" ? "Max." : acum.ratioSet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.ratioPuntos === "99.999" ? "Max." : acum.ratioPuntos}
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                    {acum.dp}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Acumulados;
