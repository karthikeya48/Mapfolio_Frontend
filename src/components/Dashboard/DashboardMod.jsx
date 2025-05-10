import { useEffect, useState, useRef, useCallback } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import SearchBarMod from "./SearchBarMod";
import useMemory from "../../Context/MemoryContext";

export default function DashboardMod() {
  const [memories, setMemories] = useState(new Map());
  const [filteredMemories, setFilteredMemories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const user = getAuth().currentUser;
  const db = getFirestore();
  const navigate = useNavigate();

  const fetchMemories = useCallback(
    async (initialLoad = false) => {
      if (!user || !hasMore) return;
      try {
        let tripsQuery = query(
          collection(db, "users", user.uid, "trips"),
          orderBy("name"),
          limit(6)
        );
        if (!initialLoad && lastDoc) {
          tripsQuery = query(tripsQuery, startAfter(lastDoc));
        }
        const tripSnapshot = await getDocs(tripsQuery);
        if (tripSnapshot.empty) {
          setHasMore(false);
          return;
        }
        const tripsMap = new Map(memories);
        tripSnapshot.docs.forEach((doc) => {
          tripsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });
        setMemories(tripsMap);
        setFilteredMemories(Array.from(tripsMap.values()));
        setLastDoc(tripSnapshot.docs[tripSnapshot.docs.length - 1]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
    [user, db, lastDoc, hasMore, memories]
  );

  useEffect(() => {
    fetchMemories(true);
  }, [fetchMemories]);

  useEffect(() => {
    setFilteredMemories(
      searchTerm
        ? Array.from(memories.values()).filter((memory) =>
            memory.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : Array.from(memories.values())
    );
  }, [searchTerm, memories]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMemories();
        }
      },
      { threshold: 1.0 }
    );
    if (loader.current) {
      observer.observe(loader.current);
    }
    return () => observer.disconnect();
  }, [fetchMemories]);

  const handleSelect = (memory) => {
    console.log("Selected", memory);
    navigate(`/memory/${memory.id}`, { state: { memory } });
  };

  return (
    <div className="bg-black">
      <button
        onClick={() => navigate("/welcome")}
        className="m-[10px] text-blue-400 hover:text-blue-500 transition-all"
      >
        Back to Map
      </button>
      <div className="bg-black min-h-screen text-white flex flex-col items-center p-4">
        <h1 className="mt-16 text-3xl font-extrabold text-center">
          Here are your <span className="text-blue-500">Mapfolio Memories</span>
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
          <div ref={loader} className="h-10"></div>
        </div>
      </div>
    </div>
  );
}
