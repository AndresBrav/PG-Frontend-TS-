import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    listarMisGrupos,
    salirDeGrupo,
    unirseAGrupo,
} from '../../api/gruposApi';
import { obtenerMiProgreso } from '../../api/reportesApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    GrupoEstudiante,
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

    const [grupos, setGrupos] = useState<GrupoEstudiante[]>([]);
    const [progreso, setProgreso] = useState<ReporteEstudiante | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [codigo, setCodigo] = useState('');
    const [uniendo, setUniendo] = useState(false);
    const [mensajeGrupo, setMensajeGrupo] = useState<string | null>(null);
    const [errorGrupo, setErrorGrupo] = useState<string | null>(null);
    const [grupoEnProceso, setGrupoEnProceso] = useState<number | null>(null);

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
            const [misGrupos, miProgreso] = await Promise.all([
                listarMisGrupos(claveAcceso),
                obtenerMiProgreso(claveAcceso),
            ]);

            setGrupos(misGrupos);
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

    const unirse = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        const codigoLimpio = codigo.trim().toUpperCase();

        if (!/^[A-Z0-9]{6}$/.test(codigoLimpio)) {
            setErrorGrupo('El código debe tener 6 caracteres');
            return;
        }

        setUniendo(true);
        setErrorGrupo(null);
        setMensajeGrupo(null);

        try {
            const grupo = await unirseAGrupo(claveAcceso, codigoLimpio);
            setCodigo('');
            setMensajeGrupo(`Te uniste al grupo ${grupo.nombre}`);
            await cargarDatos();
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setErrorGrupo(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo unir al grupo',
                ),
            );
        } finally {
            setUniendo(false);
        }
    };

    const abandonarGrupo = async (grupo: GrupoEstudiante) => {
        const confirmacion = await Swal.fire({
            title: '¿Salir del grupo?',
            text: `Dejarás de pertenecer a ${grupo.nombre}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Salir',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#FF7C02',
            cancelButtonColor: '#4b5563',
            background: '#202020',
            color: '#ffffff',
        });

        if (!confirmacion.isConfirmed) return;

        setGrupoEnProceso(grupo.id);
        setMensajeGrupo(null);
        setErrorGrupo(null);

        try {
            await salirDeGrupo(claveAcceso, grupo.id);
            await cargarDatos();
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setErrorGrupo(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo salir del grupo',
                ),
            );
        } finally {
            setGrupoEnProceso(null);
        }
    };

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

            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                <section
                    id="mis-grupos"
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Mis grupos
                            </h2>
                            <p className="mt-1 text-sm text-gray-400">
                                Pertenecen a tus profesores y pueden ser varios.
                            </p>
                        </div>
                        <span className="rounded-full bg-[#FF7C02]/15 px-3 py-1 text-xs font-bold text-[#FF9D3D]">
                            {grupos.length}{' '}
                            {grupos.length === 1 ? 'grupo' : 'grupos'}
                        </span>
                    </div>

                    <form
                        onSubmit={(evento) => {
                            void unirse(evento);
                        }}
                        className="mt-5 flex flex-col gap-2 sm:flex-row"
                    >
                        <input
                            value={codigo}
                            onChange={(evento) =>
                                setCodigo(evento.target.value.toUpperCase())
                            }
                            placeholder="Código del grupo"
                            maxLength={6}
                            autoComplete="off"
                            className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm uppercase tracking-[0.2em] text-white outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-gray-500 focus:border-[#FF7C02]"
                        />
                        <button
                            type="submit"
                            disabled={uniendo}
                            className="rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {uniendo ? 'Uniéndome...' : 'Unirme'}
                        </button>
                    </form>

                    {mensajeGrupo && (
                        <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                            {mensajeGrupo}
                        </p>
                    )}
                    {errorGrupo && (
                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {errorGrupo}
                        </p>
                    )}

                    {cargando ? (
                        <div className="mt-5 flex items-center gap-2 text-sm text-gray-400">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                            Cargando grupos...
                        </div>
                    ) : error ? (
                        <p className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {error}
                        </p>
                    ) : grupos.length === 0 ? (
                        <div className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center">
                            <p className="font-semibold text-white">
                                Todavía no perteneces a ningún grupo
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                Pide a tu profesor el código de 6 caracteres y
                                úsalo arriba.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 grid gap-3 sm:grid-cols-2">
                            {grupos.map((grupo) => (
                                <article
                                    key={grupo.id}
                                    className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="truncate font-bold text-white">
                                                {grupo.nombre}
                                            </h3>
                                            <p className="mt-1 truncate text-xs text-gray-400">
                                                Profesor:{' '}
                                                {grupo.profesor?.username ??
                                                    'Sin asignar'}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-lg bg-[#FF7C02]/15 px-2 py-1 font-mono text-xs font-bold tracking-wider text-[#FF9D3D]">
                                            {grupo.codigo}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            void abandonarGrupo(grupo);
                                        }}
                                        disabled={grupoEnProceso === grupo.id}
                                        className="mt-4 text-xs font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                                    >
                                        {grupoEnProceso === grupo.id
                                            ? 'Saliendo...'
                                            : 'Salir del grupo'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="space-y-6">
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
                </aside>
            </div>
        </section>
    );
};

export default SeccionEstudiante;
