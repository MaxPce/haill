import React from "react";

const HeaderSection = ({ title, subtitle, color }) => {
  return (
    <div className="header">
      <div className="title" style={{ backgroundColor: color }}>
        <h1>{title}</h1>
      </div>
      <div className="subtitle">
        <h2>{subtitle}</h2>
      </div>
    </div>
  );
};

export default HeaderSection;
