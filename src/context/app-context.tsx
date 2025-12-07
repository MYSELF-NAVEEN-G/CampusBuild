"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project } from '@/lib/projects';

interface AppContextType {
  cart: Project[];
  addToCart: (project: Project) => void;
  removeFromCart: (projectId: number) => void;
  isChatOpen: boolean;
  toggleAiChat: () => void;
  openAiChat: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Project[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (project: Project) => {
    setCart((prevCart) => {
      // prevent duplicates
      if (prevCart.find(p => p.id === project.id)) {
        return prevCart;
      }
      return [...prevCart, project]
    });
  };

  const removeFromCart = (projectId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== projectId));
  }

  const toggleAiChat = () => {
    setIsChatOpen((prev) => !prev);
  };
  
  const openAiChat = () => {
    setIsChatOpen(true);
  }

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  }

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, isChatOpen, toggleAiChat, openAiChat, isCartOpen, toggleCart }}>
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
