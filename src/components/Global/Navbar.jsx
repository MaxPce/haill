import React, { useState, useEffect } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setYearSelected } from "../../features/yearSlice.js";
import { useNavigate } from "react-router-dom";

import "./Navbar.css"; // Archivo CSS personalizado

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch("https://cloud-master.perufedup.com/public/catalogue/MjA=");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Ordenar años en orden descendente
        const sortedYears = data.sort((a, b) => parseInt(b.name) - parseInt(a.name));
        setYears(sortedYears);

        // Seleccionar el año más reciente como predeterminado
        const defaultYear = sortedYears[0];
        setSelectedYear(defaultYear?.id);
        dispatch(setYearSelected(defaultYear?.id));
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, [dispatch]);
  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    dispatch(setYearSelected(year));
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="fixed bg-white text-gray-800 shadow-lg w-full z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img
            // src="/assets/logos/logo_fedup_new.png"
            src="/assets/logos/hayllis.png"
            alt="Logo"
            className="h-10 mr-3 cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
        <div className="block lg:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-800 focus:outline-none"
          >
            {isOpen ? <FaTimes size={30} /> : <HiOutlineMenuAlt2 size={30} />}
          </button>
        </div>
        <div
          className={`lg:flex lg:items-center lg:w-auto transition-all duration-500 ease-in-out absolute lg:static top-16 left-0 w-full bg-white z-50 ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            } lg:opacity-100 lg:max-h-full p-4 lg:p-0 overflow-hidden`}
        >
          <div className="flex items-center space-x-4 mr-5">
            <select
              value={selectedYear || ""}
              onChange={handleYearChange}
              className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 py-2 px-4 outline-none"
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.name}
                </option>
              ))}
            </select>
          </div>
          <ul className="lg:flex lg:justify-between text-base lg:space-x-8">
            <li className="mt-2 lg:mt-0">
              <a
                href="/"
                className="block py-2 lg:py-0 lg:inline-block text-gray-800 hover:text-gray-400"
              >
                Torneos
              </a>
            </li>
            <li className="mt-2 lg:mt-0">
              <a
                href="/central"
                className="block py-2 lg:py-0 lg:inline-block text-gray-800 hover:text-gray-400"
              >
                Día x Día
              </a>
            </li>
            <li className="mt-2 lg:mt-0">
              <a
                // href="/ranking"
                href="https://sistema.hayllis.com/public/medals"
                target="_blank"
                className="block py-2 lg:py-0 lg:inline-block text-gray-800 hover:text-gray-400"
              >
                Medallero
              </a>
            </li>
            {/* <li className="mt-2 lg:mt-0">
              <a
                href="https://www.perufedup.com"
                target="_blank"
                className="block py-2 lg:py-0 lg:inline-block text-gray-800 hover:text-gray-400"
              >
                Nosotros
              </a>
            </li>
            <li className="mt-2 lg:mt-0">
              <a
                href="https://www.instagram.com/perufedup"
                target="_blank"
                className="block py-2 lg:py-0 lg:inline-block text-gray-800 hover:text-gray-400"
              >
                Redes
              </a>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
