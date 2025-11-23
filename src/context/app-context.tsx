"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project } from '@/lib/projects';

interface AppContextType {
  cart: Project[];
  addToCart: (project: Project) => void;
  isChatOpen: boolean;
  toggleAiChat: () => void;
  openAiChat: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Project[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const addToCart = (project: Project) => {
    setCart((prevCart) => [...prevCart, project]);
  };

  const toggleAiChat = () => {
    setIsChatOpen((prev) => !prev);
  };
  
  const openAiChat = () => {
    setIsChatOpen(true);
  }

  return (
    <AppContext.Provider value={{ cart, addToCart, isChatOpen, toggleAiChat, openAiChat }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
