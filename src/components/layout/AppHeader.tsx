import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import profileIcon from '../../assets/filesSvg/filesdashboardSvg/profile.svg';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import {
    enviarIdNotificacion,
    traerNotificaciones,
    traerTableroPuntuacion,
    type PuntuacionUsuario,
} from '../../api/notificacionApi';
import { traerPuntuacion } from '../../api/usuarioApi';
import { actualizarAvatar } from '../../api/perfilApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import avatars from '../../pages/users/avatars';
import EtiquetaRol from '../ui/EtiquetaRol';
import { formatearFechaHora } from '../../utils/fechas';

interface Notificacion {
    id: number;
    descripcion: string;
    fecha: string;
}

type PanelAbierto = 'notificaciones' | 'tablero' | null;

const enlaceBase =
    'rounded-xl px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap';

const AppHeader = () => {
    const { claveAcceso } = useContext(TokenContext);
    const { usuario, refrescarPerfil } = useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();
    const navigate = useNavigate();
    const location = useLocation();

    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [panelAbierto, setPanelAbierto] = useState<PanelAbierto>(null);
    const [scoreboard, setScoreboard] = useState<PuntuacionUsuario[]>([]);
    const [cargandoScoreboard, setCargandoScoreboard] = useState(false);
    const [puntuacion, setPuntuacion] = useState(usuario?.puntos ?? 0);
    const [scoreboardTop, setScoreboardTop] = useState(80);

    const [perfilAbierto, setPerfilAbierto] = useState(false);
    const [avatarAbierto, setAvatarAbierto] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);
    const [guardandoAvatar, setGuardandoAvatar] = useState(false);
    const [errorAvatar, setErrorAvatar] = useState<string | null>(null);
    const headerRef = useRef<HTMLHeaderElement>(null);

    useEffect(() => {
        setPuntuacion(usuario?.puntos ?? 0);
    }, [usuario?.puntos]);

    useEffect(() => {
        setPanelAbierto(null);
        setPerfilAbierto(false);
    }, [location.pathname]);

    // Mientras haya un panel modal abierto, evitamos que la pÃ¡gina de fondo
    // siga desplazÃ¡ndose y permitimos cerrarlo con Escape.
    useEffect(() => {
        if (!perfilAbierto && !avatarAbierto) return;

        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const manejarTecla = (evento: KeyboardEvent) => {
            if (evento.key !== 'Escape') return;

            if (avatarAbierto) {
                setAvatarAbierto(false);
                return;
            }

            setPerfilAbierto(false);
        };

        window.addEventListener('keydown', manejarTecla);

        return () => {
            document.body.style.overflow = overflowAnterior;
            window.removeEventListener('keydown', manejarTecla);
        };
    }, [perfilAbierto, avatarAbierto]);

    useEffect(() => {
        if (panelAbierto !== 'tablero' || !headerRef.current) return;

        const actualizar = () => {
            if (headerRef.current) {
                const rect = headerRef.current.getBoundingClientRect();
                setScoreboardTop(rect.bottom + 8);
            }
        };

        actualizar();
        window.addEventListener('resize', actualizar);
        return () => window.removeEventListener('resize', actualizar);
    }, [panelAbierto, headerRef]);

    useEffect(() => {
        if (!claveAcceso) return;

        let activo = true;

        const cargarResumen = async () => {
            const [dataNotificaciones, dataPuntuacion] = await Promise.all([
                traerNotificaciones(claveAcceso),
                traerPuntuacion(claveAcceso),
            ]);

            if (!activo) return;

            if (dataNotificaciones) {
                setNotificaciones(dataNotificaciones.arreglonoti);
            }

            if (dataPuntuacion) {
                setPuntuacion(dataPuntuacion.puntuacionTotal);
            }
        };

        void cargarResumen();

        return () => {
            activo = false;
        };
    }, [claveAcceso, location.pathname]);

    const cargarTablero = async () => {
        if (!claveAcceso) return;

        setCargandoScoreboard(true);
        const data = await traerTableroPuntuacion(claveAcceso);

        if (data) {
            setScoreboard(data);
        }

        setCargandoScoreboard(false);
    };

    const alternarPanel = (panel: Exclude<PanelAbierto, null>) => {
        const siguiente = panelAbierto === panel ? null : panel;
        setPanelAbierto(siguiente);

        if (siguiente === 'tablero' && headerRef.current) {
            const rect = headerRef.current.getBoundingClientRect();
            setScoreboardTop(rect.bottom + 8);
        }

        if (siguiente === 'tablero') {
            void cargarTablero();
        }
    };

    const abrirPerfil = () => {
        setPanelAbierto(null);
        setPerfilAbierto(true);
    };

    const abrirSelectorAvatar = () => {
        setErrorAvatar(null);
        setSelectedAvatar(null);
        setAvatarAbierto(true);
    };

    const guardarAvatar = async () => {
        if (!claveAcceso || selectedAvatar === null) return;

        setGuardandoAvatar(true);
        setErrorAvatar(null);

        try {
            await actualizarAvatar(claveAcceso, selectedAvatar);
            await refrescarPerfil();
            setAvatarAbierto(false);
            setSelectedAvatar(null);
            await Swal.fire({
                icon: 'success',
                title: 'Avatar actualizado',
                timer: 1200,
                showConfirmButton: false,
                background: '#242424',
                color: '#ffffff',
            });
        } catch (errorDesconocido) {
            if (esErrorDeSesion(errorDesconocido)) {
                cerrarSesion();
                navigate('/');
                return;
            }

            setErrorAvatar(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo actualizar el avatar'
                )
            );
        } finally {
            setGuardandoAvatar(false);
        }
    };

    const salir = () => {
        cerrarSesion();
        navigate('/');
    };

    const enlaces: { to: string; texto: string }[] = [
        { to: '/dashboard', texto: 'Inicio' },
        { to: '/grupos', texto: 'Grupos' },
        { to: '/ejercicios', texto: 'Ejercicios' },
        { to: '/ejercicios-ia', texto: 'Ejercicios IA' },
    ];

    if (usuario?.rol === 'admin') {
        enlaces.push({ to: '/admin', texto: 'AdministraciÃ³n' });
    }

    if (!usuario) return null;

    return (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#181818]/95 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
                <Link
                    to="/dashboard"
                    className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF7C02] text-lg text-black shadow-lg shadow-[#FF7C02]/20">
                        &lt;/&gt;
                    </span>
                    <span>
                        Juego<span className="text-[#FF7C02]">LP</span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {enlaces.map((enlace) => (
                        <NavLink
                            key={enlace.to}
                            to={enlace.to}
                            className={({ isActive }) =>
                                `${enlaceBase} ${
                                    isActive
                                        ? 'bg-[#FF7C02] text-black'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            {enlace.texto}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-1 sm:gap-3">
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => alternarPanel('tablero')}
                            className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10"
                            title="Ver tablero de puntuaciones"
                            aria-label="Ver tablero de puntuaciones"
                        >
                            <svg
                                className="h-6 w-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M19 5H18V3C18 2.45 17.55 2 17 2H7C6.45 2 6 2.45 6 3V5H5C3.9 5 3 5.9 3 7V9C3 11.24 4.61 13.12 6.78 13.82C7.57 15.34 9.04 16.43 10.8 16.78V19H9C8.45 19 8 19.45 8 20V21C8 21.55 8.45 22 9 22H15C15.55 22 16 21.55 16 21V20C16 19.45 15.55 19 15 19H13.2V16.78C14.96 16.43 16.43 15.34 17.22 13.82C19.39 13.12 21 11.24 21 9V7C21 5.9 20.1 5 19 5ZM5 9V7H6V11C4.9 10.6 4.1 9.9 5 9ZM19 9C19.9 9.9 19.1 10.6 18 11V7H19V9Z"
                                    fill="#FF7C02"
                                />
                            </svg>
                        </button>

                        {panelAbierto === 'tablero' &&
                            createPortal(
                                <div
                                    className="fixed inset-x-0 z-[120] flex justify-center px-4"
                                    style={{ top: scoreboardTop }}
                                >
                                    <div
                                        className="w-[min(90vw,360px)] rounded-2xl border border-white/10 bg-[#202020] p-4 text-white shadow-2xl"
                                        onClick={(evento) =>
                                            evento.stopPropagation()
                                        }
                                    >
                                        <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-[#FF7C02]">
                                                Tablero de puntuaciones
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPanelAbierto(null)
                                                }
                                                className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-gray-300 transition hover:bg-white/20 hover:text-white"
                                            >
                                                Cerrar
                                            </button>
                                        </div>

                                        <div
                                            className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1"
                                            style={{ scrollbarWidth: 'thin' }}
                                        >
                                            {cargandoScoreboard ? (
                                                <div className="flex flex-col items-center py-6 text-xs text-gray-400">
                                                    <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                                                    Cargando tablero...
                                                </div>
                                            ) : scoreboard.length === 0 ? (
                                                <p className="py-6 text-center text-xs text-gray-400">
                                                    Sin puntuaciones registradas
                                                </p>
                                            ) : (
                                                scoreboard.map(
                                                    (jugador, indice) => {
                                                        let estilo =
                                                            'border-white/10 bg-white/5';
                                                        let insignia =
                                                            'bg-white/10 text-gray-300';

                                                        if (indice === 0) {
                                                            estilo =
                                                                'border-amber-400/30 bg-amber-400/10';
                                                            insignia =
                                                                'bg-amber-400 text-black';
                                                        } else if (
                                                            indice === 1
                                                        ) {
                                                            estilo =
                                                                'border-slate-300/20 bg-slate-300/10';
                                                            insignia =
                                                                'bg-slate-300 text-black';
                                                        } else if (
                                                            indice === 2
                                                        ) {
                                                            estilo =
                                                                'border-amber-700/30 bg-amber-700/15';
                                                            insignia =
                                                                'bg-amber-700 text-amber-100';
                                                        }

                                                        return (
                                                            <div
                                                                key={`${jugador.username}-${indice}`}
                                                                className={`flex items-center justify-between rounded-xl border p-2.5 ${estilo}`}
                                                            >
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span
                                                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${insignia}`}
                                                                    >
                                                                        {indice +
                                                                            1}
                                                                    </span>
                                                                    <span className="truncate text-xs font-semibold text-gray-200">
                                                                        {
                                                                            jugador.username
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <span className="ml-3 shrink-0 text-xs font-bold text-[#FF7C02]">
                                                                    {
                                                                        jugador.puntuacionTotal
                                                                    }{' '}
                                                                    pts
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                )
                                            )}
                                        </div>
                                    </div>
                                </div>,
                                document.body
                            )}
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-white/5 px-2 py-1.5 text-sm font-bold text-white sm:gap-1.5 sm:px-3">
                        <svg
                            className="h-5 w-5 sm:h-6 sm:w-6"
                            viewBox="415 411 26 32"
                            fill="#FF7C02"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                        >
                            <path d="M428.5,441 C422.148,441 417,435.641 417,429.625 C417,428.228 417.031,427.094 418,426 C417.895,426.634 419.397,432.055 424.305,431.771 C424.092,427.652 422.978,417.561 428.152,414.073 C427.695,419.557 429.038,426.924 435.029,428 C434.686,425.801 434.727,422.143 436.267,421.467 C436.433,424.836 438.924,426.914 438.924,430.152 C438.924,436.016 433.251,441 428.5,441 L428.5,441 Z M437.905,417.953 C433.52,419.203 432.717,422.748 433,425 C429.872,421.322 430,417.093 430,411 C419.968,414.783 422.301,425.688 422,429 C419.477,426.935 419,422 419,422 C416.336,423.371 415,427.031 415,430 C415,437.18 420.82,443 428,443 C435.18,443 441,437.18 441,430 C441,425.733 437.867,423.765 437.905,417.953 L437.905,417.953 Z" />
                        </svg>
                        <span>{puntuacion}</span>
                        <span className="hidden text-[11px] font-medium text-gray-400 sm:inline">
                            pts
                        </span>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => alternarPanel('notificaciones')}
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-white/10"
                            title="Notificaciones"
                            aria-label="Notificaciones"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="#ffffff"
                                viewBox="0 0 512 512"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden="true"
                            >
                                <path d="M256,48C141.31,48,48,141.31,48,256s93.31,208,208,208,208-93.31,208-208S370.69,48,256,48Zm0,336c-20.9,0-37.52-8.86-39.75-27.58a4,4,0,0,1,4-4.42h71.45a4,4,0,0,1,4,4.48C293.15,374.85,276.68,384,256,384Zm98-48H158c-11.84,0-18-15-11.19-23,16.33-19.34,27.87-27.47,27.87-80.8,0-48.87,25.74-66.21,47-74.67a11.35,11.35,0,0,0,6.33-6.68C231.7,138.6,242.14,128,256,128s24.28,10.6,28,22.86a11.39,11.39,0,0,0,6.34,6.68c21.21,8.44,47,25.81,47,74.67,0,53.33,11.53,61.46,27.86,80.8C371.94,321,365.77,336,354,336Z" />
                            </svg>

                            {notificaciones.length > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#181818] bg-red-600 text-[10px] font-bold text-white">
                                    {notificaciones.length > 99
                                        ? '99+'
                                        : notificaciones.length}
                                </span>
                            )}
                        </button>

                        {panelAbierto === 'notificaciones' && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-[min(90vw,380px)] rounded-2xl border border-white/10 bg-[#202020] p-4 text-white shadow-2xl">
                                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-[#FF7C02]">
                                        Notificaciones
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPanelAbierto(null)}
                                        className="rounded-lg bg-white/10 px-2 py-1 text-xs font-semibold text-gray-300 transition hover:bg-white/20 hover:text-white"
                                    >
                                        Cerrar
                                    </button>
                                </div>

                                <div
                                    className="flex max-h-[340px] flex-col gap-2 overflow-y-auto pr-1"
                                    style={{ scrollbarWidth: 'thin' }}
                                >
                                    {notificaciones.length === 0 ? (
                                        <p className="py-6 text-center text-xs text-gray-400">
                                            No tienes notificaciones nuevas
                                        </p>
                                    ) : (
                                        notificaciones.map((noti) => (
                                            <button
                                                type="button"
                                                key={noti.id}
                                                onClick={() => {
                                                    if (!claveAcceso) return;

                                                    void enviarIdNotificacion(
                                                        noti.id,
                                                        claveAcceso
                                                    );
                                                    setNotificaciones(
                                                        (anteriores) =>
                                                            anteriores.filter(
                                                                (item) =>
                                                                    item.id !==
                                                                    noti.id
                                                            )
                                                    );
                                                }}
                                                className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:border-[#FF7C02]/40 hover:bg-[#FF7C02]/10"
                                            >
                                                <p className="text-sm font-medium text-gray-100">
                                                    {noti.descripcion}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {formatearFechaHora(
                                                        noti.fecha
                                                    )}
                                                </p>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={abrirPerfil}
                        className="h-10 w-10 overflow-hidden rounded-xl border-2 border-transparent bg-white/10 transition hover:border-[#FF7C02]"
                        title="Ver perfil"
                        aria-label="Ver perfil"
                    >
                        <img
                            src={usuario.avatarUrl || profileIcon}
                            alt="Avatar del usuario"
                            className="h-full w-full object-cover"
                        />
                    </button>
                </div>
            </div>

            <nav
                className="mx-auto flex w-full max-w-7xl gap-1 overflow-x-auto px-3 pb-2 md:hidden"
                style={{ scrollbarWidth: 'thin' }}
            >
                {enlaces.map((enlace) => (
                    <NavLink
                        key={enlace.to}
                        to={enlace.to}
                        className={({ isActive }) =>
                            `${enlaceBase} ${
                                isActive
                                    ? 'bg-[#FF7C02] text-black'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        {enlace.texto}
                    </NavLink>
                ))}
            </nav>

            {perfilAbierto &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm"
                        onClick={() => setPerfilAbierto(false)}
                    >
                        <aside
                            className="flex h-dvh w-full max-w-sm flex-col overflow-y-auto overscroll-contain bg-[#202020] p-6 shadow-2xl"
                            onClick={(evento) => evento.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Mi perfil"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">
                                    Mi perfil
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setPerfilAbierto(false)}
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Cerrar perfil"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-8 flex flex-col items-center text-center">
                                <img
                                    src={usuario.avatarUrl || profileIcon}
                                    alt="Avatar del usuario"
                                    className="h-28 w-28 rounded-full border-4 border-[#FF7C02]/40 object-cover"
                                />
                                <h3 className="mt-4 text-2xl font-extrabold text-white">
                                    {usuario.username}
                                </h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Codigo: {usuario.codigo}
                                </p>
                                <div className="mt-3">
                                    <EtiquetaRol rol={usuario.rol} />
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                                    <p className="text-xs text-gray-400">
                                        Puntos
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-[#FF7C02]">
                                        {puntuacion}
                                    </p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                                    <p className="text-xs text-gray-400">
                                        Edad
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-white">
                                        {usuario.edad}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={abrirSelectorAvatar}
                                    className="rounded-xl border border-white/15 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Cambiar avatar
                                </button>
                                <button
                                    type="button"
                                    onClick={salir}
                                    className="rounded-xl bg-red-500/15 px-4 py-3 font-semibold text-red-300 transition hover:bg-red-500/25"
                                >
                                    Cerrar sesion
                                </button>
                            </div>
                        </aside>
                    </div>,
                    document.body
                )}

            {avatarAbierto &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4"
                        onClick={() => setAvatarAbierto(false)}
                    >
                        <div
                            className="max-h-[90dvh] w-full max-w-xl overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#202020] p-5 shadow-2xl"
                            onClick={(evento) => evento.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Elegir avatar"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">
                                    Elige tu avatar
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setAvatarAbierto(false)}
                                    className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                                    aria-label="Cerrar selector de avatar"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
                                {avatars.map((avatar) => {
                                    const esActual =
                                        selectedAvatar === null &&
                                        usuario.avatarUrl === avatar.url;
                                    const seleccionado =
                                        selectedAvatar === avatar.id ||
                                        esActual;

                                    return (
                                        <button
                                            type="button"
                                            key={avatar.id}
                                            onClick={() =>
                                                setSelectedAvatar(avatar.id)
                                            }
                                            className={`overflow-hidden rounded-2xl border-2 p-1 transition ${
                                                seleccionado
                                                    ? 'border-[#FF7C02] bg-[#FF7C02]/10'
                                                    : 'border-white/10 bg-white/5 hover:border-white/30'
                                            }`}
                                            aria-label={`Seleccionar avatar ${avatar.id}`}
                                        >
                                            <img
                                                src={avatar.url}
                                                alt={`Avatar ${avatar.id}`}
                                                className="aspect-square w-full rounded-xl object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>

                            {errorAvatar && (
                                <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                                    {errorAvatar}
                                </p>
                            )}

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setAvatarAbierto(false)}
                                    className="rounded-xl border border-white/15 px-4 py-2.5 font-semibold text-white transition hover:bg-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void guardarAvatar();
                                    }}
                                    disabled={
                                        selectedAvatar === null ||
                                        guardandoAvatar
                                    }
                                    className="rounded-xl bg-[#FF7C02] px-4 py-2.5 font-bold text-black transition hover:bg-[#ff8f2b] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {guardandoAvatar
                                        ? 'Guardando...'
                                        : 'Guardar avatar'}
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </header>
    );
};

export default AppHeader;
