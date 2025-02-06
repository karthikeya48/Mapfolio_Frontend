import { createContext, useContext, useState } from "react";

const MemoryContext = createContext();

const useMemory = () => useContext(MemoryContext);
export default useMemory;
export function MemoryProvider({ children }) {
  const [updateMemory, setUpdateMemory] = useState(() => () => {});
  const [deleteMemory, setDeleteMemory] = useState(() => () => {});

  return (
    <MemoryContext.Provider
      value={{ updateMemory, deleteMemory, setUpdateMemory, setDeleteMemory }}
    >
      {children}
    </MemoryContext.Provider>
  );
}
