import { useNavigate } from "react-router-dom";

const useAuthRedirect = () => {
    const navigate = useNavigate();

    return function redirectToHome() {
        navigate("/", { replace: true });
    };
};

export default useAuthRedirect;
