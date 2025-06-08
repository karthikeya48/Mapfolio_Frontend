import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
const MemoryCardMod = ({ memory }) => {
  const navigate = useNavigate();

  const handleSelect = async (memory) => {
    navigate(`/memory/${memory.id}`, { state: { memory } });
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <img
        src={memory?.images?.[0]}
        alt={memory.name}
        className="w-full h-[200px] object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{memory.name}</h3>
      <p className="text-sm text-gray-400">{memory.location}</p>
      <button
        onClick={() => handleSelect(memory)}
        className="mt-4 text-blue-500 hover:underline"
      >
        View Details
      </button>
    </div>
  );
};

MemoryCardMod.propTypes = {
  memory: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default MemoryCardMod;
