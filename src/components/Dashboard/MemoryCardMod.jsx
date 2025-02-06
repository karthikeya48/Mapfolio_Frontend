export default function MemoryCardMod({ memory, onSelect }) {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-4">
      <img
        src={memory.coverImage}
        alt={memory.name}
        className="w-full h-[200px] object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold">{memory.name}</h3>
      <p className="text-sm text-gray-400">{memory.location}</p>
      <button
        onClick={() => onSelect(memory)}
        className="mt-4 text-blue-500 hover:underline"
      >
        View Details
      </button>
    </div>
  );
}
