import React, { useEffect, useState } from "react";
import { TokenContext } from "./TokenContext";

interface TokenProviderProps {
    children: React.ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
    const [claveAcceso, setClaveAcceso] = useState<string>("");

    // Cargar el token desde localStorage al iniciar
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            setClaveAcceso(savedToken);
        }
    }, []);

    // Guardar en localStorage cada vez que cambie
    useEffect(() => {
        if (claveAcceso) {
            localStorage.setItem("token", claveAcceso);
        }
    }, [claveAcceso]);

    return (
        <TokenContext.Provider value={{ claveAcceso, setClaveAcceso }}>
            {children}
        </TokenContext.Provider>
    );
}
