import React, { useState } from "react";
import ModalDetalleRankingGeneral from "../components/Modal/ModalDetalleRankingGeneral/ModalDetalleRankingGeneral";

const RankingSection = () => {
  const [open, setOpen] = useState(false);

  const rankingData = [
    { id: 1, logo: "UPC.png", name: "UPC", points: 110 },
    { id: 2, logo: "ULIMA.png", name: "ULIMA", points: 50 },
    { id: 3, logo: "UTP.png", name: "UTP-L", points: 30 },
    { id: 4, logo: "PUCP.png", name: "PUCP", points: 26 },
    { id: 5, logo: "UNMSM.png", name: "UNMSM", points: 22 },
    { id: 6, logo: "USIL.png", name: "USIL", points: 20 },
    { id: 7, logo: "UC.png", name: "UC-HU", points: 20 },
    { id: 8, logo: "URP.png", name: "URP", points: 18 },
    { id: 9, logo: "UPN.png", name: "UPN-L", points: 18 },
    { id: 10, logo: "UP.png", name: "UP", points: 14 },
    { id: 10, logo: "UC.png", name: "UC-AQP", points: 14 },
  ];

  return (
    <>
      <div
        className="flex justify-center min-h-screen bg-gray-200 w-full"
        style={{ marginTop: "55px" }}
      >
        <div
          className="bg-white shadow-lg rounded-lg p-6 max-w-xl"
          style={{ marginTop: "20px" }}
        >
          <h1 className="text-2xl font-bold mb-2 text-indigo-900 text-center">
            Universiada Arequipa 2024
          </h1>
          <h2 className="text-xl font-semibold mb-6 text-indigo-900 text-center">
            RANKING GENERAL
          </h2>

          <div className="space-y-4">
            {rankingData.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between cursor-pointer hover:bg-gray-100 hover:scale-105 transform transition-transform duration-300 ease-in-out p-2 rounded-lg"
                onClick={() => setOpen(true)}
              >
                <div className="text-lg font-semibold text-indigo-900 text-center w-10">
                  {team.id}
                </div>
                <div className="flex justify-center w-10">
                  <img
                    src={`/assets/logos_oficiales_unis/${team.logo}`}
                    alt={`${team.name} logo`}
                    className="w-8 h-8"
                  />
                </div>
                <div className="text-lg font-semibold text-gray-700 flex-grow">
                  {team.name}
                </div>
                <div className="text-lg font-semibold text-white bg-indigo-900 px-3 py-1 rounded-lg text-center w-16">
                  {team.points}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {open && <ModalDetalleRankingGeneral open={open} setOpen={setOpen} />}
    </>
  );
};

export default RankingSection;
