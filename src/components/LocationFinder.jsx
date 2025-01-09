import PropTypes from "prop-types";
import axios from "axios";
import { useMapEvents } from "react-leaflet";

const GEO_API_KEY = import.meta.env.VITE_REVERSE_GEO_API;

export default function LocationFinder({
  setMarker,
  setLocation,
  setFormData,
  setShowAddLocation,
  searchInUse,
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);
      if (searchInUse) return;
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json`,
          {
            params: {
              q: `${lat}+${lng}`,
              key: GEO_API_KEY,
            },
          }
        );
        const locationName =
          response.data.results[0]?.formatted || "Unknown Location";
        setLocation(locationName);
        setFormData((prevState) => ({
          ...prevState,
          location: locationName,
          latitude: lat,
          longitude: lng,
        }));
        setShowAddLocation(true);
        console.log("after state");
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Failed to get location");
      }
    },
  });

  return null;
}

LocationFinder.propTypes = {
  setMarker: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  setFormData: PropTypes.func.isRequired,
  setShowAddLocation: PropTypes.func.isRequired,
  searchInUse: PropTypes.bool.isRequired,
};
