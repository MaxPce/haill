import React, { useEffect } from "react";
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import { initGA, logPageView } from "./analytics";
import "./App.css";

import Companies from "./pages/Companies";
import Torneos from "./pages/Torneos";
import ListSports from "./pages/ListSports";
import Sport from "./pages/Sport";
import Goleadores from "./pages/Goleadores";
import Sanciones from "./pages/Sanciones";
import Central from "./pages/Central";
import Registrados from "./components/Registrados/Registrados";
import FechaPrint from "./pages/FechaPrint";
import Ranking from "./pages/Ranking";
import PuntajeGeneral from "./pages/PuntajeGeneral";
import TablaAcumulada from "./pages/TablaAcumulada";

// Componente que escucha cambios de ruta
function GAListener({ children }) {
  const location = useLocation();

  // Inicializa GA una sola vez
  useEffect(() => {
    initGA();
  }, []);

  // En cada cambio de ruta, envía un page_view
  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return children;
}

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <GAListener>
            <Routes>
              <Route path="/" element={<Companies />} />
              <Route path="/central" element={<Central />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/torneos" element={<Torneos />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/torneos/:idevent/sports" element={<ListSports />} />
              <Route
                path="/torneos/:idevent/puntaje-general"
                element={<PuntajeGeneral />}
              />
              <Route
                path="/torneos/:idevent/tabla-acumulada"
                element={<TablaAcumulada />}
              />
              <Route
                path="/torneos/:idevent/sports/:idsport/sport"
                element={<Sport />}
              />
              <Route
                path="/torneos/:idevent/sports/:idsport/sport/:nrofecha/fecha"
                element={<FechaPrint />}
              />
              <Route
                path="/torneos/:idevent/sports/:idsport/sport/:idinstitution/institution"
                element={<Registrados />}
              />
              <Route
                path="/torneos/:idevent/sports/:idsport/sport/goleadores"
                element={<Goleadores />}
              />
              <Route
                path="/torneos/:idevent/sports/:idsport/sport/sanciones"
                element={<Sanciones />}
              />
            </Routes>
          </GAListener>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
