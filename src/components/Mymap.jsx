import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Mymap.css";
import { getAuth } from "firebase/auth";
import { sendDataToFirestore } from "../backend/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
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

function MapfolioForm({ formData, setFormData }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const uid = user.uid; // Get the user's UID
    try {
      const docId = await sendDataToFirestore(uid, formData);
      console.log("data added to" + docId);
    } catch (error) {
      console.log("Error on submit: " + error);
    }
  };

  return (
    <div className="mapfolio-form">
      <h2>Mapfolio</h2>
      <FontAwesomeIcon
        icon={faArrowLeft}
        style={{
          position: "absolute",
          top: "100px",
          left: "20px",
          zIndex: 1000,
          fontSize: "24px",
          color: "gray",
        }}
      />
      <form>
        <div>
          <label>Name the place:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            readOnly
          />
        </div>
        <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Notes:</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Images:</label>
          <input
            type="file"
            name="images"
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                images: [...prevState.images, ...e.target.files],
              }))
            }
            multiple
          />
        </div>
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
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

  const navigate = useNavigate(); // Initialize useNavigate hook

  const goToProfile = () => {
    const user = getAuth().currentUser;
    if (user) {
      navigate("/dashboard", { state: { uid: user.uid } }); // Navigate to the Dashboard page with the user UID
    } else {
      console.error("User not authenticated");
    }
  };

  return (
    <div className="mapfolio-container">
      {/* <Searchgeolocation setMarker={setMarker} setLocation={setLocation} map = {}/> */}
      <button
        className="profile-button"
        onClick={goToProfile}
        style={{
          position: "absolute",
          top: "20px",
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
        Profile
      </button>
      {/* Make an update here for testing */}
      {showAddLocation &&
        // <div className="mapfolio-form-container">
        //   <MapfolioForm formData={formData} setFormData={setFormData} />
        // </div>
        null}
      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={10}
          style={{ height: "100vh", width: "100%" }}
        >
          <div className="absolute top-[20px] left-[60px] z-[1000] 2-[300px]">
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
