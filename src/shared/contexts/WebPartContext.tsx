// src/shared/context/WebPartContext.tsx
import React, { createContext, useContext } from "react";

interface WebPartContextType {
  webAbsoluteUrl: string;
}

const WebPartContext = createContext<WebPartContextType>({
  webAbsoluteUrl: "",
});

export const WebPartProvider = WebPartContext.Provider;

export const useWebPartContext = () => useContext(WebPartContext);