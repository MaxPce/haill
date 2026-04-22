import React from "react";
import Navbar from "../components/Global/Navbar";

import Main from "../ui/Main";

const Layout = ({ children }) => {
  return (
    <>
      <div className="font-quickSand">
        <Navbar />

        <Main>{children}</Main>
      </div>
    </>
  );
};

export default Layout;
