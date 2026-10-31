import React, { useEffect, useState } from "react";
import { TokenContext } from "./TokenContext";

interface TokenProviderProps {
    children: React.ReactNode;
}

export function TokenProvider({ children }: TokenProviderProps) {
    const [claveAcceso, setClaveAcceso] = useState<string>(
        () => localStorage.getItem("token") ?? "",
    );

    // Guardar o limpiar el token cada vez que cambie
    useEffect(() => {
        if (claveAcceso) {
            localStorage.setItem("token", claveAcceso);
        } else {
            localStorage.removeItem("token");
        }
    }, [claveAcceso]);

    return (
        <TokenContext.Provider value={{ claveAcceso, setClaveAcceso }}>
            {children}
        </TokenContext.Provider>
    );
}
