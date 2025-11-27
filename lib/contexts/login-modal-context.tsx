"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type LoginModalContextType = {
  showLogin: boolean;
  setShowLogin: (show: boolean) => void;
};

const LoginModalContext = createContext<LoginModalContextType | undefined>(
  undefined
);

export function LoginModalProvider({ children }: { children: ReactNode }) {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <LoginModalContext.Provider value={{ showLogin, setShowLogin }}>
      {children}
    </LoginModalContext.Provider>
  );
}

export function useLoginModal() {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error("useLoginModal must be used within LoginModalProvider");
  }
  return context;
}
