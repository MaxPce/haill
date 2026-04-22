import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

export const formatDateRange = (start, end) => {
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  const formattedStartDate = format(startDate, "d MMM", { locale: es });
  const formattedEndDate = format(endDate, "d MMM yyyy", { locale: es });

  return `${formattedStartDate}. al ${formattedEndDate}`;
};
