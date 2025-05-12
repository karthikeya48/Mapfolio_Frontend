import React from "react";
import { useRecentMemories } from "../../hooks/useRecentMemories";
import MemoryCard from "./MemoryCard";

const RecentMemories = ({ userId }) => {
  const recentMemories = useRecentMemories(userId);

  return (
    <div className="recent-memories">
      <h2>Recent Memories</h2>
      <ul>
        {recentMemories.map((memory, index) => (
          <li key={index}>
            <MemoryCard memory={memory} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentMemories;
