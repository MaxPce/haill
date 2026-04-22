import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@mui/joy/Card";
import CardCover from "@mui/joy/CardCover";
import CardContent from "@mui/joy/CardContent";
import Typography from "@mui/joy/Typography";
import Button from "@mui/joy/Button";
import Modal from "@mui/joy/Modal";
import ModalDialog from "@mui/joy/ModalDialog";
import DialogTitle from "@mui/joy/DialogTitle";
import DialogContent from "@mui/joy/DialogContent";
import DialogActions from "@mui/joy/DialogActions";
import API_BASE_URL from "../../../config/config.js";
import axios from "axios";

const CardSport = ({ sport, typeDimension }) => {
  const navigate = useNavigate();
  const { idevent } = useParams();

  const [sportImage, setSportImage] = useState("");
  const [nameSport, setNameSport] = useState("");
  const [openExternalModal, setOpenExternalModal] = useState(false);

  // 🔗 condición para abrir modal con opciones externas
  const isExternal = Number(idevent) === 80 && Number(sport?.idsport) === 19;
  // const isExternal = Number(idevent) === 150 && Number(sport?.idsport) === 10;

  const externalUrl =
    "https://s1.chess-results.com/tnrWZ.aspx?lan=2&art=2&rd=1&turdet=YES&flag=30&SNode=S0&tno=1236861";

  const pdfUrl =
    "https://resultados.hayllis.com/assets/pdf/chiclayo_cmp/Torneo_Colegio_Medico_Clasificación_intermedia.pdf";

  const handleClick = () => {
    if (isExternal) {
      setOpenExternalModal(true);
    } else {
      navigate(`/torneos/${idevent}/sports/${sport.idsport}/sport`);
    }
  };

  const handleOpenResults = () => {
    window.open(externalUrl, "_blank", "noopener,noreferrer");
    setOpenExternalModal(false);
  };

  const handleDownloadPDF = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
    setOpenExternalModal(false);
  };

  useEffect(() => {
    const getConfigCategory = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/config_category`, {
          idevent: Number(idevent),
          idsport: sport.idsport,
        });
        setSportImage(response.data.sport_image);
        setNameSport(response.data.nameSport);
      } catch (error) {
        console.error("Error", error);
      }
    };

    if (idevent && sport?.idsport) {
      getConfigCategory();
    }
  }, [idevent, sport?.idsport]);

  const cardStyles = {
    minWidth: typeDimension === 1 ? 300 : 200,
    minHeight: typeDimension === 1 ? 150 : 300,
    flexGrow: 1,
    position: "relative",
    cursor: "pointer",
    overflow: "hidden",
    "&:hover img": {
      transform: "scale(1.1)",
    },
  };

  return (
    <>
      <Card component="li" onClick={handleClick} sx={cardStyles}>
        <CardCover>
          <img
            src={sportImage ? sportImage : sport.image_path}
            loading="lazy"
            alt=""
            style={{ transition: "transform 0.5s ease" }}
          />
        </CardCover>
        <CardContent
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.61)",
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            padding: "8px",
          }}
        >
          <Typography
            level="body-lg"
            fontWeight="lg"
            textColor="#fff"
            textAlign="left"
          >
            <span className="font-quickSand font-bold">
              {nameSport ? nameSport : sport.name}
            </span>
          </Typography>
        </CardContent>
      </Card>

      {/* Modal de confirmación para opciones externas */}
      <Modal open={openExternalModal} onClose={() => setOpenExternalModal(false)}>
        <ModalDialog
          aria-labelledby="external-options-title"
          aria-describedby="external-options-desc"
        >
          <DialogTitle id="external-options-title">
            ¿Qué deseas hacer?
          </DialogTitle>
          <DialogContent id="external-options-desc">
            Puedes abrir los resultados en Chess-Results o descargar el PDF:
            <br />
            <strong>
              Clasificación Final - Torneo Colegio Medico Clasificación intermedia
            </strong>
          </DialogContent>
          <DialogActions>
            <Button variant="soft" onClick={() => setOpenExternalModal(false)}>
              Cancelar
            </Button>
            <Button variant="outlined" onClick={handleDownloadPDF}>
              Descargar PDF de Clasificación Final
            </Button>
            <Button onClick={handleOpenResults}>
              Ver resultados
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default CardSport;
