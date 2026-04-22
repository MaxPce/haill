import { configureStore } from "@reduxjs/toolkit";
import yearReducer from "../features/yearSlice.js";

export const store = configureStore({
  reducer: { year: yearReducer },
});
