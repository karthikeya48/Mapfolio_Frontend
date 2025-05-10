import { useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, addDoc, collection } from "firebase/firestore";
import { db } from "../../backend/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faXmark } from "@fortawesome/free-solid-svg-icons";

import axios from "axios";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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

    const missingFields = [];
    if (!formData.name) missingFields.push("Trip Name");
    if (!formData.location) missingFields.push("Location");
    if (!formData.notes) missingFields.push("Description");

    if (missingFields.length > 0) {
      alert(`Please fill the following field(s): ${missingFields.join(", ")}`);
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
      setShowAddLocation(false);
    } catch (error) {
      console.error("Error on submit:", error);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto space-y-6 border border-gray-100">
      <div className="flex justify-between items-center">
        <p className="text-4xl font-extrabold text-gray-800">
          Create Your Trip
        </p>
        <FontAwesomeIcon
          icon={faXmark}
          onClick={() => {
            setShowAddLocation(false);
            setShowFullScreen(0);
          }}
          className="text-red-600 text-3xl cursor-pointer hover:text-red-800 transition-colors"
        />
      </div>

      <form>
        <div className="space-y-5">
          {/* Trip Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Trip Name:
            </label>
            <input
              type="text"
              name="name"
              value={formData.name || ""}
              placeholder="Enter the name of your trip"
              onChange={handleInputChange}
              required
              className="w-full p-4 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:border-indigo-400"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location:
            </label>
            <input
              type="text"
              name="location"
              value={formData.location || ""}
              placeholder="Enter your trip's location"
              onChange={handleInputChange}
              required
              className="w-full p-4 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:border-indigo-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description:
            </label>
            <textarea
              name="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
              placeholder="Describe your trip..."
              required
              className="w-full p-4 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out hover:border-indigo-400"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Images:
            </label>
            <div
              className={`mt-2 border-2 border-dashed rounded-md p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ease-in-out ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FontAwesomeIcon
                icon={faCloudArrowUp}
                className="text-gray-500 text-5xl mb-3 transition-all duration-300 ease-in-out"
              />
              <p className="text-gray-600">
                Drag & drop your photos here or{" "}
                <label
                  htmlFor="fileInput"
                  className="text-indigo-500 cursor-pointer hover:text-indigo-700 underline transition-all duration-300 ease-in-out"
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
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Selected Images:
            </h3>
            <div className="flex flex-wrap gap-4 mt-3">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Selected Image ${index + 1}`}
                    className="h-24 w-24 object-cover rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={uploading}
            className={`w-full py-4 text-white rounded-lg font-semibold ${
              uploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            } transition-all duration-300 ease-in-out`}
          >
            {uploading ? "Uploading..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

Upload.propTypes = {
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  setShowAddLocation: PropTypes.func.isRequired,
};
