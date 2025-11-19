// app/context/MarvelContext.tsx
import { createContext, useState, ReactNode } from 'react';

interface MarvelContextProps {
  myState: string;
  setMyState: (value: string) => void;
}

export const MarvelContext = createContext<MarvelContextProps | undefined>(undefined);

export const MyProvider = ({ children }: { children: ReactNode }) => {
  const [myState, setMyState] = useState<string>('Initial State');

  return (
    <MarvelContext.Provider value={{ myState, setMyState }}>
      {children}
    </MarvelContext.Provider>
  );
};
