import { createContext, useContext, useState } from "react";

const MemoryContext = createContext();

const useMemory = () => useContext(MemoryContext);
export default useMemory;
export function MemoryProvider({ children }) {
  const [updateMemory, setUpdateMemory] = useState(() => () => {
    console.log("Not set yet");
  });
  const [deleteMemory, setDeleteMemory] = useState(() => () => {
    console.log("deleteMemory Not set yet");
  });

  return (
    <MemoryContext.Provider
      value={{ updateMemory, deleteMemory, setUpdateMemory, setDeleteMemory }}
    >
      {children}
    </MemoryContext.Provider>
  );
}
