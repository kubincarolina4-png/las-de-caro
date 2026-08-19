// El shim tiene que importarse ANTES que LasDeCaro, para que
// window.storage ya exista cuando el componente lo use.
import "./lib/supabaseStorageShim.js";

import React from "react";
import ReactDOM from "react-dom/client";
import LasDeCaro from "./LasDeCaro.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LasDeCaro />
  </React.StrictMode>
);
