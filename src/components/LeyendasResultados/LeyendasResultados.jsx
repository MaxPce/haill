import { resultMatch } from "../../utils/resultMatch.js";

const LeyendasResultados = () => {
  const resultados = [
    { state: 1, description: "Ganar" },
    { state: 2, description: "Empate" },
    { state: 3, description: "Perder" },
    { state: 5, description: "WO" },
  ];

  return (
    <div className="flex justify-center space-x-6 my-4">
      {resultados.map(({ state, description }) => {
        const { label, color } = resultMatch(state);
        return (
          <div key={state} className="flex flex-col items-center space-y-1">
            <span
              className={`inline-block w-10 h-10 text-center font-bold rounded-full flex items-center justify-center ${
                state === 5 ? "bg-gray-800 text-white" : color
              }`}
            >
              {label === "N" ? (
                <span className="invisible"> N </span>
              ) : (
                <>{label}</>
              )}
            </span>
            <span className="text-sm font-medium text-gray-700 text-center whitespace-pre-line">
              {description}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default LeyendasResultados;
