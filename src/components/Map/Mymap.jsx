import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.js";
// import "../../styles/MyMap.css";
import Upload from "./Upload.jsx";
import Search from "./Search.jsx";

import GeoLocationButton from "./GeoLocationButton.jsx";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import LocationFinder from "./LocationFinder.jsx";
import { getAuth } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import profileImg from "../../assets/profile.png";
import { useAuth } from "../Auth/Authprovider.jsx";

function MyMap() {
  const [marker, setMarker] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [searchInUse, setSearchInUse] = useState(0);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const [showFullScreen, setShowFullScreen] = useState(0);
  const [location, setLocation] = useState("Click on the map to get location");
  const [userData, setUserData] = useState(null);
  const [isOpen, setOpen] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    notes: "",
    images: [],
    latitude: "",
    longitude: "",
  });

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Check if the user has seen the login message already
    console.log(user.photoURL);
    const hasSeenLoginMessage = localStorage.getItem("seen");

    if (!hasSeenLoginMessage) {
      // If the user hasn't seen the message, show the toast
      toast.info("Click on the map to find or record your memories!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      // Store the flag in localStorage so the message won't show again
      localStorage.setItem("seen", "true");
    }
  }, []);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.error("User not logged in");
          return;
        }

        setUserData({
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
        });

        const userId = user.uid;
        const userTripsRef = collection(db, "users", userId, "trips"); // Reference to user's trips collection

        const querySnapshot = await getDocs(userTripsRef); // Fetch the documents from user's trips collection
        const fetchedMarkers = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.latitude !== undefined && data.longitude !== undefined) {
            fetchedMarkers.push({
              id: doc.id,
              ...data,
            });
          }
        });

        setMarkers(fetchedMarkers); // Update state with fetched markers
      } catch (error) {
        console.error("Error fetching markers:", error);
      }
    };

    fetchMarkers();
  }, []);
  return (
    <>
      <div className="flex h-[100vh]">
        <ToastContainer />
        {showAddLocation && (
          <div
            className={`${
              showFullScreen ? "w-[100%]" : "w-[600px]"
            } p-[20px] border-r-[1px] overflow-y-auto`}
          >
            {!showFullScreen && (
              <button
                onClick={() => {
                  setShowFullScreen(1);
                }}
                className=" text-blue-500"
              >
                FullScreen
              </button>
            )}
            <Upload
              formData={formData}
              setFormData={setFormData}
              setShowAddLocation={setShowAddLocation}
              setShowFullScreen={setShowFullScreen}
            />
          </div>
        )}

        <div className="flex-1 relative h-screen w-full">
          {!showFullScreen && (
            <div className="relative">
              <div className="absolute top-6 right-[80px] z-[1000]">
                <img
                  src={user.photoURL || profileImg}
                  alt="Profile"
                  onClick={() => setOpen(!isOpen)}
                  className="w-10 h-10 rounded-full shadow-md transition-transform transform hover:scale-110 cursor-pointer object-cover"
                />
              </div>
              {isOpen ? (
                <div className="absolute align right-[10px] top-[80px]   bg-gray-900 p-4 rounded-lg shadow-lg w-[200px] h-[150px] z-[1000]">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                    }}
                    className="w-full  py-2 text-white hover:bg-gray-700 rounded-lg"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      navigate("/profileInfo");
                    }}
                    className="w-full text-center py-2 text-white hover:bg-gray-700 rounded-lg"
                  >
                    Profile
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate("/login");
                    }}
                    className="w-full text-center py-2 text-white hover:bg-gray-700 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              ) : null}
            </div>
          )}

          <MapContainer
            center={[11.0351, 77.061]}
            zoom={10}
            className="h-full w-full"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <div className="hidden sm:block md:absolute top-[20px] left-[60px]">
              <Search
                setLocation={setLocation}
                setFormData={setFormData}
                setSearchInUse={setSearchInUse}
              />
            </div>

            <LocationFinder
              searchInUse={searchInUse}
              setMarker={setMarker}
              setLocation={setLocation}
              setFormData={setFormData}
              setShowAddLocation={setShowAddLocation}
            />
            {marker && <Marker position={marker}></Marker>}
            {markers.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.latitude, marker.longitude]}
                eventHandlers={{
                  mouseover: () => setHoveredMarker(marker),
                  mouseout: () => setHoveredMarker(null),
                }}
              />
            ))}
            <GeoLocationButton
              setMarker={setMarker}
              setLocation={setLocation}
              setFormData={setFormData}
            />
          </MapContainer>

          {hoveredMarker && (
            <div className="absolute bottom-8 left-8 z-[1000] bg-white p-4 shadow-lg rounded-lg">
              <h4 className="font-semibold mb-[20px]">{hoveredMarker.name}</h4>
              <div className="carousel flex gap-2">
                {hoveredMarker.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Location ${index + 1}`}
                    className="rounded-2xl w-[150px] h-[150px] object-cover"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyMap;
