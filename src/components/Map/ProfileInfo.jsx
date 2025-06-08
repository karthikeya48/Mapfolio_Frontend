import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase";
import profile from "../../assets/profile.png";

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
        alert("correct OTP");
        // alert("Failed to send OTP");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white flex items-center justify-center p-8">
      <div className="bg-gray-950 p-10 rounded-3xl shadow-2xl max-w-5xl w-full flex flex-col md:flex-row gap-10 items-center md:items-start animate-fade-in">
        {/* Left - Profile */}
        <div className="text-center">
          <img
            src={profile}
            alt="User Profile"
            className="w-40 h-40 border-4 border-blue-500 rounded-full object-cover shadow-lg transition-transform hover:scale-105"
          />
          <h2 className="text-3xl font-bold mt-6">{user.displayName}</h2>
          <p className="text-md text-gray-400">{user.email}</p>
        </div>

        {/* Right - Bio and Mobile */}
        <div className="flex-1 space-y-8">
          {/* Bio Section */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">About You</h3>
            {isEditingBio ? (
              <>
                <textarea
                  value={bio}
                  onChange={handleBioChange}
                  placeholder="Enter your bio..."
                  className="p-4 w-full rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
                />
                <button
                  onClick={handleSaveBio}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md font-semibold"
                >
                  Save Bio
                </button>
              </>
            ) : (
              <div>
                <p className="text-gray-300">
                  {bio ? bio : "No bio added yet."}
                </p>
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md font-semibold"
                >
                  Edit Bio
                </button>
              </div>
            )}
          </div>

          {/* Mobile Number Section */}
          <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Mobile Verification</h3>
            {!showAddMobile && !isOtpVerified ? (
              <button
                onClick={() => setAddMobile(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md font-semibold"
              >
                Add Mobile Number
              </button>
            ) : null}

            {showAddMobile && !isOtpVerified && (
              <div className="space-y-4">
                <div id="recaptcha-container"></div>
                <input
                  type="text"
                  placeholder="Enter Mobile Number"
                  value={mobileNumber}
                  onChange={handleMobileNumberChange}
                  className="w-full p-4 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
                />
                <button
                  onClick={handleSendOtp}
                  className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-md font-semibold"
                >
                  Send OTP
                </button>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-4 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
                />
                <button
                  onClick={handleVerifyOtp}
                  className="w-full bg-green-600 hover:bg-green-700 transition px-4 py-2 rounded-md font-semibold"
                >
                  Verify OTP
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
