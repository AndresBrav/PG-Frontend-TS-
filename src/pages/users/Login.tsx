import React, { useContext, useEffect, useState } from "react";
import { TokenContext } from "../../Context/TokenContext";
import { loginuser } from "../../Services/authService";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
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

    const handleSignup = () => {
        navigate("/registro"); // Navigate to the SignUp page
    };

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
            <div
                style={{
                    position: "relative",
                    width: "60%",
                    marginRight: "0.5rem",
                }}
            >
                <input
                    className="flex-input-login"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    style={{ width: "100%", marginRight: 0 }}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                    }}
                >
                    {showPassword ? (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 8 10 8a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"
                                stroke="#0d6efd"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    ) : (
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke="#0d6efd"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="#0d6efd"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                </button>
            </div>

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
