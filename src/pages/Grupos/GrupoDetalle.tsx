import { useCallback, useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import {
    eliminarEjercicioGrupo,
    listarEjerciciosGrupoEstudiante,
    listarEjerciciosGrupoProfesor,
    listarMisGrupos,
    obtenerDetalleGrupo,
    obtenerRankingGrupo,
} from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    EjercicioGrupoEstudiante,
    EjercicioGrupoProfesor,
    EstudianteRankingGrupo,
    GrupoDetalle as IGrupoDetalle,
    GrupoEstudiante,
    TipoEjercicioGrupo,
} from '../../types/dominio';
import { CrearEjercicioModal } from './CrearEjercicioModal';
import { RevisarEntregasModal } from './RevisarEntregasModal';

export const GrupoDetalle = () => {
    const { id } = useParams<{ id: string }>();
    const grupoId = Number(id);
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);

    const esProfesorOAdmin = usuario?.rol === 'profesor' || usuario?.rol === 'admin';

    // Estados para Profesor
    const [detalleGrupoProfesor, setDetalleGrupoProfesor] = useState<IGrupoDetalle | null>(null);
    const [ejerciciosProfesor, setEjerciciosProfesor] = useState<EjercicioGrupoProfesor[]>([]);
    const [tabProfesor, setTabProfesor] = useState<'ejercicios' | 'estudiantes' | 'ranking'>('ejercicios');
    const [modalCrearAbierto, setModalCrearAbierto] = useState(false);

    // Modal de Revisar
    const [ejercicioARevisar, setEjercicioARevisar] = useState<{
        id: number;
        titulo: string;
        tipo: TipoEjercicioGrupo;
        puntos: number;
    } | null>(null);

    // Estados para Estudiante
    const [infoGrupoEstudiante, setInfoGrupoEstudiante] = useState<GrupoEstudiante | null>(null);
    const [ejerciciosEstudiante, setEjerciciosEstudiante] = useState<EjercicioGrupoEstudiante[]>([]);
    const [tabEstudiante, setTabEstudiante] = useState<'ejercicios' | 'ranking'>('ejercicios');

    // Ranking del Grupo (Mejores notas)
    const [rankingGrupo, setRankingGrupo] = useState<EstudianteRankingGrupo[]>([]);
    const [cargandoRanking, setCargandoRanking] = useState(false);

    // Estados generales
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [codigoCopiado, setCodigoCopiado] = useState(false);

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

    const cargarRanking = useCallback(async () => {
        if (!claveAcceso || !grupoId) return;
        setCargandoRanking(true);
        try {
            const data = await obtenerRankingGrupo(claveAcceso, grupoId, esProfesorOAdmin);
            setRankingGrupo(data);
        } catch (err) {
            console.error('Error cargando ranking del grupo:', err);
        } finally {
            setCargandoRanking(false);
        }
    }, [claveAcceso, grupoId, esProfesorOAdmin]);

    const cargarDatos = useCallback(async () => {
        if (!claveAcceso || !usuario || !grupoId) return;
        setCargando(true);
        setError(null);

        try {
            if (esProfesorOAdmin) {
                const [grupoInfo, ejercicios] = await Promise.all([
                    obtenerDetalleGrupo(claveAcceso, grupoId),
                    listarEjerciciosGrupoProfesor(claveAcceso, grupoId),
                ]);
                setDetalleGrupoProfesor(grupoInfo);
                setEjerciciosProfesor(ejercicios);
            } else {
                const [misGrupos, ejercicios] = await Promise.all([
                    listarMisGrupos(claveAcceso),
                    listarEjerciciosGrupoEstudiante(claveAcceso, grupoId),
                ]);
                const actual = misGrupos.find((g) => g.id === grupoId) || null;
                setInfoGrupoEstudiante(actual);
                setEjerciciosEstudiante(ejercicios);
            }
            void cargarRanking();
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            setError(obtenerMensajeError(err, 'No se pudo cargar la información del grupo'));
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, usuario, grupoId, esProfesorOAdmin, manejarErrorSesion, cargarRanking]);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const copiarCodigo = async (cod: string) => {
        try {
            await navigator.clipboard.writeText(cod);
            setCodigoCopiado(true);
            setTimeout(() => setCodigoCopiado(false), 2000);
        } catch {
            // Silencioso
        }
    };

    const handleEliminarEjercicio = async (ejercicio: EjercicioGrupoProfesor) => {
        const confirmacion = await Swal.fire({
            title: `¿Eliminar "${ejercicio.titulo}"?`,
            text: 'Se eliminarán también las entregas y notas asociadas.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
        });

        if (!confirmacion.isConfirmed || !claveAcceso) return;

        try {
            await eliminarEjercicioGrupo(claveAcceso, ejercicio.id);
            setEjerciciosProfesor((prev) => prev.filter((e) => e.id !== ejercicio.id));
            void cargarRanking();
            void Swal.fire('Eliminado', 'El ejercicio ha sido eliminado.', 'success');
        } catch (err) {
            if (manejarErrorSesion(err)) return;
            void Swal.fire('Error', obtenerMensajeError(err, 'No se pudo eliminar el ejercicio'), 'error');
        }
    };

    const nombreGrupo = esProfesorOAdmin
        ? detalleGrupoProfesor?.nombre ?? 'Grupo'
        : infoGrupoEstudiante?.nombre ?? 'Grupo';

    const codigoGrupo = esProfesorOAdmin
        ? detalleGrupoProfesor?.codigo ?? ''
        : infoGrupoEstudiante?.codigo ?? '';

    // Render de la pestaña de Ranking / Mejores notas
    const renderRanking = () => {
        if (cargandoRanking) {
            return (
                <div className="py-12 text-center text-sm text-gray-400">
                    Cargando mejores notas del grupo...
                </div>
            );
        }

        if (rankingGrupo.length === 0) {
            return (
                <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                    <p className="text-base font-semibold text-white">
                        Aún no hay puntuaciones registradas en este grupo
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                        Los estudiantes aparecerán aquí a medida que entreguen ejercicios y reciban su nota.
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🏆</span> Mejores Notas del Grupo
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Clasificación de los estudiantes basada exclusivamente en los puntos de este grupo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void cargarRanking()}
                        className="rounded-lg bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition"
                    >
                        🔄 Actualizar
                    </button>
                </div>

                {/* Tabla de Ranking */}
                <div className="rounded-2xl border border-white/10 bg-[#181818] overflow-hidden shadow-xl">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                            <tr>
                                <th className="py-3 px-4 w-20 text-center">Lugar</th>
                                <th className="py-3 px-4">Estudiante</th>
                                <th className="py-3 px-4">Código</th>
                                <th className="py-3 px-4 text-center">Ejercicios</th>
                                <th className="py-3 px-4 text-right">Puntuación Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rankingGrupo.map((est, index) => {
                                let estiloFila = 'hover:bg-white/5';
                                let badgeLugar = (
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400">
                                        {index + 1}º
                                    </span>
                                );

                                if (index === 0) {
                                    estiloFila = 'bg-amber-400/5 hover:bg-amber-400/10';
                                    badgeLugar = (
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-black text-sm font-black shadow-md shadow-amber-400/20">
                                            🥇 1º
                                        </span>
                                    );
                                } else if (index === 1) {
                                    estiloFila = 'bg-slate-300/5 hover:bg-slate-300/10';
                                    badgeLugar = (
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-300 text-black text-sm font-black shadow-md shadow-slate-300/20">
                                            🥈 2º
                                        </span>
                                    );
                                } else if (index === 2) {
                                    estiloFila = 'bg-amber-700/10 hover:bg-amber-700/15';
                                    badgeLugar = (
                                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-700 text-amber-100 text-sm font-black shadow-md shadow-amber-700/20">
                                            🥉 3º
                                        </span>
                                    );
                                }

                                return (
                                    <tr key={est.id} className={estiloFila}>
                                        <td className="py-3.5 px-4 text-center">
                                            {badgeLugar}
                                        </td>
                                        <td className="py-3.5 px-4 font-semibold text-white">
                                            {est.username}
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-xs text-gray-400">
                                            {est.codigo}
                                        </td>
                                        <td className="py-3.5 px-4 text-center text-xs">
                                            <span className="rounded-full bg-white/5 px-2.5 py-1 font-semibold text-gray-300">
                                                {est.completados} / {est.totalEjercicios}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 text-right font-mono font-bold text-base text-amber-400">
                                            {est.puntosTotales} pts
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                {/* Migas de pan y cabecera */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                            <Link to="/grupos" className="hover:text-white transition">
                                ← Volver a Grupos
                            </Link>
                        </div>
                        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
                            {nombreGrupo}
                            {codigoGrupo && (
                                <button
                                    type="button"
                                    onClick={() => void copiarCodigo(codigoGrupo)}
                                    title="Click para copiar código"
                                    className="font-mono text-sm font-bold px-2.5 py-1 rounded bg-[#FF7C02]/15 text-[#FF9D3D] hover:bg-[#FF7C02]/30 transition"
                                >
                                    {codigoCopiado ? '¡Copiado!' : codigoGrupo}
                                </button>
                            )}
                        </h1>
                        {!esProfesorOAdmin && infoGrupoEstudiante?.profesor && (
                            <p className="mt-1 text-sm text-gray-400">
                                Profesor: <span className="text-white font-medium">{infoGrupoEstudiante.profesor.username}</span>
                            </p>
                        )}
                    </div>

                    {esProfesorOAdmin && (
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/grupos/${grupoId}/reporte`}
                                className="rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs font-bold text-white transition flex items-center gap-1.5"
                            >
                                📊 Ver Reporte del Grupo
                            </Link>
                            <button
                                type="button"
                                onClick={() => setModalCrearAbierto(true)}
                                className="rounded-xl bg-[#FF7C02] hover:bg-[#ff8f2b] px-4 py-2.5 text-xs font-bold text-black transition shadow-lg"
                            >
                                + Crear Ejercicio
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {/* VISTA PROFESOR */}
                {esProfesorOAdmin && (
                    <div className="mt-8">
                        {/* Pestañas */}
                        <div className="flex items-center gap-4 border-b border-white/10 pb-3">
                            <button
                                type="button"
                                onClick={() => setTabProfesor('ejercicios')}
                                className={`text-sm font-bold transition pb-1 border-b-2 ${
                                    tabProfesor === 'ejercicios'
                                        ? 'border-[#FF7C02] text-[#FF9D3D]'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                Ejercicios Asignados ({ejerciciosProfesor.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setTabProfesor('estudiantes')}
                                className={`text-sm font-bold transition pb-1 border-b-2 ${
                                    tabProfesor === 'estudiantes'
                                        ? 'border-[#FF7C02] text-[#FF9D3D]'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                Estudiantes Inscritos ({detalleGrupoProfesor?.estudiantes?.length ?? 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTabProfesor('ranking');
                                    void cargarRanking();
                                }}
                                className={`text-sm font-bold transition pb-1 border-b-2 ${
                                    tabProfesor === 'ranking'
                                        ? 'border-[#FF7C02] text-[#FF9D3D]'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                🏆 Mejores Notas
                            </button>
                        </div>

                        {cargando ? (
                            <div className="py-12 text-center text-sm text-gray-400">
                                Cargando información del grupo...
                            </div>
                        ) : tabProfesor === 'ranking' ? (
                            <div className="mt-6">
                                {renderRanking()}
                            </div>
                        ) : tabProfesor === 'ejercicios' ? (
                            <div className="mt-6">
                                {ejerciciosProfesor.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                                        <p className="text-base font-semibold text-white">
                                            No hay ejercicios creados para este grupo
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Crea el primer ejercicio de diagrama de flujo o pseudocódigo PSeInt con el botón superior.
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setModalCrearAbierto(true)}
                                            className="mt-4 rounded-xl bg-[#FF7C02] px-4 py-2 text-xs font-bold text-black hover:bg-[#ff8f2b] transition"
                                        >
                                            + Crear Ejercicio Ahora
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {ejerciciosProfesor.map((ej) => (
                                            <div
                                                key={ej.id}
                                                className="rounded-2xl border border-white/10 bg-[#181818] p-5 shadow-lg flex flex-col justify-between transition hover:border-[#FF7C02]/40"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span
                                                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                                ej.tipo === 'diagrama'
                                                                    ? 'bg-sky-500/20 text-sky-300'
                                                                    : 'bg-emerald-500/20 text-emerald-300'
                                                            }`}
                                                        >
                                                            {ej.tipo === 'diagrama' ? '📊 Diagrama' : '💻 Pseudocódigo'}
                                                        </span>
                                                        <span className="font-bold text-amber-400 text-xs">
                                                            {ej.puntos} pts
                                                        </span>
                                                    </div>
                                                    <h3 className="mt-3 text-base font-bold text-white line-clamp-1">
                                                        {ej.titulo}
                                                    </h3>
                                                    <p className="mt-2 text-xs text-gray-400 line-clamp-3">
                                                        {ej.enunciado}
                                                    </p>
                                                    <div className="mt-4 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300 flex items-center justify-between">
                                                        <span>Entregas completadas:</span>
                                                        <span className="font-bold text-white">
                                                            {ej.completados} / {ej.totalEstudiantes}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setEjercicioARevisar({
                                                                id: ej.id,
                                                                titulo: ej.titulo,
                                                                tipo: ej.tipo,
                                                                puntos: ej.puntos,
                                                            })
                                                        }
                                                        className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-500 text-center py-2 px-3 text-xs font-bold text-white transition"
                                                    >
                                                        👁️ Revisar y Calificar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleEliminarEjercicio(ej)}
                                                        className="rounded-xl border border-red-500/30 p-2 text-xs text-red-400 hover:bg-red-500/10 transition"
                                                        title="Eliminar ejercicio"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mt-6">
                                {!detalleGrupoProfesor?.estudiantes || detalleGrupoProfesor.estudiantes.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                                        <p className="text-base font-semibold text-white">
                                            No hay estudiantes inscritos aún
                                        </p>
                                        <p className="mt-1 text-sm text-gray-400">
                                            Comparte el código <b className="text-amber-400 font-mono">{codigoGrupo}</b> con tus estudiantes para que se unan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-white/10 bg-[#181818] overflow-hidden">
                                        <table className="w-full text-left text-sm text-gray-300">
                                            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                                                <tr>
                                                    <th className="py-3 px-4">Estudiante</th>
                                                    <th className="py-3 px-4">Código</th>
                                                    <th className="py-3 px-4 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {detalleGrupoProfesor.estudiantes.map((est) => (
                                                    <tr key={est.id} className="hover:bg-white/5">
                                                        <td className="py-3 px-4 font-semibold text-white">
                                                            {est.username}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-xs text-gray-400">
                                                            {est.codigo}
                                                        </td>
                                                        <td className="py-3 px-4 text-right">
                                                            <Link
                                                                to={`/estudiantes/${est.id}`}
                                                                className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                                                            >
                                                                Ver Historial Estudiante →
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* VISTA ESTUDIANTE */}
                {!esProfesorOAdmin && (
                    <div className="mt-8">
                        {/* Pestañas para estudiante */}
                        <div className="flex items-center gap-4 border-b border-white/10 pb-3 mb-6">
                            <button
                                type="button"
                                onClick={() => setTabEstudiante('ejercicios')}
                                className={`text-sm font-bold transition pb-1 border-b-2 ${
                                    tabEstudiante === 'ejercicios'
                                        ? 'border-emerald-500 text-emerald-400'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                Ejercicios Asignados ({ejerciciosEstudiante.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setTabEstudiante('ranking');
                                    void cargarRanking();
                                }}
                                className={`text-sm font-bold transition pb-1 border-b-2 ${
                                    tabEstudiante === 'ranking'
                                        ? 'border-emerald-500 text-emerald-400'
                                        : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                            >
                                🏆 Mejores Notas
                            </button>
                        </div>

                        {cargando ? (
                            <div className="py-12 text-center text-sm text-gray-400">
                                Cargando ejercicios...
                            </div>
                        ) : tabEstudiante === 'ranking' ? (
                            <div className="mt-6">
                                {renderRanking()}
                            </div>
                        ) : ejerciciosEstudiante.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
                                <p className="text-base font-semibold text-white">
                                    Tu profesor aún no ha publicado ejercicios en este grupo.
                                </p>
                                <p className="mt-1 text-sm text-gray-400">
                                    Vuelve a revisar más tarde cuando se publiquen nuevas tareas.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {ejerciciosEstudiante.map((ej) => {
                                    const rutaTablero =
                                        ej.tipo === 'diagrama'
                                            ? `/grupos/${grupoId}/ejercicios/${ej.id}/diagrama`
                                            : `/grupos/${grupoId}/ejercicios/${ej.id}/pseudocodigo`;

                                    return (
                                        <div
                                            key={ej.id}
                                            className={`rounded-2xl border p-5 shadow-lg flex flex-col justify-between transition ${
                                                ej.completado
                                                    ? 'border-emerald-500/30 bg-[#13221b]'
                                                    : 'border-white/10 bg-[#181818] hover:border-sky-500/40'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span
                                                        className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                                                            ej.tipo === 'diagrama'
                                                                ? 'bg-sky-500/20 text-sky-300'
                                                                : 'bg-emerald-500/20 text-emerald-300'
                                                        }`}
                                                    >
                                                        {ej.tipo === 'diagrama' ? '📊 Diagrama' : '💻 Pseudocódigo'}
                                                    </span>
                                                    {ej.completado ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                                                            ✓ Entregado ({ej.puntosObtenidos} / {ej.puntos} pts)
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-amber-400 text-xs">
                                                            {ej.puntos} pts
                                                        </span>
                                                    )}
                                                </div>

                                                <h3 className="mt-3 text-base font-bold text-white line-clamp-1">
                                                    {ej.titulo}
                                                </h3>
                                                <p className="mt-2 text-xs text-gray-400 line-clamp-3">
                                                    {ej.enunciado}
                                                </p>
                                            </div>

                                            <div className="mt-6 border-t border-white/10 pt-4">
                                                <Link
                                                    to={rutaTablero}
                                                    className={`w-full block text-center py-2.5 px-4 rounded-xl text-xs font-bold transition ${
                                                        ej.completado
                                                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                                                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                                                    }`}
                                                >
                                                    {ej.completado ? 'Ver mi entrega / Editar' : '🚀 Resolver Ejercicio'}
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Modal para Crear Ejercicio (Profesor) */}
            {modalCrearAbierto && (
                <CrearEjercicioModal
                    isOpen={modalCrearAbierto}
                    onClose={() => setModalCrearAbierto(false)}
                    grupoId={grupoId}
                    onEjercicioCreado={() => {
                        void cargarDatos();
                    }}
                />
            )}

            {/* Modal para Revisar Entregas (Profesor) */}
            {ejercicioARevisar && (
                <RevisarEntregasModal
                    isOpen={Boolean(ejercicioARevisar)}
                    onClose={() => setEjercicioARevisar(null)}
                    grupoId={grupoId}
                    ejercicioId={ejercicioARevisar.id}
                    tituloEjercicio={ejercicioARevisar.titulo}
                    tipoEjercicio={ejercicioARevisar.tipo}
                    puntosMaximos={ejercicioARevisar.puntos}
                />
            )}
        </AppShell>
    );
};
export default GrupoDetalle;
