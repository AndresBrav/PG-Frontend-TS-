import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerEstadisticasAdmin } from '../../api/adminApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    EstadisticasAdmin,
    PerfilUsuario,
} from '../../types/dominio';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { formatearFechaHora, formatearNumero } from '../../utils/fechas';

interface SeccionAdminProps {
    claveAcceso: string;
    usuario: PerfilUsuario;
}

const SeccionAdmin = ({ claveAcceso, usuario }: SeccionAdminProps) => {
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [estadisticas, setEstadisticas] =
        useState<EstadisticasAdmin | null>(null);
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

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setError(null);

        try {
            const datos = await obtenerEstadisticasAdmin(claveAcceso);
            setEstadisticas(datos);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudieron cargar las estadísticas',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, manejarErrorSesion]);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    return (
        <section className="space-y-8">
            <div className="rounded-3xl border border-purple-400/20 bg-gradient-to-br from-purple-400/10 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                    Panel del administrador
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Hola, {usuario.username}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                    Revisa el estado general de la plataforma, administra
                    usuarios y consulta las estadísticas de uso.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/admin"
                        className="rounded-xl bg-[#FF7C02] px-4 py-2.5 text-center text-sm font-bold text-black transition hover:bg-[#ff8f2b]"
                    >
                        Abrir panel administrativo
                    </Link>
                </div>
            </div>

            {cargando ? (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                    Cargando estadísticas...
                </div>
            ) : error ? (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                    {error}
                </p>
            ) : estadisticas ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <TarjetaResumen
                            titulo="Estudiantes"
                            valor={formatearNumero(
                                estadisticas.usuarios.estudiantes,
                            )}
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
                            valor={formatearFechaHora(
                                estadisticas.ultimaActividad,
                            )}
                            detalle="Resuelto más reciente"
                            acento="naranja"
                        />
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                            <h2 className="text-xl font-bold text-white">
                                Resumen de actividad
                            </h2>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-400">
                                        Completados fijos
                                    </dt>
                                    <dd className="font-bold text-sky-400">
                                        {formatearNumero(
                                            estadisticas.completados.fijos,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-400">
                                        Completados con IA
                                    </dt>
                                    <dd className="font-bold text-[#FF7C02]">
                                        {formatearNumero(
                                            estadisticas.completados.ia,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-400">
                                        Puntos fijos
                                    </dt>
                                    <dd className="font-bold text-white">
                                        {formatearNumero(
                                            estadisticas.puntos.fijos,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-gray-400">
                                        Puntos con IA
                                    </dt>
                                    <dd className="font-bold text-white">
                                        {formatearNumero(
                                            estadisticas.puntos.ia,
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </section>

                        <aside className="w-full sm:w-64">
                            <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                                <h2 className="text-lg font-bold text-white">
                                    Accesos rápidos
                                </h2>
                                <div className="mt-4 grid gap-2">
                                    <Link
                                        to="/admin?tab=estudiantes"
                                        className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#FF7C02]/40 hover:text-white"
                                    >
                                        Ver estudiantes
                                    </Link>
                                    <Link
                                        to="/admin?tab=resumen"
                                        className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2.5 text-sm font-semibold text-gray-200 transition hover:border-[#FF7C02]/40 hover:text-white"
                                    >
                                        Resumen de la plataforma
                                    </Link>
                                </div>
                            </section>
                        </aside>
                    </div>
                </>
            ) : null}
        </section>
    );
};

export default SeccionAdmin;
