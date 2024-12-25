import React, { useEffect, useState } from "react";
import { getDocs, query, where, collection } from "firebase/firestore";
import { db } from "../backend/firebase"; // Replace with your Firebase config
import "../styles/Dashboard.css"; // Optional: Add styles

function Dashboard({ user }) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const q = query(
          collection(db, "places"),
          where("uid", "==", user.uid) // Retrieve data specific to the logged-in user
        );
        const querySnapshot = await getDocs(q);
        const fetchedPlaces = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPlaces(fetchedPlaces);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [user.uid]);

  if (loading) return <div>Loading...</div>;
  console.log(places);
  console.log(user.uid); // Add this to check the user's UID

  return (
    <div className="dashboard-container">
      <h1>Your Places</h1>

      <div className="places-grid">
        {places.map((place) => (
          <div key={place.id} className="place-card">
            <h2>{place.name}</h2>
            <p>
              <strong>Location:</strong> {place.location}
            </p>
            <p>
              <strong>Date:</strong> {place.date}
            </p>
            <p>
              <strong>Notes:</strong> {place.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
