import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { sendDataToFirestore } from "../backend/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp } from "@fortawesome/free-solid-svg-icons";

export default function Upload({ formData, setFormData }) {
  const [isDragging, setIsDragging] = useState(false);

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
    setFormData((prevState) => ({
      ...prevState,
      images: [...(prevState.images || []), ...files],
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prevState) => ({
      ...prevState,
      images: [...(prevState.images || []), ...files],
    }));
  };

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    const auth = getAuth();
    const user = auth.currentUser;

    console.log(formData);

    if (!user) {
      console.error("User not logged in");
      return;
    }

    const uid = user.uid; // Get the user's UID
    try {
      const docId = await sendDataToFirestore(uid, formData);
      console.log("data added to" + docId);
    } catch (error) {
      console.log("Error on submit: " + error);
    }
  };

  return (
    <div className="mapfolio-form">
      <h2>Mapfolio</h2>
      <FontAwesomeIcon icon="fa-solid fa-xmark" className="" />
      <form>
        <div>
          <label>Name the trip:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter the Name the Trip"
            onChange={handleInputChange}
            className="rounded-md border mb-[10px] border-black"
          />
          <label>Location:</label>
          <input
            type="text"
            name="location"
            placeholder="Enter the Name the location"
            value={formData.location}
            className="rounded-md border mb-[10px] border-black"
          />
        </div>
        {/* <div>
          <label>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="rounded-md border mb-[10px] border-black"
          />
        </div> */}
        <div>
          <label>Description:</label>
          <textarea
            placeholder="Write about the description of the trip"
            name="notes"
            value={formData.notes}
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
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-green-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
