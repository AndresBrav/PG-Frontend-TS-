import React, { useContext, useState } from "react";
import { TokenContext } from "../../Context/TokenContext";
import { loginuser } from "../../Services/authService";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const { claveAcceso, setClaveAcceso } = useContext(TokenContext);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleLogin = async () => {
        try {
            
            const data = await loginuser(username, password);  /* make a request to the backend */
            setClaveAcceso(data.token);     //we store the token in the context
            setMessage("Token almacenado correctamente");

        } catch (error) {
            setMessage("Error en el login");
        }
    };

    const handleSignup = () => {};

    return (
        <div className="flex-container">
            <input
                className="flex-input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                style={{ marginRight: "0.5rem" }}
            />
            <br />
            <br />
            <input
                className="flex-input"
                type="text"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                style={{ marginRight: "0.5rem" }}
            />
            <br />
            <br />
            <button onClick={handleLogin}>
                <p>Iniciar Sesion</p>
            </button>
            <br />
            <br />
            <button onClick={handleSignup}>
                <p>Registrarse</p>
            </button>
            {/* {message && <p>{message}</p>} */}
        </div>
    );
};

export default Login;
