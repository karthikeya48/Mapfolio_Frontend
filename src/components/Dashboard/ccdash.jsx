import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import SearchBarMod from "./SearchBarMod";
// import MemoryListMod from "./MemoryListMod";
// import MemoryDetailsMod from "./MemoryDetailsMod";
// import MemoryProvider from "../../Context/MemoryContext.jsx";
import useMemory from "../../Context/MemoryContext";
// import Profileinfo from "../Map/ProfileInfo";

export default function DashboardMod() {
  const [memories, setMemories] = useState([]);
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const user = getAuth().currentUser;
  const db = getFirestore();
  const navigate = useNavigate();

  const { setUpdateMemory, setDeleteMemory } = useMemory(); // Get setters from context

  useEffect(() => {
    if (!user) {
      console.log("User not authenticated");
      return;
    }

    const fetchMemories = async () => {
      try {
        const tripsRef = collection(db, "users", user.uid, "trips");
        const tripSnapshot = await getDocs(tripsRef);
        const tripsList = tripSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // console.log(tripsList);
        setMemories(tripsList);
        setFilteredMemories(tripsList);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchMemories();
  }, [user, db]);

  useEffect(() => {
    setFilteredMemories(
      searchTerm
        ? memories.filter((memory) =>
            memory.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : memories
    );
  }, [searchTerm, memories]);

  const handleSelect = (memory) => {
    // Call the parent's onSelect function (if needed)
    // console.log("onlcick is fine");
    navigate(`/memory/${memory.id}`, {
      state: { memory },
    }); // Navigate to a new route with memory id
  };

  const updateMemory = async (
    memoryId,
    updatedNotes,
    updatedTitle,
    updatedImages
  ) => {
    try {
      const memoryRef = doc(db, "users", user.uid, "trips", memoryId);
      await updateDoc(memoryRef, {
        name: updatedTitle,
        images: updatedImages,
        notes: updatedNotes,
      });

      setMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                name: updatedTitle,
                images: updatedImages,
                notes: updatedNotes,
              }
            : memory
        )
      );
      setFilteredMemories((prev) =>
        prev.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                ...memory,
                name: updatedTitle,
                images: updatedImages,
                notes: updatedNotes,
              }
            : memory
        )
      );
      console.log("debugging images", memoryId, updatedImages);
      console.log("updated");
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  };

  const extractPublicId = (imageUrl) => {
    const parts = imageUrl.split("/");
    const versionIndex = parts.findIndex((part) => part.startsWith("v"));
    if (versionIndex === -1) return null;

    const publicIdWithExt = parts.slice(versionIndex + 1).join("/");
    return publicIdWithExt.split(".")[0]; // Remove the file extension
  };

  async function deleteImage(publicId) {
    try {
      const response = await fetch(
        " https://8b0a-106-198-102-116.ngrok-free.app/delete-image",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId }),
        }
      );
      const data = await response.json();
      console.log("delete response", data);
    } catch (e) {
      console.log("error deleting image", e);
    }
  }

  const deleteMemory = async (memoryId) => {
    try {
      const memoryRef = doc(db, "users", user.uid, "trips", memoryId);
      const memorySnap = await getDoc(memoryRef);

      if (!memorySnap.exists()) {
        console.error("Memory not found");
        return;
      }

      const memoryData = memorySnap.data();
      const imageUrls = memoryData.images || [];

      for (const imageUrl of imageUrls) {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          deleteImage(publicId);
        }
      }

      await deleteDoc(memoryRef);
      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      setFilteredMemories((prev) =>
        prev.filter((memory) => memory.id !== memoryId)
      );
      setSelectedMemory(null);
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };
  // const navigate = useNavigate();

  useEffect(() => {
    setUpdateMemory(() => updateMemory);
    setDeleteMemory(() => deleteMemory);
  }, []); // Run once when component mounts

  return (
    <div className="bg-black">
      <button
        onClick={() => navigate("/welcome")}
        className="m-[10px] text-blue-400 hover:text-blue-500 transition-all"
      >
        Back to Map
      </button>
      <div className="bg-black min-h-screen text-white flex flex-col items-center p-4">
        <>
          <h1 className="mt-16 text-3xl font-extrabold text-center">
            Here are your{" "}
            <span className="text-blue-500">Mapfolio Memories</span>
          </h1>
          <SearchBarMod searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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
                    {/* {console.log("image is not avail", memory?.images?.[0])} */}
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
                ))}
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
}
