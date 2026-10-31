import { useCallback, useContext } from "react";
import { TokenContext } from "../Context/TokenContext";

const useCerrarSesion = () => {
    const { setClaveAcceso } = useContext(TokenContext); //usamos el contexto para obtener la clave de acceso

    return useCallback(() => {
        localStorage.removeItem("token");
        setClaveAcceso(""); // Limpiar el token en el contexto
    }, [setClaveAcceso]);
};

export default useCerrarSesion;
