export default function InsideMemory({selectedMemory, ) {
  return (
    <div className="bg-black min-h-screen text-white font-sans">
      <div className="flex justify-between p-4">
        <button onClick={handleEditClose} className="text-blue-500">
          Back to Dashboard
        </button>
      </div>
      <div className="m-10">
        <h1 className="text-3xl font-extrabold">{selectedMemory.name}</h1>
        <div className="mt-5 relative">
          <img
            src={selectedMemory.images[currentCoverImageIndex]}
            alt={selectedMemory.name}
            className="w-full h-[400px] object-cover rounded-xl transition-transform duration-500 ease-in-out"
          />
          <div className="absolute top-1/2 left-0 right-0 flex justify-between px-4">
            <button
              onClick={prevImage}
              className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
            >
              &#60;
            </button>
            <button
              onClick={nextImage}
              className="text-white text-3xl bg-black bg-opacity-50 p-2 rounded-full"
            >
              &#62;
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div>
            <h1 className="text-2xl mb-[14px] font-extrabold">Location </h1>
            <p className="text-lg mb-[14px]">{selectedMemory.location}</p>
          </div>
          <h1 className="text-2xl mb-[14px] font-extrabold">Description</h1>
          {isEditing ? (
            <textarea
              className="w-full h-40 mt-2 p-2 text-gray-700 rounded-"
              value={updatedNotes}
              onChange={handleNotesChange}
            />
          ) : (
            <p className="mt-2 p-2 bg-gray-800 text-gray-300 rounded-md text-2xl">
              {updatedNotes}
            </p>
          )}
          <div className="mt-4 flex space-x-4">
            {isEditing ? (
              <button
                onClick={updateMemory}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-10 py-4 bg-blue-700 text-white rounded-xl"
              >
                Edit
              </button>
            )}
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
        <h2 className="mt-5 font-extrabold text-2xl"> Images</h2>
        <div className="grid grid-cols-2 gap-4 mt-4">
          {selectedMemory.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`image-${index}`}
              className="w-full h-[400px] object-cover rounded-md"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
