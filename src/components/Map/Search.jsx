import { useState } from "react";
import axios from "axios";
import { useMap } from "react-leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const GEO_API_KEY = import.meta.env.VITE_REVERSE_GEO_API;

function Search({ setMarker, setLocation, setFormData, setSearchInUse }) {
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
    <div className="relative w-full max-w-[350px] z-[1000]">
      <input
        type="text"
        value={inputValue}
        placeholder="Enter location"
        onChange={handleInputChange}
        onFocus={() => setSearchInUse(1)}
        onBlur={() => setSearchInUse(0)}
        className="w-full h-[48px] px-5 pr-12 rounded-full bg-white text-gray-900 font-semibold border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      <button
        onClick={handleSearch}
        className="absolute top-1/2 right-3 transform -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200 shadow"
      >
        <FontAwesomeIcon icon={faSearch} />
      </button>

      {/* Suggestions list */}
      {suggestions.length > 0 && (
        <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-10 overflow-hidden">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-4 py-3 text-gray-700 cursor-pointer hover:bg-gray-100 transition"
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
