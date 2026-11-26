import { useContext, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { registerUser } from '../../Services/authService';
import BotonMostrarPassword from '../../components/auth/BotonMostrarPassword';
import type { Rol } from '../../types/dominio';

interface OpcionRol {
    valor: Rol;
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
    const [correo, setCorreo] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmarPassword, setConfirmarPassword] = useState<string>('');
    const [rol, setRol] = useState<Rol>('estudiante');
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

        const correoNormalizado = correo.trim().toLowerCase();
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!correoNormalizado || !regexCorreo.test(correoNormalizado)) {
            return 'Ingresa un correo electrónico válido.';
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
                correo: correo.trim().toLowerCase(),
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
                    <label className="auth-label" htmlFor="registro-correo">
                        Correo electrónico
                    </label>
                    <input
                        id="registro-correo"
                        className="flex-input-login"
                        type="email"
                        placeholder="tu.correo@ejemplo.com"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="auth-field">
                    <span className="auth-label">Tipo de cuenta</span>
                    <div
                        className="auth-role-group"
                        role="radiogroup"
                        aria-label="Tipo de cuenta"
                        style={{
                            display: 'flex',
                            gap: '10px',
                            flexWrap: 'wrap',
                        }}
                    >
                        {OPCIONES_ROL.map((opcion) => (
                            <label
                                key={opcion.valor}
                                className="auth-role-option"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    border:
                                        rol === opcion.valor
                                            ? '2px solid #7c5cff'
                                            : '2px solid rgba(255,255,255,0.15)',
                                    background:
                                        rol === opcion.valor
                                            ? 'rgba(124,92,255,0.12)'
                                            : 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="rol"
                                    value={opcion.valor}
                                    checked={rol === opcion.valor}
                                    onChange={() => setRol(opcion.valor)}
                                />
                                <span aria-hidden="true">
                                    {opcion.icono}
                                </span>
                                <span
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <span style={{ fontWeight: 600 }}>
                                        {opcion.nombre}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: '0.75rem',
                                            opacity: 0.8,
                                        }}
                                    >
                                        {opcion.descripcion}
                                    </span>
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
