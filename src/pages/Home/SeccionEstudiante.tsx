import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { obtenerMiProgreso } from '../../api/reportesApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    PerfilUsuario,
    ReporteEstudiante,
} from '../../types/dominio';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import BarraProgreso from '../../components/ui/BarraProgreso';
import {
    formatearFecha,
    formatearNumero,
    formatearPorcentaje,
} from '../../utils/fechas';

interface SeccionEstudianteProps {
    claveAcceso: string;
    usuario: PerfilUsuario;
}

const SeccionEstudiante = ({
    claveAcceso,
    usuario,
}: SeccionEstudianteProps) => {
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [progreso, setProgreso] = useState<ReporteEstudiante | null>(null);
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
            const miProgreso = await obtenerMiProgreso(claveAcceso);
            setProgreso(miProgreso);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo cargar tu información',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, manejarErrorSesion]);

    useEffect(() => {
        void cargarDatos();
    }, [cargarDatos]);

    const resumen = progreso?.resumen;

    return (
        <section className="space-y-8">
            <div className="rounded-3xl border border-[#FF7C02]/20 bg-gradient-to-br from-[#FF7C02]/15 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF7C02]">
                    Panel del estudiante
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Hola, {usuario.username}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                    Sigue practicando lógica de programación. Únete a los
                    grupos de tus profesores para que puedan acompañar tu
                    progreso.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <Link
                        to="/ejercicios"
                        className="rounded-xl bg-[#FF7C02] px-4 py-2.5 text-center text-sm font-bold text-black transition hover:bg-[#ff8f2b]"
                    >
                        Continuar ejercicios
                    </Link>
                    <Link
                        to="/ejercicios-ia"
                        className="rounded-xl border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Ejercicios con IA
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <TarjetaResumen
                    titulo="Puntos acumulados"
                    valor={formatearNumero(usuario.puntos)}
                    detalle="Ejercicios fijos y con IA"
                    acento="naranja"
                />
                <TarjetaResumen
                    titulo="Progreso total"
                    valor={formatearPorcentaje(resumen?.progreso ?? 0)}
                    detalle="Según tus ejercicios disponibles"
                    acento="verde"
                />
                <TarjetaResumen
                    titulo="Ejercicios fijos"
                    valor={`${resumen?.fijosCompletados ?? 0}/${resumen?.fijosTotales ?? 0}`}
                    detalle="Diagramas y pseudocódigo"
                    acento="azul"
                />
                <TarjetaResumen
                    titulo="Ejercicios con IA"
                    valor={`${resumen?.iaCompletados ?? 0}/${resumen?.iaGenerados ?? 0}`}
                    detalle="Retos generados para ti"
                    acento="blanco"
                />
            </div>

            <aside className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                ¿Dónde está "Mis grupos"?
                            </h2>
                            <p className="mt-1 max-w-xl text-sm text-gray-400">
                                Gestiona los grupos a los que perteneces desde
                                la sección{' '}
                                <Link
                                    to="/grupos"
                                    className="font-bold text-[#FF9D3D] hover:underline"
                                >
                                    Grupos
                                </Link>{' '}
                                del menú superior: únete con el código de tu
                                profesor y revisa tus ejercicios asignados.
                            </p>
                        </div>
                        {cargando ? (
                            <span className="text-xs text-gray-400">
                                Cargando resumen...
                            </span>
                        ) : null}
                    </div>
                    {error && (
                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {error}
                        </p>
                    )}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                        <h2 className="text-lg font-bold text-white">
                            Mi progreso
                        </h2>
                        <div className="mt-4">
                            <BarraProgreso
                                valor={resumen?.progreso ?? 0}
                                etiqueta="Progreso total"
                                color="#22C55E"
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                            <div className="rounded-xl bg-[#181818] p-3">
                                <p className="text-xs text-gray-400">Fijos</p>
                                <p className="mt-1 text-lg font-bold text-sky-400">
                                    {resumen?.fijosCompletados ?? 0}
                                </p>
                            </div>
                            <div className="rounded-xl bg-[#181818] p-3">
                                <p className="text-xs text-gray-400">Con IA</p>
                                <p className="mt-1 text-lg font-bold text-[#FF7C02]">
                                    {resumen?.iaCompletados ?? 0}
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-bold text-white">
                                Actividad reciente
                            </h2>
                            <span className="text-xs text-gray-400">
                                Últimos días
                            </span>
                        </div>
                        <div className="mt-4 space-y-2">
                            {progreso?.actividadPorDia.length ? (
                                [...progreso.actividadPorDia]
                                    .slice(-5)
                                    .reverse()
                                    .map((dia) => (
                                        <div
                                            key={dia.fecha}
                                            className="flex items-center justify-between rounded-xl bg-[#181818] px-3 py-2.5"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {formatearFecha(dia.fecha)}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {dia.completados}{' '}
                                                    {dia.completados === 1
                                                        ? 'ejercicio'
                                                        : 'ejercicios'}
                                                </p>
                                            </div>
                                            <span className="text-sm font-bold text-[#FF7C02]">
                                                +{dia.puntos} pts
                                            </span>
                                        </div>
                                    ))
                            ) : (
                                <p className="rounded-xl border border-dashed border-white/15 px-3 py-6 text-center text-sm text-gray-400">
                                    Aún no registras actividad. ¡Resuelve tu
                                    primer ejercicio!
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            </aside>
        </section>
    );
};

export default SeccionEstudiante;
