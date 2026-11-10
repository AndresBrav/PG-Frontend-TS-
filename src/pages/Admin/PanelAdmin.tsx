import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import {
    listarEstudiantesAdmin,
    obtenerEstadisticasAdmin,
} from '../../api/adminApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    EstadisticasAdmin,
    EstudianteAdmin,
} from '../../types/dominio';
import { formatearFechaHora, formatearNumero } from '../../utils/fechas';

type TabAdmin = 'resumen' | 'estudiantes';

const TABS: { id: TabAdmin; nombre: string }[] = [
    { id: 'resumen', nombre: 'Resumen' },
    { id: 'estudiantes', nombre: 'Estudiantes' },
];

const PanelAdmin = () => {
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();
    const [searchParams, setSearchParams] = useSearchParams();

    const tabParam = searchParams.get('tab');
    const tab: TabAdmin = TABS.some((item) => item.id === tabParam)
        ? (tabParam as TabAdmin)
        : 'resumen';

    const [estadisticas, setEstadisticas] =
        useState<EstadisticasAdmin | null>(null);
    const [estudiantes, setEstudiantes] = useState<EstudianteAdmin[]>([]);
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

    const cargarTodo = useCallback(async () => {
        if (!claveAcceso) return;

        setCargando(true);
        setError(null);

        try {
            const [datosEstadisticas, datosEstudiantes] = await Promise.all([
                obtenerEstadisticasAdmin(claveAcceso),
                listarEstudiantesAdmin(claveAcceso),
            ]);

            setEstadisticas(datosEstadisticas);
            setEstudiantes(datosEstudiantes);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo cargar el panel administrativo',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, manejarErrorSesion]);

    useEffect(() => {
        void cargarTodo();
    }, [cargarTodo]);

    const cambiarTab = (nuevoTab: TabAdmin) => {
        setSearchParams({ tab: nuevoTab }, { replace: true });
    };

    if (!usuario || usuario.rol !== 'admin') return null;

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-400/10 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                        Administración
                    </p>
                    <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Panel administrativo
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                        Revisa la información global de la plataforma y consulta
                        el avance de los estudiantes.
                    </p>
                </div>

                <nav
                    className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-2"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {TABS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => cambiarTab(item.id)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                tab === item.id
                                    ? 'bg-[#FF7C02] text-black'
                                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            {item.nombre}
                        </button>
                    ))}
                </nav>

                {cargando ? (
                    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                        Cargando información...
                    </div>
                ) : error ? (
                    <p className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : (
                    <div className="mt-6">
                        {tab === 'resumen' && (
                            <TabResumen estadisticas={estadisticas} />
                        )}

                        {tab === 'estudiantes' && (
                            <TablaEstudiantes estudiantes={estudiantes} />
                        )}
                    </div>
                )}
            </main>
        </AppShell>
    );
};

const TabResumen = ({
    estadisticas,
}: {
    estadisticas: EstadisticasAdmin | null;
}) => {
    if (!estadisticas) {
        return (
            <p className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                No hay estadísticas disponibles.
            </p>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TarjetaResumen
                    titulo="Estudiantes"
                    valor={formatearNumero(estadisticas.usuarios.estudiantes)}
                    detalle="Cuentas registradas"
                    acento="azul"
                />
                <TarjetaResumen
                    titulo="Ejercicios completados"
                    valor={formatearNumero(
                        estadisticas.completados.fijos +
                            estadisticas.completados.ia,
                    )}
                    detalle="Fijos y con IA"
                    acento="verde"
                />
                <TarjetaResumen
                    titulo="Puntos totales"
                    valor={formatearNumero(estadisticas.puntos.total)}
                    detalle="Acumulados en la plataforma"
                    acento="blanco"
                />
                <TarjetaResumen
                    titulo="Última actividad"
                    valor={formatearFechaHora(estadisticas.ultimaActividad)}
                    detalle="Resuelto más reciente"
                    acento="naranja"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <h2 className="text-lg font-bold text-white">
                        Actividad global
                    </h2>
                    <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">
                                Ejercicios fijos completados
                            </dt>
                            <dd className="font-bold text-sky-400">
                                {formatearNumero(
                                    estadisticas.completados.fijos,
                                )}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">
                                Ejercicios con IA completados
                            </dt>
                            <dd className="font-bold text-[#FF7C02]">
                                {formatearNumero(estadisticas.completados.ia)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">Puntos fijos</dt>
                            <dd className="font-bold text-white">
                                {formatearNumero(estadisticas.puntos.fijos)}
                            </dd>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <dt className="text-gray-400">Puntos con IA</dt>
                            <dd className="font-bold text-white">
                                {formatearNumero(estadisticas.puntos.ia)}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <h2 className="text-lg font-bold text-white">
                        Distribución de usuarios
                    </h2>
                    <div className="mt-4 space-y-3">
                        {[
                            {
                                nombre: 'Estudiantes',
                                valor: estadisticas.usuarios.estudiantes,
                                color: 'bg-sky-400',
                            },
                            {
                                nombre: 'Administradores',
                                valor: estadisticas.usuarios.admins,
                                color: 'bg-purple-400',
                            },
                        ].map((item) => {
                            const total =
                                estadisticas.usuarios.estudiantes +
                                estadisticas.usuarios.admins;
                            const porcentaje = total
                                ? Math.round((item.valor / total) * 100)
                                : 0;

                            return (
                                <div key={item.nombre}>
                                    <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                                        <span>{item.nombre}</span>
                                        <span>
                                            {formatearNumero(item.valor)} (
                                            {porcentaje}%)
                                        </span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className={`h-full rounded-full ${item.color}`}
                                            style={{
                                                width: `${porcentaje}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <p className="mt-4 rounded-xl bg-[#181818] px-3 py-2.5 text-xs text-gray-400">
                        Última actividad:{' '}
                        <span className="font-semibold text-gray-200">
                            {formatearFechaHora(estadisticas.ultimaActividad)}
                        </span>
                    </p>
                </section>
            </div>
        </div>
    );
};

const TablaEstudiantes = ({
    estudiantes,
}: {
    estudiantes: EstudianteAdmin[];
}) => (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
                <h2 className="text-xl font-bold text-white">Estudiantes</h2>
                <p className="mt-1 text-sm text-gray-400">
                    Puntos y ejercicios completados por estudiante.
                </p>
            </div>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
                {estudiantes.length}
            </span>
        </div>

        {estudiantes.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                Todavía no hay estudiantes registrados.
            </p>
        ) : (
            <>
                <div className="mt-5 hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[560px] border-separate border-spacing-y-2 text-left text-sm">
                        <thead>
                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                <th className="px-3 py-2">Estudiante</th>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">Edad</th>
                                <th className="px-3 py-2">Puntos</th>
                                <th className="px-3 py-2">Completados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantes.map((estudiante) => (
                                <tr
                                    key={estudiante.id}
                                    className="bg-[#181818]"
                                >
                                    <td className="rounded-l-xl px-3 py-3 font-semibold text-white">
                                        {estudiante.username}
                                    </td>
                                    <td className="px-3 py-3 font-mono text-xs text-gray-300">
                                        {estudiante.codigo}
                                    </td>
                                    <td className="px-3 py-3 text-gray-300">
                                        {estudiante.edad}
                                    </td>
                                    <td className="px-3 py-3 font-bold text-[#FF7C02]">
                                        {formatearNumero(estudiante.puntos)}
                                    </td>
                                    <td className="rounded-r-xl px-3 py-3 text-emerald-300">
                                        {estudiante.completados}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-5 grid gap-3 lg:hidden">
                    {estudiantes.map((estudiante) => (
                        <article
                            key={estudiante.id}
                            className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="font-bold text-white">
                                        {estudiante.username}
                                    </h3>
                                    <p className="mt-1 font-mono text-xs text-gray-400">
                                        {estudiante.codigo}
                                    </p>
                                </div>
                                <span className="text-sm font-bold text-[#FF7C02]">
                                    {formatearNumero(estudiante.puntos)} pts
                                </span>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-gray-400">
                                    {estudiante.edad} años
                                </span>
                                <span className="rounded-lg bg-white/5 px-2 py-1 text-emerald-300">
                                    {estudiante.completados} completados
                                </span>
                            </div>
                        </article>
                    ))}
                </div>
            </>
        )}
    </section>
);

export default PanelAdmin;
