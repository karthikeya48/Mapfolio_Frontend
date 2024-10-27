import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// import Auth from "./Auth.jsx";
// import Register from "./Register.jsx";
import "../styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      <App />
      {/* <Auth /> */}
      {/* <Register /> */}
    </>
  </StrictMode>
);
