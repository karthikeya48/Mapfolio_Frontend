import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase";

export default function ProfileInfo() {
  const user = getAuth().currentUser;
  const [otp, setOtp] = useState(""); // State for OTP input
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showAddMobile, setAddMobile] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [bio, setBio] = useState(""); // State for bio
  const [isEditingBio, setIsEditingBio] = useState(false); // Track if bio is being edited
  const [loading, setLoading] = useState(false);

  // Fetch user details from Firestore (name, email, bio)
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBio(data.bio || ""); // Set bio if exists
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleMobileNumberChange = (e) => {
    setMobileNumber(e.target.value);
  };

  const handleSendOtp = async () => {
    console.log("Sending OTP to:", mobileNumber);
    try {
      const response = await fetch(`${import.meta.env.VITE_OTP_URL}/sendotp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: mobileNumber }),
      });

      if (response.ok) {
        alert("OTP sent successfully");
      } else {
        alert("Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    console.log("Verifying OTP for:", mobileNumber);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_OTP_URL}/verifyotp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mobileNumber: mobileNumber, otp: otp }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsOtpVerified(true);
        alert("OTP Verified!");
        updateMobileNumber();
      } else {
        alert("Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
    }
  };

  const updateMobileNumber = async () => {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      { mobile: mobileNumber },
      { merge: true } // Merge the new mobile number into the existing user document
    );
    alert("Mobile number updated!");
  };

  const handleBioChange = (e) => {
    setBio(e.target.value);
  };

  const handleSaveBio = async () => {
    const userRef = doc(db, "users", user.uid);

    try {
      await setDoc(
        userRef,
        {
          name: user.displayName,
          email: user.email,
          uid: user.uid,
          bio: bio,
        },
        { merge: true } // Merge data if the user document already exists
      );
      setIsEditingBio(false); // Stop editing after saving bio
      alert("Bio saved successfully!");
    } catch (error) {
      console.error("Error saving bio:", error);
      alert("Failed to save bio");
    }
  };

  return (
    <div className="bg-black h-screen text-center p-[50px] text-white">
      <img
        src={user.photoURL}
        alt="User Profile"
        className="w-32 h-32 border border-solid border-white rounded-full mx-auto mb-4 object-cover"
      />
      <h2 className="text-2xl font-bold">{user.displayName}</h2>
      <p className="text-lg mb-6">{user.email}</p>

      {/* Bio Section */}
      <div className="mb-6">
        {isEditingBio ? (
          <>
            <div>
              <textarea
                value={bio}
                onChange={handleBioChange}
                placeholder="Enter your bio"
                className="p-4 rounded-lg text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400 w-full md:w-96"
              />
            </div>
            <button
              onClick={handleSaveBio}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md w-full md:w-96"
            >
              Save Bio
            </button>
          </>
        ) : (
          <div>
            <p className="text-lg font-semibold">Bio: {bio}</p>
            <button
              onClick={() => setIsEditingBio(true)} // Show textarea when editing bio
              className="mt-2 px-12 py-2 bg-blue-600 text-white rounded-md"
            >
              Edit Bio
            </button>
          </div>
        )}
      </div>

      {/* Mobile Number Section */}
      {!showAddMobile ? (
        <button
          onClick={() => setAddMobile(!showAddMobile)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white text-lg font-semibold"
        >
          Add Mobile Number
        </button>
      ) : null}

      {showAddMobile && !isOtpVerified ? (
        <div className="mt-8 text-center">
          <div id="recaptcha-container"></div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              className="p-4 rounded-lg text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400 w-full md:w-96"
            />
          </div>
          <div className="mb-4">
            <button
              onClick={handleSendOtp}
              className="px-6 py-2 bg-blue-600 text-white rounded-md w-full md:w-96"
            >
              Send OTP
            </button>
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="p-4 rounded-lg text-white border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 placeholder-gray-400 w-full md:w-96"
            />
          </div>
          <div className="mb-4">
            <button
              onClick={handleVerifyOtp}
              className="px-6 py-2 bg-blue-600 text-white rounded-md w-full md:w-96"
            >
              Verify OTP
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
