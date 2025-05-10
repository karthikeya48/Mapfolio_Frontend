import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import "tailwindcss/tailwind.css";
import { useNavigate } from "react-router-dom";
import Profileinfo from "./Map/ProfileInfo";
import useMemory from "../Context/MemoryContext";

export default function Dashboard() {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [updatedNotes, setUpdatedNotes] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoverImageIndex, setCurrentCoverImageIndex] = useState(0); // Track current cover image
  const [searchTerm, setSearchTerm] = useState("");
  const { setUpdateMemory, setDeleteMemory } = useMemory();

  // State for mobile number input
  // Flag for
  const user = getAuth().currentUser;
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const fetchMemories = async () => {
        try {
          console.log("fetching memoreis");
          const tripsRef = collection(db, "users", user.uid, "trips");
          const tripSnapshot = await getDocs(tripsRef);
          const tripsList = tripSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log(tripsList);
          setMemories(tripsList);
          setFilteredMemories(tripsList);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchMemories();
    } else {
      console.log("User not authenticated");
    }
  }, [user, db]);

  // Filter memories based on the search term
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredMemories(memories); // Show all if search is blank
    } else {
      setFilteredMemories(
        memories.filter((memory) =>
          memory.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, memories]);

  useEffect(() => {
    // Set interval to change the main cover image every 10 seconds
    const intervalId = setInterval(() => {
      setCurrentCoverImageIndex(
        (prevIndex) => (prevIndex + 1) % selectedMemory?.images.length
      );
    }, 10000);

    // Clear the interval on cleanup
    return () => clearInterval(intervalId);
  }, [selectedMemory]);

  const handleCardClick = (memory) => {
    setSelectedMemory(memory);
    setUpdatedNotes(memory.notes);
    setIsEditing(false); // Default to read-only mode
  };

  const handleEditClose = () => {
    setSelectedMemory(null);
  };

  const handleDashClose = () => {
    navigate("/welcome");
  };

  const handleNotesChange = (e) => {
    setUpdatedNotes(e.target.value);
  };

  const updateMemory = async () => {
    if (selectedMemory && selectedMemory.id) {
      try {
        const memoryRef = doc(
          db,
          "users",
          user.uid,
          "trips",
          selectedMemory.id
        );

        // Update the memory in Firestore
        await updateDoc(memoryRef, {
          notes: updatedNotes,
        });

        // Update the selectedMemory state with the new notes
        setSelectedMemory((prevMemory) => ({
          ...prevMemory,
          notes: updatedNotes,
        }));

        setIsEditing(false); // Return to read-only mode
        console.log("Memory updated successfully!");
      } catch (error) {
        console.error("Error updating memory:", error);
      }
    } else {
      console.error("Selected memory or memory ID is undefined");
    }
  };

  const nextImage = () => {
    setCurrentCoverImageIndex(
      (prevIndex) => (prevIndex + 1) % selectedMemory?.images?.length
    );
  };

  const prevImage = () => {
    setCurrentCoverImageIndex((prevIndex) =>
      prevIndex === 0 ? selectedMemory?.images?.length - 1 : prevIndex - 1
    );
  };

  // Delete memory function
  const deleteMemory = async (memoryId) => {
    try {
      const memoryRef = doc(db, "users", user.uid, "trips", memoryId);
      await deleteDoc(memoryRef);
      setMemories((prevMemories) =>
        prevMemories.filter((memory) => memory.id !== memoryId)
      );
      setFilteredMemories((prevMemories) =>
        prevMemories.filter((memory) => memory.id !== memoryId)
      );
      console.log("Memory deleted successfully!");
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  useEffect(() => {
    setUpdateMemory(() => updateMemory);
    setDeleteMemory(() => deleteMemory);
  }, [updateMemory, deleteMemory]);

  if (selectedMemory) {
    return (
      <div className="bg-black min-h-screen text-white font-sans">
        <div className="flex justify-between p-4">
          <div>
            <button onClick={handleEditClose} className="text-blue-500">
              Back to Dashboard
            </button>
          </div>
        </div>
        <div className="ml-10 mr-10">
          <h1 className="text-3xl font-extrabold">{selectedMemory?.name}</h1>
          <div className="mt-[5px] relative">
            <img
              src={selectedMemory?.images?.[currentCoverImageIndex] || ""}
              alt={selectedMemory?.name}
              className="w-full h-[80vh] object-cover rounded-xl transition-transform duration-500 ease-in-out"
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
              <h1 className="text-2xl mb-[24px] font-extrabold">Location </h1>
              <p className="text-xl mb-[24px]">{selectedMemory?.location}</p>
            </div>
            <h1 className="text-2xl mb-[24px] font-extrabold">Description</h1>
            {isEditing ? (
              <textarea
                className="w-full h-40 mt-2 p-2 text-gray-700 rounded-"
                value={updatedNotes}
                onChange={handleNotesChange}
              />
            ) : (
              <p className="mt-2 p-2 bg-gray-800 text-gray-300 rounded-md text-xl">
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
            {selectedMemory?.images?.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`image-${index}`}
                className="w-full h-[400px] object-cover rounded-md"
              />
            ))}
          </div>

          {/* Delete button */}
          <div className="mt-4 mb-4 ">
            <button
              onClick={() => deleteMemory(selectedMemory?.id)}
              className="px-6 py-2 bg-red-600 text-white rounded-md  mb-6"
            >
              Delete Memory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans flex">
      {/* Profile Info */}
      {/* <Profileinfo /> */}
      <div className="bg-black min-h-screen flex flex-col  justify-center px-6">
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <button
            onClick={handleDashClose}
            className="text-blue-500 text-lg font-semibold hover:underline transition-all duration-200"
          >
            Back to Map
          </button>
        </div>

        {/* Title */}
        <h1 className="mt-16 text-3xl font-extrabold text-center">
          Here are your <span className="text-blue-500">Mapfolio Memories</span>
        </h1>

        {/* Search Bar */}
        <div className="mt-8 flex justify-center">
          <input
            type="text"
            placeholder="Search by title"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-4 rounded-lg text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400 w-full md:w-96"
          />
        </div>

        {/* Memories */}
        <div className="mt-10">
          {filteredMemories.length === 0 ? (
            <p className="text-center text-xl">No memories found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredMemories.map((memory) => (
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
                    onClick={() => handleCardClick(memory)}
                    className="mt-4 text-blue-500 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
