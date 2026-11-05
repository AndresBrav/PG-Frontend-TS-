import {
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { obtenerReporteGrupo } from '../../api/reportesApi';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { ReporteGrupo } from '../../types/dominio';
import {
    formatearNumero,
    formatearPorcentaje,
    rangoUltimosDias,
} from '../../utils/fechas';
import EvolucionChart from './componentes/EvolucionChart';

const DetalleGrupo = () => {
    const { id } = useParams<{ id: string }>();
    const grupoId = Number(id);
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();

    const rangoInicial = rangoUltimosDias(30);
    const [desde, setDesde] = useState(rangoInicial.desde);
    const [hasta, setHasta] = useState(rangoInicial.hasta);
    const [filtros, setFiltros] = useState(rangoInicial);
    const [errorFiltro, setErrorFiltro] = useState<string | null>(null);

    const [reporte, setReporte] = useState<ReporteGrupo | null>(null);
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

        if (!Number.isInteger(grupoId) || grupoId <= 0) {
            setError('El identificador del grupo no es válido');
            setCargando(false);
            return;
        }

        setCargando(true);
        setError(null);

        try {
            const data = await obtenerReporteGrupo(
                claveAcceso,
                grupoId,
                usuario.rol,
                filtros.desde,
                filtros.hasta,
            );

            setReporte(data);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo generar el reporte del grupo',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [
        claveAcceso,
        usuario,
        grupoId,
        filtros,
        manejarErrorSesion,
    ]);

    useEffect(() => {
        void cargarReporte();
    }, [cargarReporte]);

    const aplicarFiltros = (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        if (!desde || !hasta) {
            setErrorFiltro('Selecciona las fechas desde y hasta');
            return;
        }

        if (desde > hasta) {
            setErrorFiltro('La fecha desde no puede ser mayor que la hasta');
            return;
        }

        setErrorFiltro(null);
        setFiltros({ desde, hasta });
    };

    const aplicarRangoRapido = (dias: number) => {
        const rango = rangoUltimosDias(dias);
        setDesde(rango.desde);
        setHasta(rango.hasta);
        setErrorFiltro(null);
        setFiltros(rango);
    };

    const enlaceVolver = usuario?.rol === 'admin' ? '/admin' : '/dashboard';

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                <div className="mb-5">
                    <Link
                        to={enlaceVolver}
                        className="text-sm font-semibold text-gray-400 transition hover:text-white"
                    >
                        ← Volver al panel
                    </Link>
                </div>

                <div className="rounded-3xl border border-[#FF7C02]/20 bg-gradient-to-br from-[#FF7C02]/15 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF7C02]">
                        Reporte de grupo
                    </p>
                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                                {reporte?.grupo.nombre ?? 'Cargando grupo...'}
                            </h1>
                            {reporte && (
                                <p className="mt-2 text-sm text-gray-300">
                                    Código:{' '}
                                    <span className="font-mono font-bold tracking-widest text-[#FF9D3D]">
                                        {reporte.grupo.codigo}
                                    </span>
                                </p>
                            )}
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-300">
                            {reporte?.rango.desde && reporte?.rango.hasta
                                ? `${reporte.rango.desde} → ${reporte.rango.hasta}`
                                : 'Rango de fechas'}
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={aplicarFiltros}
                    className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6"
                >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="flex-1">
                            <label
                                htmlFor="grupo-desde"
                                className="mb-1.5 block text-sm font-medium text-gray-200"
                            >
                                Desde
                            </label>
                            <input
                                id="grupo-desde"
                                type="date"
                                value={desde}
                                onChange={(evento) =>
                                    setDesde(evento.target.value)
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm text-white outline-none transition [color-scheme:dark] focus:border-[#FF7C02]"
                            />
                        </div>
                        <div className="flex-1">
                            <label
                                htmlFor="grupo-hasta"
                                className="mb-1.5 block text-sm font-medium text-gray-200"
                            >
                                Hasta
                            </label>
                            <input
                                id="grupo-hasta"
                                type="date"
                                value={hasta}
                                onChange={(evento) =>
                                    setHasta(evento.target.value)
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm text-white outline-none transition [color-scheme:dark] focus:border-[#FF7C02]"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b]"
                        >
                            Aplicar filtros
                        </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {[7, 30, 90].map((dias) => (
                            <button
                                key={dias}
                                type="button"
                                onClick={() => aplicarRangoRapido(dias)}
                                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white"
                            >
                                Últimos {dias} días
                            </button>
                        ))}
                    </div>

                    {errorFiltro && (
                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {errorFiltro}
                        </p>
                    )}
                </form>

                {cargando ? (
                    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                        Generando reporte...
                    </div>
                ) : error ? (
                    <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : reporte ? (
                    <>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <TarjetaResumen
                                titulo="Estudiantes"
                                valor={formatearNumero(
                                    reporte.resumen.estudiantes,
                                )}
                                detalle="En este grupo"
                                acento="azul"
                            />
                            <TarjetaResumen
                                titulo="Promedio de puntos"
                                valor={formatearNumero(
                                    reporte.resumen.promedioPuntos,
                                )}
                                detalle="Por estudiante"
                                acento="naranja"
                            />
                            <TarjetaResumen
                                titulo="Progreso promedio"
                                valor={formatearPorcentaje(
                                    reporte.resumen.promedioProgreso,
                                )}
                                detalle="Sobre ejercicios disponibles"
                                acento="verde"
                            />
                            <TarjetaResumen
                                titulo="Completados en el rango"
                                valor={formatearNumero(
                                    reporte.resumen.completadosEnRango,
                                )}
                                detalle="Ejercicios de grupo"
                                acento="blanco"
                            />
                        </div>

                        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Evolución del grupo
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Ejercicios acumulados por día en el
                                        rango seleccionado.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5">
                                <EvolucionChart
                                    fechas={reporte.evolucion.fechas}
                                    series={reporte.evolucion.series}
                                />
                            </div>
                        </section>

                        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Estudiantes
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Abre el detalle para revisar los
                                        ejercicios de grupo del estudiante.
                                    </p>
                                </div>
                                <span className="rounded-full bg-[#FF7C02]/15 px-3 py-1 text-xs font-bold text-[#FF9D3D]">
                                    {reporte.estudiantes.length}
                                </span>
                            </div>

                            {reporte.estudiantes.length === 0 ? (
                                <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-10 text-center text-sm text-gray-400">
                                    Este grupo todavía no tiene estudiantes.
                                    Comparte el código{' '}
                                    <span className="font-mono font-bold text-[#FF9D3D]">
                                        {reporte.grupo.codigo}
                                    </span>
                                    .
                                </p>
                            ) : (
                                <>
                                    <div className="mt-5 hidden overflow-x-auto lg:block">
                                        <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left text-sm">
                                            <thead>
                                                <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                    <th className="px-3 py-2">
                                                        Estudiante
                                                    </th>
                                                    <th className="px-3 py-2">
                                                        Código
                                                    </th>
                                                    <th className="px-3 py-2" />
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reporte.estudiantes.map(
                                                    (estudiante) => (
                                                        <tr
                                                            key={estudiante.id}
                                                            className="bg-[#181818]"
                                                        >
                                                            <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                                                {
                                                                    estudiante.username
                                                                }
                                                            </td>
                                                            <td className="px-3 py-3 font-mono text-xs text-gray-300">
                                                                {
                                                                    estudiante.codigo
                                                                }
                                                            </td>
                                                            <td className="rounded-r-xl px-3 py-3 text-right">
                                                                <Link
                                                                    to={`/estudiantes/${estudiante.id}`}
                                                                    className="rounded-lg bg-[#FF7C02] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                                                                >
                                                                    Ver detalle
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-5 grid gap-3 lg:hidden">
                                        {reporte.estudiantes.map(
                                            (estudiante) => (
                                                <article
                                                    key={estudiante.id}
                                                    className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <h3 className="truncate font-bold text-white">
                                                                {
                                                                    estudiante.username
                                                                }
                                                            </h3>
                                                            <p className="mt-1 font-mono text-xs text-gray-400">
                                                                {
                                                                    estudiante.codigo
                                                                }
                                                            </p>
                                                        </div>
                                                        <Link
                                                            to={`/estudiantes/${estudiante.id}`}
                                                            className="shrink-0 rounded-xl bg-[#FF7C02] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                                                        >
                                                            Ver detalle
                                                        </Link>
                                                    </div>
                                                </article>
                                            ),
                                        )}
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                ) : null}
            </main>
        </AppShell>
    );
};

export default DetalleGrupo;
