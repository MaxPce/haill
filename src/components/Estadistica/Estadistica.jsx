// src/components/Estadistica/Estadistica.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config/config.js";
import { Tab } from "@headlessui/react";
import { useParams } from "react-router-dom";
import Futbol from "../Posiciones/Futbol/Futbol";
import Voleibol from "../Posiciones/Voleibol/Voleibol";
import Voleibol2 from "../Posiciones/Voleibol2/Voleibol2";
import Basquetbol from "../Posiciones/Basquetbol/Basquetbol";
import Rugby from "../Posiciones/Rugby/Rugby.jsx";
import Acumulados from "../Acumulados/Acumulados";
import TablaSanciones from "../TablaSanciones/TablaSanciones";
import TablaSanciones2 from "../TablaSanciones/TablaSanciones2.jsx";
import TablaSancionesIda from "../TablaSanciones/TablaSancionesIda.jsx";
import { formatIdSport } from "../../utils/formatIdSport.js";
import "./Estadistica.css";
import LeyendasResultados from "../../components/LeyendasResultados/LeyendasResultados";
import TablaGoleadores from "../TablaGoleadores/TablaGoleadores";
import TablaGoleadores2 from "../TablaGoleadores/TablaGoleadores2";
import ControlTarjetasHeader from "../TablaSanciones/ControlTarjetasHeader.jsx";
import TablaTries from "../TablaGoleadores/TablaTries.jsx";
import TablaCanastas from "../TablaGoleadores/TablaCanastas.jsx";
import TablaConmocion from "../TablaSanciones/TablaConmocion.jsx";

import Ranking from "./components/Ranking.jsx";
import TablaConversionesPenales from "../TablaGoleadores/TablaConversionesPenales.jsx";

const Estadistica = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  // const [positions, setPositions] = useState([]);
  const [useAcumulado, setUseAcumulado] = useState(false);
  const [useGoleadores, setUseGoleadores] = useState(false);
  const [useSanciones, setUseSanciones] = useState(false);
  const [useConmocion, setUseConmocion] = useState(false);
  const [useConversionPenales, setUseConversionPenales] = useState(false);
  const [useDI, setUseDI] = useState(false);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const { idevent, idsport } = useParams();
  const encodedIdsport = btoa(idsport);

  const formattedSport = formatIdSport(parseInt(idsport));

  useEffect(() => {
    const getConfigCategory = async () => {
      const response = await axios.post(`${API_BASE_URL}/config_category`, {
        idevent: Number(idevent),
        idsport: Number(idsport),
      });
      const data = response.data;
      console.log("config", data);
      setUseAcumulado(data.useAcumulado);
      setUseDI(data.useColumnaDeporteIntegral);

      if (
        Number(idsport) === 6 ||
        Number(idsport) === 7 ||
        Number(idsport) === 5 ||
        Number(idsport) === 42 ||
        Number(idsport) === 121 ||
        Number(idsport) === 122
      ) {
        setUseGoleadores(true);
        setUseSanciones(true);
      }
      if (
        Number(idsport) === 56 ||
        Number(idsport) === 57
      ) {
        setUseGoleadores(true);
        setUseSanciones(true);
        setUseConversionPenales(true)
        setUseConmocion(true)
      }

      // if (Number(idsport) === 16 || Number(idsport) === 17) {
      //   setUseSanciones(true);
      // }

      if (Number(idsport) === 3 || Number(idsport) === 4) {
        setUseGoleadores(true);
      }
    };

    if (idevent && idsport) {
      getConfigCategory();
    }
  }, [idevent, idsport]);

  const renderPositions = () => {
    switch (formattedSport) {
      case 1:
      case 2:
      case 5:
        return <Futbol useDI={useDI} />;
      case 3:
        return <Voleibol />;
      case 4:
        return <Basquetbol useDI={useDI} />;
      case 6:
        return <Rugby />
      default:
        return <p>No hay datos de posiciones disponibles.</p>;
    }
  };

  const renderVoleibol2 = () => {
    return <Voleibol2 />;
  };

  return (
    <div className="estadistica-container font-quickSand">
      {/* Embeber URL arriba de las pestañas */}
      {
        (Number(idevent) === 1 || Number(idevent) === 150) && (
          <div className="flex justify-center my-4">
            <a
              href={`https://sistema.hayllis.com/public/medals/${encodedIdsport}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
            >
              Ver Medallero del Deporte
            </a>
          </div>
        )
      }

      <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="flex justify-center space-x-1 rounded-lg bg-gray-100 p-1">
          <Tab
            className={({ selected }) =>
              selected
                ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
            }
          >
            Tabla de Posiciones
          </Tab>
          {useAcumulado && (
            <Tab
              className={({ selected }) =>
                selected
                  ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                  : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
              }
            >
              Acumulados
            </Tab>
          )}
          {useGoleadores && (
            <Tab
              className={({ selected }) =>
                selected
                  ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                  : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
              }
            >
              {(Number(idsport) === 3 || Number(idsport) === 4) ? "Canastas" : Number(idsport) === 56 || Number(idsport) === 57 ? "Tabla de Tries" : "Goleadores"}
            </Tab>
          )}
          {
            useConversionPenales && (
              <Tab
                className={({ selected }) =>
                  selected
                    ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                    : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
                }
              >
                Más Estadística
              </Tab>
            )
          }
          {useSanciones && (
            <Tab
              className={({ selected }) =>
                selected
                  ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                  : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
              }
            >
              Sanciones
            </Tab>
          )}
          {
            useConmocion && (
              <Tab
                className={({ selected }) =>
                  selected
                    ? "tab_selected w-full py-2.5 text-sm font-medium leading-5"
                    : "tab_unselected w-full py-2.5 text-sm font-medium leading-5"
                }
              >
                Conmociones
              </Tab>
            )
          }
        </Tab.List>
        <Tab.Panels className="mt-2 overflow-x-auto">
          <Tab.Panel>
            {/* LEYENDAS */}
            <LeyendasResultados />
            {/* Contenido de la Tabla de Posiciones */}
            {idevent &&
              idsport &&
              Number(idevent) === 1 &&
              (Number(idsport) === 16 || Number(idsport) === 17) ? (
              <div className="content">{renderVoleibol2()}</div>
            ) : (
              <>
                {/* Posiciones */}
                <div className="content w-full overflow-x-auto hover:overflow-x-hidden rounded-2xl border border-gray-200/50 bg-white/40 backdrop-blur-md shadow-md ring-1 ring-gray-100/40">
                  {renderPositions()}
                </div>

                {/* Ranking */}
                {
                  (+idevent === 220 || +idevent === 201 || +idevent === 197 || +idevent === 199 || +idevent === 101 || +idevent === 80 || +idevent === 214 || +idevent === 215 || +idevent === 216 || +idevent === 217 || +idevent === 218 || +idevent === 212 || +idevent === 211) && (
                    <div className="content w-full mt-6 overflow-x-auto hover:overflow-x-hidden rounded-2xl border border-gray-200/50 bg-white/40 backdrop-blur-md shadow-md ring-1 ring-gray-100/40">
                      <Ranking />
                    </div>
                  )
                }
              </>

            )}
          </Tab.Panel>
          {useAcumulado && (
            <Tab.Panel>
              <div className="content">
                <Acumulados />
              </div>
            </Tab.Panel>
          )}
          {useGoleadores && (
            <Tab.Panel>
              <div className="content">
                {Number(idsport) === 56 || Number(idsport) === 57 ? (
                  <TablaTries />
                ) : Number(idsport) === 3 || Number(idsport) === 4 ? (
                  <TablaCanastas />
                ) : (
                  <TablaGoleadores2 />
                )}
              </div>
            </Tab.Panel>
          )}
          {
            useConversionPenales && (
              <Tab.Panel>
                <div className="content">
                  <TablaConversionesPenales />
                </div>
              </Tab.Panel>
            )
          }
          {useSanciones && (
            <Tab.Panel>
              <div className="content w-full overflow-x-auto">
                <ControlTarjetasHeader />
                {
                  (+idevent === 197 || +idevent === 212) && (+idsport === 6 || +idsport === 7 || +idsport === 5) ? (
                    <TablaSancionesIda />
                  ) : (<TablaSanciones2 />)
                }
              </div>
            </Tab.Panel>
          )}
          {
            useConmocion && (
              <Tab.Panel>
                <div className="content">
                  <TablaConmocion />
                </div>
              </Tab.Panel>
            )
          }
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Estadistica;
