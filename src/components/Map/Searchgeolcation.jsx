import axios from "axios";
import { useState } from "react";
import PropTypes from "propTypes";
export function Searchgeolocation({ setMarker, setLocation, map }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = async (e) => {
    setQuery(e.target.value);

    if (e.target.value.length > 3) {
      try {
        const response = await axios.get(
          `https://api.opencagedata.com/geocode/v1/json`,
          {
            params: {
              q: e.target.value,
              key: import.meta.env.VITE_REVERSE_GEO_API,
              limit: 5,
            },
          }
        );

        const results = response.data.results.map((result) => ({
          name: result.formatted,
          lat: result.geometry.lat,
          lng: result.geometry.lng,
        }));

        setSuggestions(results);
      } catch (error) {
        console.error("Error fetching geocoding results:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (lat, lng, name) => {
    setMarker([lat, lng]);
    map.flyTo([lat, lng], 13);
    setLocation(name);
    setSuggestions([]);
  };

  return (
    <div className="geocoding-search">
      <input
        type="text"
        placeholder="Enter address or place"
        value={query}
        onChange={handleSearch}
        className="search-bar"
      />
      <ul className="suggestions">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() =>
              handleSuggestionClick(
                suggestion.lat,
                suggestion.lng,
                suggestion.name
              )
            }
            className="suggestion-item"
          >
            {suggestion.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

Searchgeolocation.propTypes = {
  setMarker: PropTypes.func.isRequired,
  setLocation: PropTypes.func.isRequired,
  map: PropTypes.func.isRequrired,
};
