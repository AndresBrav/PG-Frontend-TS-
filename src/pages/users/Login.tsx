import React, { useContext, useEffect, useState } from "react";
import { TokenContext } from "../../Context/TokenContext";
import { loginuser } from "../../Services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    // const [message, setMessage] = useState<string>("");

    const { claveAcceso, setClaveAcceso } = useContext(TokenContext);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleLogin = async () => {
        try {
            const data = await loginuser(
                username,
                password
            ); /* make a request to the backend */
            setClaveAcceso(data.token); //we store the token in the context
            // setMessage("Token almacenado correctamente");
        } catch (error) {
            // setMessage("Error en el login");
        }
    };

    useEffect(() => {
        if (claveAcceso) {    /* Esta línea verifica si claveAcceso tiene un valor "truthy". En JavaScript, un valor es considerado "truthy" si no es false, 0, "", null, undefined, o NaN. */
            navigate("/dashboard");
        }
    }, [claveAcceso, navigate]);

    const handleSignup = () => {};

    return (
        <div className="flex-container-login">
            <input
                className="flex-input-login"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                style={{ marginRight: "0.5rem" }}
            />
            <input
                className="flex-input-login"
                type="text"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                style={{ marginRight: "0.5rem" }}
            />

            <button className="flex-button-login" onClick={handleLogin}>
                <p>Iniciar Sesion</p>
            </button>
            <button className="flex-button-login" onClick={handleSignup}>
                <p>Registrarse</p>
            </button>
            {/* {message && <p>{message}</p>} */}
        </div>
    );
};

export default Login;
