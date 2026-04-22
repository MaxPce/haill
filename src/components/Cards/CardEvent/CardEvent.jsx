import React from "react";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import { FaPlaceOfWorship } from "react-icons/fa";
import { IoCalendarSharp } from "react-icons/io5";
import "./CardEvent.css"; // Importa el archivo CSS

import { formatDateRange } from "../../../utils/formatDate.js";

const CardEvent = ({ event }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/torneos/${event.idchampionship}/sports`);
    // navigate("/torneos/186/sports");
  };

  return (
    <div
      className="relative flex flex-col md:flex-row rounded-lg bg-white shadow-md dark:bg-neutral-700 w-full h-auto transform transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer overflow-hidden card-event"
      onClick={handleClick}
    >
      <img
        className="h-48 md:h-auto w-full md:w-48 object-cover rounded-t-lg md:rounded-none md:rounded-l-lg"
        src={event.image_path}
        alt=""
      />
      <div className="flex flex-col justify-start p-6 w-full">
        <h5 className="mb-2 text-xl font-medium font-bold text-gray-700 dark:text-neutral-50">
          {event.name}
        </h5>
        <div className="flex items-center mb-2 text-neutral-600 dark:text-neutral-200">
          <FaPlaceOfWorship className="mr-2 text-blue-500" />
          {/* <span>{event.place}</span> */}
          <span>Lima</span>
        </div>
        <div className="flex items-center mb-4 text-neutral-600 dark:text-neutral-200">
          <IoCalendarSharp className="mr-2 text-green-500" />
          <span>{formatDateRange(event.startdate, event.enddate)}</span>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-300">
          Organizado por {event.organizedBy ? event.organizedBy : "Comité"}
        </p>
      </div>
    </div>
  );
};

export default CardEvent;
