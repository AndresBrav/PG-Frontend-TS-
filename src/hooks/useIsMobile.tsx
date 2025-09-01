import { useEffect, useState } from "react";

/**
 * Hook que indica si la ventana es "móvil" según un ancho máximo.
 * @param maxWidth Ancho máximo en px (por defecto 480)
 * @returns boolean: true si window.innerWidth <= maxWidth
 */
const useIsMobile = (maxWidth: number = 480): boolean => {
    // Estado inicial: comprobamos el ancho actual (solo en cliente)
    const getInitialValue = (): boolean => {
        if (typeof window !== "undefined") {
            return window.innerWidth <= maxWidth;
        }
        return false; // Por si hay SSR (no aplica en Vite, pero es seguro)
    };

    const [isMobile, setIsMobile] = useState<boolean>(getInitialValue);

    useEffect(() => {
        const handleResize = (): void => {
            setIsMobile(window.innerWidth <= maxWidth);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [maxWidth]);

    return isMobile;
};

export default useIsMobile;
