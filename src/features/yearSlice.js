// src/features/yearSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  yearSelected: null,
};

const yearSlice = createSlice({
  name: "year",
  initialState,
  reducers: {
    setYearSelected: (state, action) => {
      state.yearSelected = action.payload;
    },
  },
});

export const { setYearSelected } = yearSlice.actions;
export default yearSlice.reducer;

// // >> Usarlo en otro componente  --->
// import { useSelector } from "react-redux";

// const ExampleComponent = () => {
//   const yearSelected = useSelector((state) => state.year.yearSelected);

//   return <div>Año seleccionado: {yearSelected}</div>;
// };
