import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import EtiquetaRol from '../../components/ui/EtiquetaRol';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { obtenerReporteEstudiante } from '../../api/reportesApi';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { ReporteEstudiante } from '../../types/dominio';
import {
    formatearFecha,
    formatearFechaHora,
    formatearNumero,
    formatearPorcentaje,
} from '../../utils/fechas';

const DetalleEstudiante = () => {
    const { id } = useParams<{ id: string }>();
    const estudianteId = Number(id);
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();

    const [reporte, setReporte] = useState<ReporteEstudiante | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const cargarReporte = useCallback(async () => {
        if (!claveAcceso || !usuario) return;

        if (!Number.isInteger(estudianteId) || estudianteId <= 0) {
            setError('El identificador del estudiante no es válido');
            setCargando(false);
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const data = await obtenerReporteEstudiante(
                claveAcceso,
                estudianteId,
                usuario.rol,
            );
            setReporte(data);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo generar el reporte del estudiante',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, usuario, estudianteId, manejarErrorSesion]);

    useEffect(() => {
        void cargarReporte();
    }, [cargarReporte]);

    const enlaceVolver =
        usuario?.rol === 'admin'
            ? '/admin?tab=estudiantes'
            : '/dashboard';

    const actividad = reporte?.actividadPorDia.slice(-14) ?? [];
    const maxPuntos = Math.max(
        1,
        ...actividad.map((dia) => dia.puntos),
    );

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-sm font-semibold text-gray-400 transition hover:text-white"
                    >
                        ← Volver
                    </button>
                    <Link
                        to={enlaceVolver}
                        className="text-sm font-semibold text-[#FF9D3D] transition hover:text-[#FFB870]"
                    >
                        Ir al panel
                    </Link>
                </div>

                {cargando ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                        Generando reporte...
                    </div>
                ) : error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : reporte ? (
                    <>
                        <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/10 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                                Reporte de estudiante
                            </p>
                            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                                        {reporte.usuario.username}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-300">
                                        <span className="font-mono">
                                            Código: {reporte.usuario.codigo}
                                        </span>
                                        <span>·</span>
                                        <span>{reporte.usuario.edad} años</span>
                                        <EtiquetaRol
                                            rol={reporte.usuario.rol}
                                        />
                                    </div>
                                </div>
                                <Link
                                    to="/ejercicios"
                                    className="rounded-xl border border-white/15 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                                >
                                    Ver ejercicios
                                </Link>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <TarjetaResumen
                                titulo="Puntos"
                                valor={formatearNumero(
                                    reporte.resumen.puntos,
                                )}
                                detalle="Fijos y con IA"
                                acento="naranja"
                            />
                            <TarjetaResumen
                                titulo="Progreso"
                                valor={formatearPorcentaje(
                                    reporte.resumen.progreso,
                                )}
                                detalle="Sobre ejercicios disponibles"
                                acento="verde"
                            />
                            <TarjetaResumen
                                titulo="Ejercicios fijos"
                                valor={`${reporte.resumen.fijosCompletados}/${reporte.resumen.fijosTotales}`}
                                detalle="Diagramas y pseudocódigo"
                                acento="azul"
                            />
                            <TarjetaResumen
                                titulo="Ejercicios con IA"
                                valor={`${reporte.resumen.iaCompletados}/${reporte.resumen.iaGenerados}`}
                                detalle="Generados por el estudiante"
                                acento="blanco"
                            />
                        </div>

                        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Actividad por día
                                </h2>
                                <p className="mt-1 text-sm text-gray-400">
                                    Puntos obtenidos en los últimos días con
                                    actividad.
                                </p>
                            </div>

                            {actividad.length === 0 ? (
                                <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    Todavía no hay actividad registrada.
                                </p>
                            ) : (
                                <div
                                    className="mt-6 flex h-48 items-end gap-2 overflow-x-auto pb-2"
                                    style={{ scrollbarWidth: 'thin' }}
                                >
                                    {actividad.map((dia) => (
                                        <div
                                            key={dia.fecha}
                                            className="flex min-w-[46px] flex-1 flex-col items-center justify-end gap-1.5"
                                            title={`${formatearFecha(dia.fecha)}: ${dia.completados} ejercicios, ${dia.puntos} puntos`}
                                        >
                                            <span className="text-[10px] font-bold text-[#FF9D3D]">
                                                {dia.puntos}
                                            </span>
                                            <div
                                                className="w-full rounded-t-lg bg-gradient-to-t from-[#FF7C02] to-[#FFB870]"
                                                style={{
                                                    height: `${Math.max(
                                                        6,
                                                        Math.round(
                                                            (dia.puntos /
                                                                maxPuntos) *
                                                                120,
                                                        ),
                                                    )}px`,
                                                }}
                                            />
                                            <span className="text-[10px] text-gray-400">
                                                {dia.fecha.slice(5)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Ejercicios fijos
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Diagramas y pseudocódigo con su fecha de
                                        finalización.
                                    </p>
                                </div>
                                <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-bold text-sky-300">
                                    {reporte.resumen.fijosCompletados}/
                                    {reporte.resumen.fijosTotales}
                                </span>
                            </div>

                            <div className="mt-5 hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                                    <thead>
                                        <tr className="text-xs uppercase tracking-wider text-gray-400">
                                            <th className="px-3 py-2">
                                                Ejercicio
                                            </th>
                                            <th className="px-3 py-2">
                                                Nivel
                                            </th>
                                            <th className="px-3 py-2">
                                                Estado
                                            </th>
                                            <th className="px-3 py-2">
                                                Puntos
                                            </th>
                                            <th className="px-3 py-2">
                                                Intentos
                                            </th>
                                            <th className="px-3 py-2">
                                                Fecha de finalización
                                            </th>
                                            <th className="px-3 py-2">
                                                Última actividad
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reporte.ejercicios.map(
                                            (ejercicio) => (
                                                <tr
                                                    key={ejercicio.juego_id}
                                                    className="bg-[#181818]"
                                                >
                                                    <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                                        {ejercicio.nombre}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-300">
                                                        {ejercicio.nivel}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-bold ${
                                                                ejercicio.completado
                                                                    ? 'bg-emerald-400/15 text-emerald-300'
                                                                    : 'bg-white/10 text-gray-400'
                                                            }`}
                                                        >
                                                            {ejercicio.completado
                                                                ? 'Completado'
                                                                : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 font-bold text-[#FF7C02]">
                                                        {ejercicio.puntos}
                                                    </td>
                                                    <td className="px-3 py-3 text-gray-300">
                                                        {ejercicio.intentos}
                                                    </td>
                                                    <td className="px-3 py-3 text-xs text-gray-400">
                                                        {formatearFechaHora(
                                                            ejercicio.fecha_completado,
                                                            'Sin completar',
                                                        )}
                                                    </td>
                                                    <td className="rounded-r-xl px-3 py-3 text-xs text-gray-400">
                                                        {formatearFechaHora(
                                                            ejercicio.ultima_actividad,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-5 grid gap-3 lg:hidden">
                                {reporte.ejercicios.map((ejercicio) => (
                                    <article
                                        key={ejercicio.juego_id}
                                        className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h3 className="font-bold text-white">
                                                    {ejercicio.nombre}
                                                </h3>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Nivel {ejercicio.nivel} ·{' '}
                                                    {ejercicio.intentos}{' '}
                                                    intentos
                                                </p>
                                            </div>
                                            <span
                                                className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                                                    ejercicio.completado
                                                        ? 'bg-emerald-400/15 text-emerald-300'
                                                        : 'bg-white/10 text-gray-400'
                                                }`}
                                            >
                                                {ejercicio.completado
                                                    ? 'Completado'
                                                    : 'Pendiente'}
                                            </span>
                                        </div>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                                            <span className="rounded-lg bg-white/5 px-2 py-1">
                                                {ejercicio.puntos} pts
                                            </span>
                                            <span className="rounded-lg bg-white/5 px-2 py-1">
                                                Finalizado:{' '}
                                                {formatearFechaHora(
                                                    ejercicio.fecha_completado,
                                                    'Sin completar',
                                                )}
                                            </span>
                                            <span className="rounded-lg bg-white/5 px-2 py-1">
                                                Última actividad:{' '}
                                                {formatearFechaHora(
                                                    ejercicio.ultima_actividad,
                                                )}
                                            </span>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Ejercicios con IA
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Retos generados y su fecha de
                                        finalización.
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#FF7C02]/15 px-3 py-1 text-xs font-bold text-[#FF9D3D]">
                                    {reporte.resumen.iaCompletados}/
                                    {reporte.resumen.iaGenerados}
                                </span>
                            </div>

                            {reporte.ia.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    El estudiante todavía no ha generado
                                    ejercicios con IA.
                                </p>
                            ) : (
                                <div className="mt-5 grid gap-3 md:grid-cols-2">
                                    {reporte.ia.map((juego) => (
                                        <article
                                            key={juego.id}
                                            className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <p className="line-clamp-3 text-sm text-gray-200">
                                                    {juego.descripcion}
                                                </p>
                                                <span
                                                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                                                        juego.completado
                                                            ? 'bg-emerald-400/15 text-emerald-300'
                                                            : 'bg-white/10 text-gray-400'
                                                    }`}
                                                >
                                                    {juego.completado
                                                        ? 'Completado'
                                                        : 'Pendiente'}
                                                </span>
                                            </div>
                                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                                    {juego.tipo}
                                                </span>
                                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                                    {juego.puntos} pts
                                                </span>
                                                <span className="rounded-lg bg-white/5 px-2 py-1">
                                                    {formatearFechaHora(
                                                        juego.fecha_completado,
                                                        'Sin completar',
                                                    )}
                                                </span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                ) : null}
            </main>
        </AppShell>
    );
};

export default DetalleEstudiante;
