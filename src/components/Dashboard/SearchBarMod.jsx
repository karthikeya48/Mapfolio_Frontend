export default function SearchBarMod({ searchTerm, setSearchTerm }) {
  return (
    <div className="mt-8 flex justify-center">
      <input
        type="text"
        placeholder="Search by title"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-4 rounded-lg text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400 w-full md:w-96"
      />
    </div>
  );
}
