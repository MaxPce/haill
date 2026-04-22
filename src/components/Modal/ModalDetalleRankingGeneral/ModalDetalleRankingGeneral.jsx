import React from "react";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";

const ModalDetalleRankingGeneral = ({ open, setOpen }) => {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      onClose={() => setOpen(false)}
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <Sheet
        variant="outlined"
        sx={{
          maxWidth: 600,
          borderRadius: "md",
          p: 3,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", // sombra sutil
          border: "none", // eliminar borde
        }}
      >
        <ModalClose variant="plain" sx={{ m: 1 }} />
        <Typography
          component="h2"
          id="modal-title"
          level="h4"
          textColor="inherit"
          sx={{ fontWeight: "lg", mb: 1, textAlign: "center" }}
        >
          DETALLE UPC
        </Typography>
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                <th className="px-4 py-2 text-gray-700 font-semibold">
                  Deporte
                </th>
                <th className="px-4 py-2 text-gray-700 font-semibold">
                  Puesto
                </th>
                <th className="px-4 py-2 text-gray-700 font-semibold">
                  Puntos
                </th>
                <th className="px-4 py-2 text-gray-700 font-semibold">
                  Participación
                </th>
                <th className="px-4 py-2 text-gray-700 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2">Taekwondo</td>
                <td className="px-4 py-2">1</td>
                <td className="px-4 py-2">20</td>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">22</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Lev. pesas</td>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">16</td>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">18</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2">Wushu</td>
                <td className="px-4 py-2">4</td>
                <td className="px-4 py-2">8</td>
                <td className="px-4 py-2">2</td>
                <td className="px-4 py-2">10</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-4">
          <p className="text-lg font-bold">
            Total Final: <span className="text-indigo-600">50</span>
          </p>
        </div>
      </Sheet>
    </Modal>
  );
};

export default ModalDetalleRankingGeneral;
