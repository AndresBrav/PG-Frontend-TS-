import { useCallback, useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import {
    crearGrupo,
    eliminarGrupo,
    listarGruposProfesor,
    listarMisGrupos,
    salirDeGrupo,
    unirseAGrupo,
} from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { GrupoCreado, GrupoEstudiante, GrupoProfesor } from '../../types/dominio';
import { formatearFecha } from '../../utils/fechas';

export const GruposInicio = () => {
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);

    // Estado para Profesor
    const [gruposProfesor, setGruposProfesor] = useState<GrupoProfesor[]>([]);
    const [nombreNuevoGrupo, setNombreNuevoGrupo] = useState('');
    const [creandoGrupo, setCreandoGrupo] = useState(false);
    const [grupoCreado, setGrupoCreado] = useState<GrupoCreado | null>(null);

    // Estado para Estudiante
    const [gruposEstudiante, setGruposEstudiante] = useState<GrupoEstudiante[]>([]);
    const [codigoUnirse, setCodigoUnirse] = useState('');
    const [uniendoGrupo, setUniendoGrupo] = useState(false);
    const [grupoEnProceso, setGrupoEnProceso] = useState<number | null>(null);

    // Estado general
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

    const manejarErrorSesion = useCallback(
        (errorDesconocido: unknown) => {
            if (esErrorDeSesion(errorDesconocido)) {
                cerrarSesion();
                navigate('/');
                return true;
            }
            return false;
        },
        [cerrarSesion, navigate],
    );

    const cargarDatos = useCallback(async () => {
        if (!claveAcceso || !usuario) return;
        setCargando(true);
        setError(null);

        try {
            if (usuario.rol === 'profesor' || usuario.rol === 'admin') {
                const data = await listarGruposProfesor(claveAcceso);
                setGruposProfesor(data);
            } else {
                const data = await listarMisGrupos(claveAcceso);
                setGruposEstudiante(data);
            }
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            setError(obtenerMensajeError(err, 'No se pudieron cargar los grupos'));
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, usuario, manejarErrorSesion]);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const copiarCodigo = async (cod: string) => {
        try {
            await navigator.clipboard.writeText(cod);
            setCodigoCopiado(cod);
            setTimeout(() => setCodigoCopiado(null), 2000);
        } catch {
            // Silencioso
        }
    };

    // --- Acciones de Profesor ---
    const handleCrearGrupo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const limpio = nombreNuevoGrupo.trim();
        if (limpio.length < 2) {
            void Swal.fire('Atención', 'El nombre del grupo debe tener al menos 2 caracteres.', 'warning');
            return;
        }

        setCreandoGrupo(true);
        try {
            const nuevo = await crearGrupo(claveAcceso!, limpio);
            setNombreNuevoGrupo('');
            setGrupoCreado(nuevo);
            void Swal.fire({
                title: '¡Grupo creado!',
                html: `Comparte el código con tus estudiantes: <b class="text-orange-500 font-mono text-xl">${nuevo.codigo}</b>`,
                icon: 'success',
            });
            await cargarDatos();
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            void Swal.fire('Error', obtenerMensajeError(err, 'No se pudo crear el grupo'), 'error');
        } finally {
            setCreandoGrupo(false);
        }
    };

    const handleEliminarGrupo = async (grupo: GrupoProfesor) => {
        const confirmacion = await Swal.fire({
            title: `¿Eliminar "${grupo.nombre}"?`,
            text: 'Se perderán las inscripciones y ejercicios de este grupo.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmacion.isConfirmed) return;

        try {
            await eliminarGrupo(claveAcceso!, grupo.id);
            setGruposProfesor((prev) => prev.filter((g) => g.id !== grupo.id));
            void Swal.fire('Eliminado', 'El grupo ha sido eliminado.', 'success');
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            void Swal.fire('Error', obtenerMensajeError(err, 'No se pudo eliminar el grupo'), 'error');
        }
    };

    // --- Acciones de Estudiante ---
    const handleUnirseGrupo = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const cod = codigoUnirse.trim().toUpperCase();
        if (cod.length !== 6) {
            void Swal.fire('Atención', 'El código de grupo debe tener exactamente 6 caracteres.', 'warning');
            return;
        }

        setUniendoGrupo(true);
        try {
            const resultado = await unirseAGrupo(claveAcceso!, cod);
            setCodigoUnirse('');
            void Swal.fire('¡Te has unido!', `Te inscribiste a: "${resultado.grupo.nombre}"`, 'success');
            await cargarDatos();
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            void Swal.fire('Error', obtenerMensajeError(err, 'No se pudo unir al grupo'), 'error');
        } finally {
            setUniendoGrupo(false);
        }
    };

    const handleSalirGrupo = async (grupo: GrupoEstudiante) => {
        const confirmacion = await Swal.fire({
            title: `¿Salir del grupo "${grupo.nombre}"?`,
            text: 'Dejarás de tener acceso a los ejercicios asignados a este grupo.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, salir',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmacion.isConfirmed) return;

        setGrupoEnProceso(grupo.id);
        try {
            await salirDeGrupo(claveAcceso!, grupo.id);
            setGruposEstudiante((prev) => prev.filter((g) => g.id !== grupo.id));
            void Swal.fire('Listo', 'Has salido del grupo.', 'success');
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            void Swal.fire('Error', obtenerMensajeError(err, 'No se pudo salir del grupo'), 'error');
        } finally {
            setGrupoEnProceso(null);
        }
    };

    const esProfesorOAdmin = usuario?.rol === 'profesor' || usuario?.rol === 'admin';

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">
                            Sección de Grupos
                        </h1>
                        <p className="mt-1 text-sm text-gray-400">
                            {esProfesorOAdmin
                                ? 'Crea y gestiona tus grupos, asigna ejercicios de diagramas y pseudocódigo, y califica entregas.'
                                : 'Accede a tus grupos inscritos y resuelve los ejercicios asignados por tu profesor.'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* VISTA PROFESOR */}
                {esProfesorOAdmin && (
                    <div className="mt-8 grid gap-8 lg:grid-cols-3">
                        {/* Formulario Crear Grupo */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
                                <h2 className="text-lg font-bold text-white">Crear nuevo grupo</h2>
                                <p className="mt-1 text-xs text-gray-400">
                                    Generará un código único de 6 caracteres para que los estudiantes se unan.
                                </p>
                                <form onSubmit={handleCrearGrupo} className="mt-5 space-y-4">
                                    <div>
                                        <label htmlFor="nombreGrupo" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                            Nombre del Grupo
                                        </label>
                                        <input
                                            id="nombreGrupo"
                                            type="text"
                                            value={nombreNuevoGrupo}
                                            onChange={(e) => setNombreNuevoGrupo(e.target.value)}
                                            placeholder="Ej. Programación I - Grupo A"
                                            disabled={creandoGrupo}
                                            className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={creandoGrupo}
                                        className="w-full rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b] disabled:opacity-50"
                                    >
                                        {creandoGrupo ? 'Creando grupo...' : '+ Crear Grupo'}
                                    </button>
                                </form>

                                {grupoCreado && (
                                    <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
                                        <p className="text-xs font-semibold">¡Último grupo creado!</p>
                                        <p className="font-bold text-white mt-1">{grupoCreado.nombre}</p>
                                        <div className="mt-2 flex items-center justify-between rounded-lg bg-black/50 px-3 py-2">
                                            <span className="font-mono text-base font-bold text-amber-400">{grupoCreado.codigo}</span>
                                            <button
                                                type="button"
                                                onClick={() => void copiarCodigo(grupoCreado.codigo)}
                                                className="text-xs font-semibold text-white/80 hover:text-white"
                                            >
                                                {codigoCopiado === grupoCreado.codigo ? '¡Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Listado de Grupos del Profesor */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white">Tus Grupos ({gruposProfesor.length})</h2>
                            </div>

                            {cargando ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-gray-400">
                                    Cargando tus grupos...
                                </div>
                            ) : gruposProfesor.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                                    <p className="text-base font-semibold text-white">No tienes grupos creados</p>
                                    <p className="mt-1 text-sm text-gray-400">Crea tu primer grupo desde el panel lateral izquierdo.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {gruposProfesor.map((grupo) => (
                                        <div
                                            key={grupo.id}
                                            className="rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-lg flex flex-col justify-between transition hover:border-[#FF7C02]/40"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-base font-bold text-white truncate">{grupo.nombre}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => void copiarCodigo(grupo.codigo)}
                                                        title="Click para copiar código"
                                                        className="font-mono text-xs font-bold px-2 py-1 rounded bg-[#FF7C02]/15 text-[#FF9D3D] hover:bg-[#FF7C02]/30"
                                                    >
                                                        {codigoCopiado === grupo.codigo ? '¡Copiado!' : grupo.codigo}
                                                    </button>
                                                </div>
                                                <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                                                    <span>👥 {grupo.estudiantes} estudiante{grupo.estudiantes === 1 ? '' : 's'}</span>
                                                    <span>•</span>
                                                    <span>{formatearFecha(grupo.createdAt)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                                                <Link
                                                    to={`/grupos/${grupo.id}`}
                                                    className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-center py-2 px-3 text-xs font-bold text-white transition"
                                                >
                                                    Gestionar Ejercicios
                                                </Link>
                                                <Link
                                                    to={`/grupos/${grupo.id}/reporte`}
                                                    className="rounded-xl bg-white/10 hover:bg-white/20 text-center py-2 px-3 text-xs font-semibold text-gray-200 transition"
                                                    title="Ver reporte estadístico"
                                                >
                                                    📊 Reporte
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleEliminarGrupo(grupo)}
                                                    className="rounded-xl border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                                                    title="Eliminar grupo"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* VISTA ESTUDIANTE */}
                {!esProfesorOAdmin && (
                    <div className="mt-8 grid gap-8 lg:grid-cols-3">
                        {/* Formulario Unirse a Grupo */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
                                <h2 className="text-lg font-bold text-white">Unirse a un grupo</h2>
                                <p className="mt-1 text-xs text-gray-400">
                                    Ingresa el código de 6 caracteres que te proporcionó tu profesor.
                                </p>
                                <form onSubmit={handleUnirseGrupo} className="mt-5 space-y-4">
                                    <div>
                                        <label htmlFor="codigoGrupo" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                                            Código del Grupo
                                        </label>
                                        <input
                                            id="codigoGrupo"
                                            type="text"
                                            maxLength={6}
                                            value={codigoUnirse}
                                            onChange={(e) => setCodigoUnirse(e.target.value.toUpperCase())}
                                            placeholder="ABC123"
                                            disabled={uniendoGrupo}
                                            className="w-full uppercase font-mono tracking-widest text-center text-lg rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-amber-300 placeholder-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={uniendoGrupo}
                                        className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                        {uniendoGrupo ? 'Uniéndose...' : 'Unirme al Grupo'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Listado de Grupos del Estudiante */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-white">Mis Grupos ({gruposEstudiante.length})</h2>

                            {cargando ? (
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-gray-400">
                                    Cargando tus grupos...
                                </div>
                            ) : gruposEstudiante.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                                    <p className="text-base font-semibold text-white">No perteneces a ningún grupo todavía</p>
                                    <p className="mt-1 text-sm text-gray-400">Pide a tu profesor el código de 6 caracteres para unirte a su clase.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    {gruposEstudiante.map((grupo) => (
                                        <div
                                            key={grupo.id}
                                            className="rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-lg flex flex-col justify-between transition hover:border-emerald-500/40"
                                        >
                                            <div>
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="text-base font-bold text-white truncate">{grupo.nombre}</h3>
                                                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                                        {grupo.codigo}
                                                    </span>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    Profesor: <span className="text-white font-medium">{grupo.profesor?.username ?? 'Sin asignar'}</span>
                                                </p>
                                            </div>

                                            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                                                <Link
                                                    to={`/grupos/${grupo.id}`}
                                                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-center py-2 px-3 text-xs font-bold text-white transition"
                                                >
                                                    Entrar y Resolver
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleSalirGrupo(grupo)}
                                                    disabled={grupoEnProceso === grupo.id}
                                                    className="text-xs text-red-400 hover:text-red-300 transition"
                                                >
                                                    {grupoEnProceso === grupo.id ? 'Saliendo...' : 'Salir'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </AppShell>
    );
};
export default GruposInicio;
