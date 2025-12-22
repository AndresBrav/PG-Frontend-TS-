import { useNavigate } from "react-router-dom";

const useCerrarSesion = () => {
    const navigate = useNavigate();

    const cerrarSesion = () => {
        // navigate("/", { replace: true });
        localStorage.removeItem("token");
    };

    return cerrarSesion;
};

export default useCerrarSesion;
