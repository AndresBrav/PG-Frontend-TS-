import { useContext, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { registerUser } from '../../Services/authService';
import BotonMostrarPassword from '../../components/auth/BotonMostrarPassword';
import type { RolDeRegistro } from '../../types/dominio';

interface OpcionRol {
    valor: RolDeRegistro;
    nombre: string;
    descripcion: string;
    icono: string;
}

const OPCIONES_ROL: OpcionRol[] = [
    {
        valor: 'estudiante',
        nombre: 'Estudiante',
        descripcion: 'Aprende y únete a grupos',
        icono: '🎓',
    },
    {
        valor: 'profesor',
        nombre: 'Profesor',
        descripcion: 'Crea grupos y revisa reportes',
        icono: '📚',
    },
];

const SignUp = () => {
    const [codigo, setCodigo] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [edad, setEdad] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmarPassword, setConfirmarPassword] = useState<string>('');
    const [rol, setRol] = useState<RolDeRegistro>('estudiante');
    const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
    const [cargando, setCargando] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string | null>(null);
    const { setClaveAcceso } = useContext(TokenContext);

    const validarFormulario = (): string | null => {
        if (!/^[A-Za-z0-9]{4,20}$/.test(codigo.trim())) {
            return 'El código debe ser alfanumérico de 4 a 20 caracteres.';
        }

        if (!username.trim()) {
            return 'El nombre de usuario es obligatorio.';
        }

        const edadNumero = Number(edad);

        if (
            edad.trim() === '' ||
            !Number.isInteger(edadNumero) ||
            edadNumero <= 0 ||
            edadNumero > 120
        ) {
            return 'La edad debe ser un número entero entre 1 y 120.';
        }

        if (password.length < 4) {
            return 'La contraseña debe tener al menos 4 caracteres.';
        }

        if (password !== confirmarPassword) {
            return 'Las contraseñas no coinciden.';
        }

        return null;
    };

    const handleRegistro = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const errorValidacion = validarFormulario();

        if (errorValidacion) {
            setMensajeError(errorValidacion);
            return;
        }

        setCargando(true);
        setMensajeError(null);

        try {
            const data = await registerUser({
                codigo: codigo.trim(),
                username: username.trim(),
                edad: Number(edad),
                password,
                rol,
            });

            setClaveAcceso(data.token);
        } catch (error) {
            setMensajeError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo completar el registro',
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-page">
            <form
                className="flex-container-login"
                onSubmit={handleRegistro}
                noValidate
            >
                <div className="auth-header">
                    <h1 className="auth-title">Crear cuenta</h1>
                    <p className="auth-subtitle">
                        Completa tus datos para empezar
                    </p>
                </div>

                {mensajeError && (
                    <p className="auth-error" role="alert" aria-live="polite">
                        {mensajeError}
                    </p>
                )}

                <div className="auth-field">
                    <label className="auth-label" htmlFor="registro-codigo">
                        Código institucional
                    </label>
                    <input
                        id="registro-codigo"
                        className="flex-input-login"
                        type="text"
                        placeholder="Ej. 202600123"
                        value={codigo}
                        onChange={(e) => setCodigo(e.target.value)}
                        maxLength={20}
                        autoComplete="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        required
                    />
                    <span className="auth-help">
                        Alfanumérico de 4 a 20 caracteres. Conserva los ceros.
                    </span>
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="registro-username">
                        Usuario
                    </label>
                    <input
                        id="registro-username"
                        className="flex-input-login"
                        type="text"
                        placeholder="Tu nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="auth-field">
                    <label className="auth-label" htmlFor="registro-edad">
                        Edad
                    </label>
                    <input
                        id="registro-edad"
                        className="flex-input-login"
                        type="number"
                        placeholder="Ej. 17"
                        value={edad}
                        onChange={(e) => setEdad(e.target.value)}
                        min={1}
                        max={120}
                        inputMode="numeric"
                        required
                    />
                </div>

                <div className="auth-field">
                    <span className="auth-label">Tipo de cuenta</span>
                    <div
                        className="auth-role-group"
                        role="radiogroup"
                        aria-label="Tipo de cuenta"
                    >
                        {OPCIONES_ROL.map((opcion) => (
                            <label
                                key={opcion.valor}
                                className={
                                    rol === opcion.valor
                                        ? 'auth-role-option seleccionado'
                                        : 'auth-role-option'
                                }
                            >
                                <input
                                    type="radio"
                                    name="rol"
                                    value={opcion.valor}
                                    checked={rol === opcion.valor}
                                    onChange={() => setRol(opcion.valor)}
                                />
                                <span
                                    className="auth-role-icon"
                                    aria-hidden="true"
                                >
                                    {opcion.icono}
                                </span>
                                <span className="auth-role-name">
                                    {opcion.nombre}
                                </span>
                                <span className="auth-role-description">
                                    {opcion.descripcion}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="auth-field">
                    <label
                        className="auth-label"
                        htmlFor="registro-password"
                    >
                        Contraseña
                    </label>
                    <div className="auth-password">
                        <input
                            id="registro-password"
                            className="flex-input-login"
                            type={mostrarPassword ? 'text' : 'password'}
                            placeholder="Mínimo 4 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
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

                <div className="auth-field">
                    <label
                        className="auth-label"
                        htmlFor="registro-confirmar-password"
                    >
                        Confirmar contraseña
                    </label>
                    <div className="auth-password">
                        <input
                            id="registro-confirmar-password"
                            className="flex-input-login"
                            type={mostrarPassword ? 'text' : 'password'}
                            placeholder="Repite tu contraseña"
                            value={confirmarPassword}
                            onChange={(e) =>
                                setConfirmarPassword(e.target.value)
                            }
                            autoComplete="new-password"
                            required
                        />
                    </div>
                </div>

                <button
                    className="flex-button-login"
                    type="submit"
                    disabled={cargando}
                >
                    {cargando ? 'Registrando...' : 'Registrarse'}
                </button>

                <p className="auth-switch">
                    ¿Ya tienes cuenta?{' '}
                    <Link className="auth-link" to="/">
                        Inicia sesión
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default SignUp;
