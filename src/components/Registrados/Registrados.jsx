import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { formatearNombreCompleto } from "../../utils/formatName.js";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";

const Registrados = () => {
  const [searchParams] = useSearchParams();
  const { idevent, idsport } = useParams();
  const [registrados, setRegistrados] = useState([]);
  const [universidad, setUniversidad] = useState("");
  const [cantidad, setCantidad] = useState(0);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true); // Estado para el mensaje de carga

  const idinstitution = searchParams.get("idinstitution");

  const getRegistrados = async () => {
    try {
      const urlApi =
        Number(idevent) === 1 || Number(idevent) === 80
          ? "https://master.hayllis.com/public/events/nominal"
          : "https://sismaster.perufedup.com/public/events/nominal";

      const response = await axios.post(urlApi, {
        idevent: Number(idevent),
        idsport: Number(idsport),
        iduni: Number(idinstitution),
      });
      setRegistrados(response.data);
      if (response.data.length > 0) {
        setUniversidad(response.data[0].business);
        setCantidad(response.data.length);
      }
      setLoading(false); // Desactiva el mensaje de carga después de obtener los datos
    } catch (error) {
      console.error("Error al obtener registrados", error);
      setLoading(false);
    }
  };

  const getInstitution = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/institution`, {
        idinstitution,
      });
      setInstitution(response.data);
    } catch (error) {
      console.error("Error al obtener la institution", error);
    }
  };

  const getBaseUrl = () =>
    Number(idevent) === 1 || Number(idevent) === 80
      ? "https://master.hayllis.com"
      : "https://sismaster.perufedup.com";

  useEffect(() => {
    getRegistrados();
    if (idinstitution) {
      getInstitution();
    }
  }, [idevent, idsport, idinstitution]);

  return (
    <div
      className="p-6 bg-gray-100 min-h-screen"
      style={{ fontFamily: "Quicksand" }}
    >
      {loading ? (
        <div className="text-center text-4xl font-bold text-gray-800 mt-20">
          CARGANDO DEPORTISTAS...
        </div>
      ) : (
        <>
          <div className="flex items-center space-x-4 mb-8">
            <h2 className="text-3xl font-extrabold text-gray-800">
              Registrados de {institution?.abrev}
            </h2>
            <img
              src={`${institution?.path_base}${institution?.image_path}`}
              alt={institution?.name}
              className="w-14 h-14 rounded-full border border-gray-300 object-cover shadow-sm"
            />
          </div>
          <p className="text-lg font-medium text-gray-700 mb-6">
            <strong>{universidad}</strong> ({cantidad} participantes)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {registrados.map((participant) => (
              <div
                key={participant.idperson}
                className="flex items-center bg-white shadow-md rounded-xl overflow-hidden p-5 transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
              >
                <img
                  src={`${getBaseUrl()}/writable/uploads/${participant.photo}`}
                  alt={participant.persona}
                  className="w-20 h-20 rounded-full object-cover border border-gray-300 shadow-sm"
                />
                <div className="ml-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {formatearNombreCompleto(participant.persona)}
                  </h2>
                  <p className="text-md text-gray-600">
                    ({participant.function_name})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Registrados;
