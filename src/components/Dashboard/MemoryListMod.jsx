import { useNavigate } from "react-router-dom";

export default function MemoryListMod({ memories, onSelect }) {
  return (
    <div className="mt-10">
      {memories.length === 0 ? (
        <p className="text-center text-xl">No memories found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="bg-gray-800 rounded-lg shadow-lg p-4"
            >
              <img
                src={memory.coverImage}
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
          ))}
        </div>
      )}
    </div>
  );
}
