import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import PrivateGate from "./components/PrivateGate.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PrivateGate>
      <App />
    </PrivateGate>
  </React.StrictMode>
);
