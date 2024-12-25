import { useState } from "react";
import axios from "axios";
import { useMap } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const GEO_API_KEY = import.meta.env.VITE_REVERSE_GEO_API;

function Search({ setMarker, setLocation, setFormData }) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [onfocus, setOnFocus] = useState(0);

  const map = useMap();

  const handleSearch = async () => {
    const location = inputValue;
    if (location) {
      try {
        const response = await axios.get(
          "https://api.opencagedata.com/geocode/v1/json",
          {
            params: {
              q: location,
              key: GEO_API_KEY,
            },
          }
        );

        const { lat, lng } = response.data.results[0]?.geometry || {};
        if (lat && lng) {
          map.flyTo([lat, lng], 13);
          setMarker([lat, lng]);
          setLocation(location);

          setFormData((prevState) => ({
            ...prevState,
            location,
          }));
        } else {
          setLocation("Location not found");
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setLocation("Failed to get location");
      }
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length >= 3) {
      try {
        const response = await axios.get(
          "https://api.opencagedata.com/geocode/v1/json",
          {
            params: {
              q: value,
              key: GEO_API_KEY,
            },
          }
        );
        setSuggestions(response.data.results || []);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { lat, lng, formatted } = suggestion.geometry;
    map.flyTo([lat, lng], 13);
    setMarker([lat, lng]);
    setLocation(formatted);
    setFormData((prevState) => ({
      ...prevState,
      location: formatted,
    }));
    setInputValue(formatted);
    setSuggestions([]);
  };

  return (
    <div className="relative w-[300px] z-[1000]">
      <input
        type="text"
        value={inputValue}
        placeholder="Enter location"
        onChange={handleInputChange}
        className="w-full h-[50px] rounded-3xl bg-white text-gray-800 font-bold p-[20px] pr-[60px] focus:outline-none"
      />
      <button
        onClick={handleSearch}
        className="absolute top-[50%] right-[10px] transform -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-700 transition duration-200"
      >
        <FontAwesomeIcon icon={faSearch} />
      </button>

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-200"
            >
              {suggestion.formatted}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
