import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        // Redirige solo si NO hay token
        if (!token) {
            navigate("/", { replace: true }); // evita que el usuario pueda volver con "Atrás"
        }
    }, [navigate]);
};

export default useAuthRedirect;
