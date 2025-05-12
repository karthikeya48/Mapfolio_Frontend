import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
// import useMemory, { MemoryProvider } from "../../Context/MemoryContext.jsx";
import { image } from "@cloudinary/url-gen/qualifiers/source";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { auth, db } from "../../backend/firebase";

export default function MemoryDetailsMod() {
  const navigate = useNavigate();
  const location = useLocation();
  const memory = location.state?.memory;
  const [updatedNotes, setUpdatedNotes] = useState(memory?.notes || "");
  const [updatedTitle, setUpdatedTitle] = useState(memory?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [currentCoverImageIndex, setCurrentCoverImageIndex] = useState(0);
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // For image preview
  // const { updateMemory, deleteMemory } = useMemory();
  // console.log(updateMemory);
  const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
  const cloud_name = import.meta.env.VITE_CLOUD_NAME;

  useEffect(() => {
    if (memory?.images?.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentCoverImageIndex(
          (prevIndex) => (prevIndex + 1) % memory.images.length
        );
      }, 10000);

      return () => clearInterval(intervalId);
    }
  }, [memory]);

  const handleDelete = async (memoryid) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const memoryRef = doc(db, "users", user.uid, "trips", memoryid);
    try {
      await deleteDoc(memoryRef);
      console.log(`Memory with ID ${memoryid} deleted successfully.`);
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    memory.images.splice(indexToRemove, 1);
    setCurrentCoverImageIndex(0);
    updateMemory(memory.id, updatedNotes, updatedTitle, memory.images);
  };

  const addImageToMemory = async (memoryId, image) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", upload_preset);
      formData.append("cloud_name", cloud_name);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );

      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (newImage) {
      const newImageUrl = await addImageToMemory(memory.id, newImage);
      memory.images.push(newImageUrl);
      console.log(memory.images);
      updateMemory(memory.id, updatedNotes, updatedTitle, memory.images);
      setNewImage(null);
      console.log("added");
      setPreviewImage(null); // Clear preview after upload
    }
  };

  const updateMemory = async (memoryId, notes, title, images) => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    const memoryRef = doc(db, "users", user.uid, "trips", memoryId);

    try {
      await updateDoc(memoryRef, {
        notes,
        name: title,
        images,
        updatedAt: new Date(),
      });
      console.log("Memory updated successfully.");
    } catch (error) {
      console.error("Error updating memory:", error);
    }
  };

  const handleSaveChanges = () => {
    console.log(memory.images);
    updateMemory(memory.id, updatedNotes, updatedTitle, memory.images);
    setIsEditing(false);
  };

  if (!memory) {
    return <p className="text-center text-xl mt-20">Memory not found.</p>;
  }

  return (
    <div className="bg-gray-900 w-full min-h-screen text-white font-sans">
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="text-blue-400 fr hover:text-blue-500 transition-all"
        >
          Back to Dashboard
        </button>

        <h1 className="text-4xl font-extrabold mt-6">
          {isEditing ? (
            <input
              type="text"
              className="text-4xl font-extrabold bg-transparent border-b-2 border-gray-500 focus:outline-none text-white"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
          ) : (
            memory.name
          )}
        </h1>

        <div className="mt-8 relative">
          <img
            src={memory.images?.[currentCoverImageIndex] || ""}
            alt={memory.name}
            className="h-[80vh] w-full object-cover rounded-xl shadow-xl"
          />
        </div>

        {isEditing && (
          <div className="mt-6">
            <input
              type="file"
              onChange={handleImageUpload}
              className="bg-gray-800 text-white border border-gray-700 rounded-md p-2"
            />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="rounded-md w-32 h-32 object-cover mt-2"
              />
            )}
            {newImage && (
              <button
                onClick={handleSaveImage}
                className="ml-4 px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
              >
                Save Image
              </button>
            )}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Location</h2>
          <p className="text-lg text-gray-300">{memory.location}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Description</h2>
          {isEditing ? (
            <textarea
              className="w-full h-40 p-4 bg-gray-800 border border-gray-700 rounded-md text-white text-lg resize-none"
              value={updatedNotes}
              onChange={(e) => setUpdatedNotes(e.target.value)}
            />
          ) : (
            <p className="mt-2 p-4 bg-gray-800 text-gray-300 rounded-md text-lg">
              {updatedNotes}
            </p>
          )}
        </div>

        <h2 className="text-xl font-semibold mt-[10px]"> Images</h2>

        <div className="grid grid-cols-2 gap-4 mt-4">
          {memory.images.map((imageUrl, index) => (
            <div key={index} className="relative">
              <img
                src={imageUrl}
                alt={`image-${index}`}
                className="w-full h-[460px] object-cover rounded-md"
              />
              {isEditing && (
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex space-x-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 transition-all"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-all"
            >
              Edit
            </button>
          )}
        </div>

        <button
          onClick={async () => {
            const isConfirmed = window.confirm(
              "Are you sure you want to delete this memory?"
            );
            if (isConfirmed) {
              // console.log("Confirmeds");
              // console.log(deleteMemory);
              // deleteMemory(memory.id);
              handleDelete(memory.id);
              // console.log("call overed");
              navigate("/dashboard");
            }
          }}
          className="mt-8 px-6 py-2 bg-red-600 text-white rounded-md shadow-md hover:bg-red-700 transition-all"
        >
          Delete Memory
        </button>
      </div>
    </div>
  );
}
