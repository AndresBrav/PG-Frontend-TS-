import { useContext, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { loginuser } from '../../Services/authService';
import BotonMostrarPassword from '../../components/auth/BotonMostrarPassword';

const Login = () => {
    const [identificador, setIdentificador] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
    const [cargando, setCargando] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const { setClaveAcceso } = useContext(TokenContext);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!identificador.trim() || !password) {
            setMensajeError('Ingresa tu usuario o código y tu contraseña.');
            return;
        }

        setCargando(true);
        setMensajeError(null);

        try {
            const data = await loginuser(identificador, password);
            setClaveAcceso(data.token);
        } catch (error) {
            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo iniciar sesión'
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <form
                className="flex-container-login"
                onSubmit={handleLogin}
                noValidate
            >
                <div className="auth-header">
                    <h1 className="auth-title">Iniciar sesión</h1>
                    <br />
                    <p className="auth-subtitle">
                        Ingresa con tu usuario o código institucional
                    </p>
                </div>

                {mensajeError && (
                    <p className="auth-error" role="alert" aria-live="polite">
                        {mensajeError}
                    </p>
                )}

                <div className="auth-field">
                    <label className="auth-label" htmlFor="login-identificador">
                        Usuario o código
                    </label>
                    <input
                        id="login-identificador"
                        className="flex-input-login"
                        type="text"
                        placeholder="Usuario o código institucional"
                        value={identificador}
                        onChange={(e) => setIdentificador(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="login-password">
                        Contraseña
                    </label>
                    <div className="auth-password">
                        <input
                            id="login-password"
                            className="flex-input-login"
                            type={mostrarPassword ? 'text' : 'password'}
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                        />
                        <BotonMostrarPassword
                            visible={mostrarPassword}
                            onToggle={() =>
                                setMostrarPassword(!mostrarPassword)
                            }
                        />
                    </div>
                </div>

                <button
                    className="flex-button-login"
                    type="submit"
                    disabled={cargando}
                >
                    {cargando ? 'Ingresando...' : 'Iniciar sesión'}
                </button>

                <p className="auth-switch">
                    ¿No tienes cuenta?{' '}
                    <Link className="auth-link" to="/registro">
                        Regístrate
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default Login;
