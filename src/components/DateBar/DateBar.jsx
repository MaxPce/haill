import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Activar los plugins de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const DateBar = ({ selectedDate, onDateChange }) => {
  const [dates, setDates] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const dateBarRef = useRef(null);

  useEffect(() => {
    const today = dayjs().tz("America/Lima");
    generateDates(today);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (isFirstLoad) {
      const today = dayjs().tz("America/Lima").format("YYYY-MM-DD");
      onDateChange(today); // Actualizar el estado de la fecha seleccionada
      scrollToToday(); // Desplazar la vista a "hoy"
      setIsFirstLoad(false); // Evitar que esto ocurra en futuras actualizaciones
    }
  }, [isFirstLoad, onDateChange]);

  // Genera fechas centradas alrededor de centerDate
  const generateDates = (centerDate) => {
    const tempDates = [];
    const startDate = centerDate.subtract(6, "day");

    for (let i = 0; i < 13; i++) {
      tempDates.push(startDate.add(i, "day").format("YYYY-MM-DD"));
    }

    setDates(tempDates);
  };

  // Retroceder un día
  const handlePrevClick = () => {
    const currentCenterDate = dayjs(selectedDate, "YYYY-MM-DD").tz(
      "America/Lima"
    );
    const newCenterDate = currentCenterDate.subtract(1, "day");
    generateDates(newCenterDate);
    onDateChange(newCenterDate.format("YYYY-MM-DD")); // Actualizar la fecha seleccionada
  };

  // Avanzar un día
  const handleNextClick = () => {
    const currentCenterDate = dayjs(selectedDate, "YYYY-MM-DD").tz(
      "America/Lima"
    );
    const newCenterDate = currentCenterDate.add(1, "day");
    generateDates(newCenterDate);
    onDateChange(newCenterDate.format("YYYY-MM-DD")); // Actualizar la fecha seleccionada
  };

  const scrollToToday = () => {
    const todayElement = dateBarRef.current?.querySelector(
      `[data-date="${dayjs().tz("America/Lima").format("YYYY-MM-DD")}"]`
    );
    if (todayElement) {
      todayElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  // En dispositivos móviles, solo mostramos un rango más pequeño (ayer, hoy, mañana)
  const getMobileDates = () => {
    const currentDate = dayjs(selectedDate, "YYYY-MM-DD").tz("America/Lima");
    return [
      currentDate.subtract(1, "day").format("YYYY-MM-DD"), // Ayer
      currentDate.format("YYYY-MM-DD"), // Hoy
      currentDate.add(1, "day").format("YYYY-MM-DD"), // Mañana
    ];
  };

  // Si estamos en móvil, mostramos solo ayer, hoy y mañana. En otros casos, mostramos todas las fechas.
  const displayedDates = isMobile ? getMobileDates() : dates;

  return (
    <div
      className="flex items-center justify-between overflow-x-auto py-4 bg-white shadow-md rounded-lg px-4 mt-5"
      ref={dateBarRef}
    >
      <button
        onClick={handlePrevClick}
        className="px-4 text-gray-500 hover:text-indigo-600 transition-colors duration-300"
      >
        <FaChevronLeft size={20} />
      </button>

      <div className="flex space-x-6">
        {displayedDates.map((date, index) => (
          <div
            key={index}
            data-date={date}
            onClick={() => onDateChange(date)}
            className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
              date === selectedDate
                ? "text-indigo-600 font-bold border-b-2 border-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-sm uppercase">
              {dayjs(date, "YYYY-MM-DD").tz("America/Lima").format("ddd")}
            </span>
            <span className="text-lg">
              {dayjs(date, "YYYY-MM-DD").tz("America/Lima").format("D MMM")}
            </span>
            {date === dayjs().tz("America/Lima").format("YYYY-MM-DD") && (
              <span className="text-xs font-semibold mt-1 text-red-500">
                HOY
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleNextClick}
        className="px-4 text-gray-500 hover:text-indigo-600 transition-colors duration-300"
      >
        <FaChevronRight size={20} />
      </button>
    </div>
  );
};

export default DateBar;
