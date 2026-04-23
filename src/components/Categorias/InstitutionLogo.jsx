import React, { useState } from "react";
import { Avatar, Tooltip } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

/**
 * Muestra el logo de la institución con fallback a inicial o ícono de escuela.
 *
 * @param {string|null} logoUrl     - URL completa del logo (viene de institution.logoUrl)
 * @param {string}      name        - Nombre de la institución (para alt y tooltip)
 * @param {number}      size        - Tamaño en px (default 24)
 * @param {boolean}     showTooltip - Mostrar tooltip con el nombre al hacer hover
 */
const InstitutionLogo = ({ logoUrl, name = "", size = 24, showTooltip = false }) => {
  const [imgError, setImgError] = useState(false);

  const avatar = (
    <Avatar
      src={!imgError && logoUrl ? logoUrl : undefined}
      alt={name}
      onError={() => setImgError(true)}
      sx={{
        width: size,
        height: size,
        bgcolor: "action.selected",
        border: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
        fontSize: size * 0.45,
        "& .MuiAvatar-img": { objectFit: "contain", padding: "2px" },
      }}
    >
      {name?.trim() ? (
        name.trim()[0].toUpperCase()
      ) : (
        <SchoolIcon sx={{ fontSize: size * 0.55 }} />
      )}
    </Avatar>
  );

  if (showTooltip && name) {
    return (
      <Tooltip title={name} placement="top" arrow>
        <span style={{ display: "inline-flex", flexShrink: 0 }}>{avatar}</span>
      </Tooltip>
    );
  }

  return avatar;
};

export default InstitutionLogo;
