import { db } from "../backend/firebase";
import { arrayUnion } from "firebase/firestore";

export const updateUserRecentMemories = async (userId, memoryId) => {
  const userRef = db.collection("users").doc(userId);

  await userRef.update({
    // Add memoryId to the recentMemories array, only if it's not already there
    recentMemories: arrayUnion(memoryId),
  });
};

export const getRecentMemoriesFromFirestore = async (userId) => {
  const userRef = db.collection("users").doc(userId);

  // Fetch only the recentMemories field
  const doc = await userRef.select("recentMemories").get();

  if (doc.exists) {
    const data = doc.data();
    return data.recentMemories || [];
  }

  return [];
};
