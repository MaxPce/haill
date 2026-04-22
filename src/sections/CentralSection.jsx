import React, { useState } from "react";
import DateBar from "../components/DateBar/DateBar";
import MatchDay from "../components/MatchDay/MatchDay";
import dayjs from "dayjs";

const CentralSection = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs().format("DD MMM"));

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="container mx-auto mt-12">
      <DateBar selectedDate={selectedDate} onDateChange={handleDateChange} />
      <MatchDay selectedDate={selectedDate} onDateChange={handleDateChange} />
    </div>
  );
};

export default CentralSection;
