/**
 * PURPOSE:
 * Orquestar la vista pública del deporte y sus tabs sin mezclar la UI con los consumos HTTP.
 *
 * RESPONSIBILITIES:
 * - Cargar evento, deporte y config pública mediante services.
 * - Resolver las tabs visibles según el tipo de deporte y casos especiales por evento.
 * - Mantener el tracking de analytics alineado con las tabs realmente renderizadas.
 *
 * COLLABORATORS:
 * - src/services/sportSection.js
 * - src/components/Pruebas/Pruebas.jsx
 * - componentes públicos renderizados por cada tab
 *
 * NOTES:
 * - Se conserva el mapping legacy de tabs de deportes individuales para no romper lo existente.
 * - El caso especial idevent=223 e idsport=2 se aísla en una variante propia.
 *
 * ROUTE:
 * src/sections/SportSection.jsx
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Diversity3Icon from "@mui/icons-material/Diversity3";
import SettingsInputSvideoIcon from "@mui/icons-material/SettingsInputSvideo";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PollIcon from "@mui/icons-material/Poll";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import ScoreboardIcon from "@mui/icons-material/Scoreboard";
import InfoIcon from "@mui/icons-material/Info";
import styled from "@emotion/styled";

import Equipos2 from "../components/Equipos/Equipos2";
import Fixture from "../components/Fixture/Fixture";
import BracketWrapper from "../components/Fixture/BracketWrapper";
import Programacion from "../components/Programacion/Programacion";
import ProgramacionIndividual from "../components/ProgramacionIndividual/ProgramacionIndividual";
import Pruebas from "../components/Pruebas/Pruebas.jsx";
import Categorias from "../components/Categorias/Categorias";
import TablaFinal from "../components/TablaFinal/TablaFinal.jsx";
import Resultados from "../components/Resultados/Resultados";
import Estadistica from "../components/Estadistica/Estadistica";
import Registrados from "../components/Registrados/Registrados";
import Informacion from "../components/Informacion/Informacion";
import ResultadosDoc from "../components/ResultadosDoc/ResultadosDoc";
import Medallero from "../components/Medallero/Medallero";
import { IoChevronBack } from "react-icons/io5";

import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import "./SportSection.css";

import { trackEvent } from "../analytics.js";
import {
  getChampionshipByEvent,
  getPublicSportConfig,
  getSportById,
} from "../services/sportSection.js";

const CustomTabList = styled(TabList)`
  .MuiTab-root {
    color: #616161;
    font-weight: bold;
    text-transform: uppercase;
    transition: color 0.3s;
    &:hover {
      color: #1565c0;
    }
    &.Mui-selected {
      color: #1e88e5;
    }
  }
  .MuiTabs-indicator {
    background-color: #1e88e5;
    height: 4px;
  }
`;

const CustomTabPanel = styled(TabPanel)`
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
`;

/** Renderiza el contenido reutilizable del tab Equipos. */
const renderEquiposPanel = ({ idinstitution, handleInstitutionClick }) => {
  if (idinstitution) {
    return <Registrados institutionId={idinstitution} />;
  }

  return <Equipos2 onInstitutionClick={handleInstitutionClick} />;
};

/** Construye la configuración de tabs para deportes individuales, preservando legacy y casos especiales. */
/** Construye la configuración de tabs para deportes individuales, preservando legacy y casos especiales. */
const buildIndividualTabs = ({
  ideventNumber,
  idsportNumber,
  idinstitution,
  handleInstitutionClick,
}) => {
  const isLimited80 = ideventNumber === 80;
  const isAthleticsSpecial = ideventNumber === 223 && idsportNumber === 2;
  const isJudoSpecial = ideventNumber === 223 && idsportNumber === 8;

  const equiposTab = {
    value: "1",
    label: "Equipos",
    icon: <Diversity3Icon />,
    panel: renderEquiposPanel({ idinstitution, handleInstitutionClick }),
  };

  const hiddenMedalleroPanel = {
    value: "6",
    panel: <Medallero />,
    showInTabList: false,
  };

  if (isAthleticsSpecial) {
    return [
      equiposTab,
      {
        value: "3",
        label: "Información",
        icon: <InfoIcon />,
        panel: <Informacion />,
      },
      {
        value: "4",
        label: "Pruebas",
        icon: <MilitaryTechIcon />,
        panel: <Pruebas />,
      },
      {
        value: "5",
        label: "Tabla Final",
        icon: <ScoreboardIcon />,
        panel: <TablaFinal />,
      },
      hiddenMedalleroPanel,
    ];
  }

  if (isJudoSpecial) {
    return [
      equiposTab,
      {
        value: "3",
        label: "Información",
        icon: <InfoIcon />,
        panel: <Informacion />,
      },
      {
        value: "4",
        label: "Categorías",
        icon: <MilitaryTechIcon />,
        panel: <Categorias />,
      },
      {
        value: "5",
        label: "Tabla Final",
        icon: <ScoreboardIcon />,
        panel: <TablaFinal />,
      },
      hiddenMedalleroPanel,
    ];
  }

  if (isLimited80) {
    return [
      equiposTab,
      {
        value: "5",
        label: "Resultados",
        icon: <ScoreboardIcon />,
        panel: <ResultadosDoc />,
      },
      hiddenMedalleroPanel,
    ];
  }

  return [
    equiposTab,
    {
      value: "3",
      label: "Información",
      icon: <InfoIcon />,
      panel: <ProgramacionIndividual />,
    },
    {
      value: "4",
      label: "Programación",
      icon: <CalendarMonthIcon />,
      panel: <Informacion />,
    },
    {
      value: "5",
      label: "Resultados",
      icon: <ScoreboardIcon />,
      panel: <ResultadosDoc />,
    },
    hiddenMedalleroPanel,
  ];
};

/** Construye la configuración de tabs para deportes colectivos. */
const buildCollectiveTabs = ({ ideventNumber, idinstitution, handleInstitutionClick }) => {
  const tabs = [
    {
      value: "1",
      label: "Equipos",
      icon: <Diversity3Icon />,
      panel: renderEquiposPanel({ idinstitution, handleInstitutionClick }),
    },
  ];

  if (ideventNumber === 16) {
    tabs.push({
      value: "2",
      label: "Fixture",
      icon: <SettingsInputSvideoIcon />,
      panel: <BracketWrapper />,
      onlyWhenTypeSport: 1,
    });
  } else {
    tabs.push({
      value: "2",
      label: "Fixture",
      icon: <SettingsInputSvideoIcon />,
      panel: <Fixture />,
      onlyWhenTypeSport: 1,
    });
  }

  tabs.push(
    {
      value: "3",
      label: "Programación",
      icon: <CalendarMonthIcon />,
      panel: <Programacion />,
    },
    {
      value: "4",
      label: "Resultados",
      icon: <ScoreboardIcon />,
      panel: <Resultados />,
    },
    {
      value: "5",
      label: "Estadística",
      icon: <PollIcon />,
      panel: <Estadistica />,
    }
  );

  return tabs;
};

/** Render helper reutilizable para tabs visibles e icon-only. */
const renderTabItems = (tabs, className, iconOnly = false) =>
  tabs
    .filter((tab) => tab.showInTabList !== false)
    .map((tab) => (
      <Tab
        key={`${className}-${tab.value}`}
        icon={tab.icon}
        label={iconOnly ? undefined : tab.label}
        value={tab.value}
        className={className}
      />
    ));

const SportSection = () => {
  const [value, setValue] = useState(null);
  const { idevent, idsport } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sportBanner, setSportBanner] = useState("");
  const [nameSport, setNameSport] = useState("");
  const [event, setEvent] = useState(null);
  const [sport, setSport] = useState(null);

  const ideventNumber = Number(idevent);
  const idsportNumber = Number(idsport);
  const idinstitution = searchParams.get("idinstitution");
  const navigate = useNavigate();

  const handleInstitutionClick = useCallback((institutionId) => {
    setSearchParams({ idinstitution: institutionId });
  }, [setSearchParams]);

  const tabDefinitions = useMemo(() => {
    if (!sport) {
      return [];
    }

    if (Number(sport.typeSport) === 3) {
      return buildIndividualTabs({
        ideventNumber,
        idsportNumber,
        idinstitution,
        handleInstitutionClick,
      });
    }

    return buildCollectiveTabs({
      ideventNumber,
      idinstitution,
      handleInstitutionClick,
    }).filter((tab) => {
      if (!tab.onlyWhenTypeSport) {
        return true;
      }

      return Number(sport.typeSport) === tab.onlyWhenTypeSport;
    });
  }, [sport, ideventNumber, idsportNumber, idinstitution, handleInstitutionClick]);

  const visibleTabLabels = useMemo(() => {
    return tabDefinitions.reduce((acc, tab) => {
      if (tab.showInTabList === false || !tab.label) {
        return acc;
      }

      acc[tab.value] = tab.label;
      return acc;
    }, {});
  }, [tabDefinitions]);

  const handleChange = (_event, newValue) => {
    setValue(newValue);

    trackEvent({
      category: "Pestañas",
      action: "Seleccionar pestaña",
      label: visibleTabLabels[newValue] || newValue,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadSportSectionData = async () => {
      const [eventResult, sportResult, configResult] = await Promise.allSettled([
        getChampionshipByEvent(idevent),
        getSportById(idsport),
        getPublicSportConfig({ idevent, idsport }),
      ]);

      if (!isMounted) {
        return;
      }

      if (eventResult.status === "fulfilled") {
        setEvent(eventResult.value);
      } else {
        console.error("Error fetching event", eventResult.reason);
      }

      if (sportResult.status === "fulfilled") {
        setSport(sportResult.value);
      } else {
        console.error("Error fetching sport", sportResult.reason);
      }

      if (configResult.status === "fulfilled") {
        const config = configResult.value;
        setSportBanner(config?.sport_banner || "");
        setNameSport(config?.nameSport || "");
        setValue(String(config?.defaultTabLinkPublico || "1"));
      } else {
        console.error("Error fetching config", configResult.reason);
        setValue("1");
      }
    };

    if (idevent && idsport) {
      loadSportSectionData();
    }

    return () => {
      isMounted = false;
    };
  }, [idevent, idsport]);

  useEffect(() => {
    if (!tabDefinitions.length || value === null) {
      return;
    }

    const allowedTabValues = tabDefinitions.map((tab) => String(tab.value));
    if (!allowedTabValues.includes(String(value))) {
      setValue(String(tabDefinitions[0].value));
    }
  }, [tabDefinitions, value]);

  if (value === null) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div
      className="container_deporte_colectivo flex flex-col items-center w-full"
      style={{ marginTop: "75px" }}
    >
      <div>
        <div className="text-center">
          {sportBanner && (
            <div className="w-full flex justify-center mb-4">
              <img
                src={sportBanner}
                alt="Banner"
                className="w-full sm:w-full md:w-11/12 lg:w-11/12 xl:w-11/12 h-auto object-cover"
              />
            </div>
          )}

          <h2 className="text-2xl sm:text-4xl font-bold text-blue-600">{event?.name}</h2>
          <div>
            <h3 className="group flex justify-center items-center text-3xl sm:text-5xl font-extrabold text-gray-900 mt-4">
              <IoChevronBack
                className="cursor-pointer mr-2 group-hover:-translate-x-1 transition-transform duration-150 ease-out"
                onClick={() => navigate(-1)}
              />
              {nameSport || sport?.name}
            </h3>
          </div>
        </div>

        <div className="mt-4 w-full font-quickSand">
          <Box sx={{ width: "100%", typography: "body1" }}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <CustomTabList
                  onChange={handleChange}
                  aria-label="tabs deporte público"
                  centered
                >
                  {renderTabItems(tabDefinitions, "tab-item")}
                  {renderTabItems(tabDefinitions, "tab-item2", true)}
                </CustomTabList>
              </Box>

              {tabDefinitions.map((tab) => (
                <CustomTabPanel key={`panel-${tab.value}`} value={tab.value}>
                  {tab.panel}
                </CustomTabPanel>
              ))}
            </TabContext>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default SportSection;
