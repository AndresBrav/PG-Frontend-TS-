import React, { createContext } from "react";

export interface TokenContextType {
    claveAcceso: string;
    setClaveAcceso: React.Dispatch<React.SetStateAction<string>>;
}

// Contexto vacío con valores iniciales
export const TokenContext = createContext<TokenContextType>({
    claveAcceso: "",
    setClaveAcceso: () => {},
});
