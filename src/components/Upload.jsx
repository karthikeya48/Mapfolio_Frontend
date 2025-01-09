import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, addDoc, collection } from "firebase/firestore";
import { db } from "../backend/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import PropTypes from "prop-types";

export default function Upload({
  formData,
  setFormData,
  setShowAddLocation,
  setShowFullScreen,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]); // state to store selected images
  const upload_preset = import.meta.env.VITE_UPLOAD_PRESET;
  const cloud_name = import.meta.env.VITE_CLOUD_NAME;

  const uploadImage = async (image) => {
    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", upload_preset);
      formData.append("cloud_name", cloud_name);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
        formData
      );

      console.log(response.data.secure_url);
      return response.data.secure_url;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedImages((prevImages) => [...prevImages, ...files]); // Update selected images
    setFormData((prevState) => ({
      ...prevState,
      images: [...(prevState.images || []), ...files],
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prevImages) => [...prevImages, ...files]); // Update selected images
    setFormData((prevState) => ({
      ...prevState,
      images: [...(prevState.images || []), ...files],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("User not logged in");
      alert("You must be logged in to upload data.");
      return;
    }

    const uid = user.uid;
    const uploadedImageUrls = [];

    try {
      setUploading(true);

      // Upload each image to Cloudinary and get its URL
      for (const image of formData.images || []) {
        if (image instanceof File) {
          // Ensure it's a File object before uploading
          const imageUrl = await uploadImage(image); // uploadImage function should return the URL
          if (imageUrl) {
            uploadedImageUrls.push(imageUrl);
          } else {
            console.error("Error uploading image");
            alert("Image upload failed");
            return;
          }
        } else {
          // If it's already a URL (unlikely in this flow, but for safety)
          uploadedImageUrls.push(image);
        }
      }

      const updatedFormData = {
        ...formData,
        images: uploadedImageUrls, // Store only URLs
      };

      // Create a reference to Firestore document inside the 'users' collection
      const userRef = doc(db, "users", uid);

      // Create a new trip document under the 'trips' collection of this user
      const tripRef = await addDoc(
        collection(userRef, "trips"),
        updatedFormData
      );

      console.log("Data added with trip ID:", tripRef.id);
      // handleAddMarker();
      alert("Upload successful!");
    } catch (error) {
      console.error("Error on submit:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mapfolio-form overflow-y-auto">
      <div className="flex justify-between items-center mb-[20px]">
        <p className="text-2xl"> Mapfolio </p>
        <FontAwesomeIcon
          icon={faXmark}
          onClick={() => {
            setShowAddLocation(false);
            setShowFullScreen(0);
          }}
          className="text-blue-600 text-2xl cursor-pointer"
        />
      </div>
      <form>
        <div>
          <label>Name the trip:</label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            placeholder="Enter the Name the Trip"
            onChange={handleInputChange}
            className="rounded-md border mb-[10px] border-black"
          />
          <label>Location:</label>
          <input
            type="text"
            name="location"
            placeholder="Enter the Name the location"
            value={formData.location || ""}
            onChange={handleInputChange}
            className="rounded-md border mb-[10px] border-black"
          />
        </div>
        <div>
          <label>Description:</label>
          <textarea
            placeholder="Write about the description of the trip"
            name="notes"
            value={formData.notes || ""}
            onChange={handleInputChange}
            className="max-h-[140px] rounded-md border mb-[10px] border-black"
          />
        </div>
        <div>
          <label>Images:</label>
          <div
            className={`mt-[10px] border-dashed border-2 rounded-md p-6 flex flex-col items-center justify-center text-center ${
              isDragging
                ? "border-blue-500 bg-blue-100"
                : "border-gray-400 bg-gray-50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              className="text-gray-400 text-4xl mb-2"
            />
            <p className="text-gray-500">
              Drag and drop your photo here or{" "}
              <label
                htmlFor="fileInput"
                className="text-blue-500 cursor-pointer underline"
              >
                click to browse
              </label>
            </p>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Display selected images */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Selected Images:</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Selected Image ${index + 1}`}
                  className="h-20 w-20 object-cover rounded-md"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={uploading}
          className={`mt-4 px-4 py-2 ${
            uploading ? "bg-gray-500" : "bg-blue-500"
          } text-white rounded-md hover:bg-green-600`}
        >
          {uploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
}

Upload.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  setShowAddLocation: PropTypes.func.isRequired,
};
