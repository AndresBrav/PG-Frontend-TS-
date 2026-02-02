import { useContext } from "react"; 
import { TokenContext } from "../Context/TokenContext";


const useCerrarSesion = () => {
    const { setClaveAcceso } = useContext(TokenContext); //usamos el contexto para obtener la clave de acceso
    

    const cerrarSesion = () => {
        localStorage.removeItem("token");
        setClaveAcceso(""); // Limpiar el token en el contexto
    };

    return cerrarSesion;
};

export default useCerrarSesion;
