import { useContext, useEffect, useState } from "react";
import { TokenContext } from "../../Context/TokenContext";
import { registerUser } from "../../Services/authService";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
    const [username, setUsername] = useState<string>("");
    const [edad, setEdad] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    const { claveAcceso, setClaveAcceso } = useContext(TokenContext);

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleAgeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setEdad(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleRegistro = async () => {
        try {
            const data = await registerUser(username, edad, password);
            // console.log(data.token)
            setClaveAcceso(data.token); // Store the token in the context
        } catch (error) {}
    };

    useEffect(() => {
        if (claveAcceso) {
            // Navigate to the dashboard or any other page after successful registration
            navigate("/dashboard"); // You can also use useNavigate from react-router-dom
        }
    }, [claveAcceso, navigate]);

    return (
        <div className="flex-container-login">
            <input
                className="flex-input-login"
                type="text"
                placeholder="Ingresar Usuario"
                value={username}
                onChange={handleUsernameChange}
                style={{ marginRight: "0.5rem" }}
            />

            <select
                className="flex-input-login"
                value={edad}
                onChange={handleAgeChange}
            >
                <option value="Selecciona tu Edad">Selecciona tu Edad</option>
                <option value="17">17 años</option>
                <option value="18">18 años</option>
                <option value="19">19 años</option>
                <option value="20">20 años</option>
                <option value="21">21 años</option>
                <option value="22">22 años</option>
                <option value="23">23 años</option>
                {/* Puedes agregar más opciones aquí */}
            </select>

            <input
                className="flex-input-login"
                type="text"
                placeholder="Ingresar Contraseña"
                value={password}
                onChange={handlePasswordChange}
                style={{ marginRight: "0.5rem" }}
            />
            <button className="flex-button-login" onClick={handleRegistro}>
                <p>Registrarse</p>
            </button>
        </div>
    );
};

export default SignUp;
