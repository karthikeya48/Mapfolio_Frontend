import axios from "axios";
import PropTypes from "prop-types";
import { useMap } from "react-leaflet";

const GEO_API_KEY = import.meta.env.VITE_REVERSE_GEO_API;

export default function GeoLocationButton({
  setMarker,
  setLocation,
  setFormData,
}) {
  const map = useMap();

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setMarker([latitude, longitude]);
          map.flyTo([latitude, longitude], 13);

          try {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json`,
              {
                params: {
                  q: `${latitude}+${longitude}`,
                  key: GEO_API_KEY,
                },
              }
            );
            const locationName =
              response.data.results[0]?.formatted || "Unknown Location";
            setFormData((prevState) => ({
              ...prevState,
              location: locationName,
            }));
            setLocation(locationName);
          } catch (error) {
            console.error("Error fetching location:", error);
            setLocation("Failed to get location");
          }
        },
        (err) => {
          console.error("Error fetching location:", err);
        },
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <button
      className="geo-button"
      onClick={getLocation}
      style={{
        position: "absolute",
        bottom: "20px",
        right: "20px",
        padding: "10px 15px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        zIndex: 1000,
      }}
    >
      Get Your Location
    </button>
  );
}

GeoLocationButton.propTypes = {
  setMarker: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
};
