import { installStorageShim } from "./storageShim.js";
installStorageShim(); // must run before App.jsx's first window.storage call

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
