import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
// import MapWithSearch from "./Search.jsx";
// import IntroCard from "./IntroCard.jsx";
import "../styles/index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <>
      {/* <MapWithSearch /> */}
      <App />
      {/* <IntroCard /> */}
    </>
  </StrictMode>
);
