
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Project } from '@/lib/projects';

interface AppContextType {
  cart: Project[];
  addToCart: (project: Project) => void;
  removeFromCart: (projectId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Project[]>([]);
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

  const removeFromCart = (projectId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== projectId));
  }

  const clearCart = () => {
    setCart([]);
  }

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  }

  return (
    <AppContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isCartOpen, toggleCart }}>
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
