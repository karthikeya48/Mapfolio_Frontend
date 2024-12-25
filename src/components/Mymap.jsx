import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Mymap.css";
import Upload from "./Upload.jsx";
// import { getAuth } from "firebase/auth";
// import { sendDataToFirestore } from "../backend/firebase";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faSearch, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import Search from "./Search.jsx";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";

const GEO_API_KEY = import.meta.env.VITE_REVERSE_GEO_API;

function LocationFinder({
  setMarker,
  setLocation,
  setFormData,
  setShowAddLocation,
}) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setMarker([lat, lng]);

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
        }));
        setShowAddLocation(true);
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Failed to get location");
      }
    },
  });

  return null;
}

function GeoLocationButton({ setMarker, setLocation, setFormData }) {
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

function MyMap() {
  const [marker, setMarker] = useState(null);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [location, setLocation] = useState("Click on the map to get location");

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    notes: "",
    images: [],
  });

  return (
    <div className=" mapfolio-container">
      {/* <Searchgeolocation setMarker={setMarker} setLocation={setLocation} map = {}/> */}

      {/* Make an update here for testing */}
      {showAddLocation && (
        <div className="mapfolio-form-container ">
          <Upload formData={formData} setFormData={setFormData} />
        </div>
      )}
      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={10}
          className="absolute h-[100vh] w-[100%]"
        >
          <div className="absolute bg-black top-[20px] left-[60px] z-[1000] 2-[300px]">
            <Search
              // setMarker={setMarker}
              setLocation={setLocation}
              setFormData={setFormData}
            />
          </div>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationFinder
            setMarker={setMarker}
            setLocation={setLocation}
            setFormData={setFormData}
            setShowAddLocation={setShowAddLocation}
          />
          {marker && (
            <Marker position={marker}>
              <Popup>{location}</Popup>
            </Marker>
          )}
          <GeoLocationButton
            setMarker={setMarker}
            setLocation={setLocation}
            setFormData={setFormData}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default MyMap;
