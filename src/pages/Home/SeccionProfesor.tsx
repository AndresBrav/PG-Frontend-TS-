import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    crearGrupo,
    eliminarGrupo,
    listarGruposProfesor,
} from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    GrupoCreado,
    GrupoProfesor,
    PerfilUsuario,
} from '../../types/dominio';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
import { formatearFecha, formatearNumero } from '../../utils/fechas';

interface SeccionProfesorProps {
    claveAcceso: string;
    usuario: PerfilUsuario;
}

const SeccionProfesor = ({
    claveAcceso,
    usuario,
}: SeccionProfesorProps) => {
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [grupos, setGrupos] = useState<GrupoProfesor[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [nombre, setNombre] = useState('');
    const [creando, setCreando] = useState(false);
    const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
    const [grupoCreado, setGrupoCreado] = useState<GrupoCreado | null>(null);
    const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null);

    const [eliminandoId, setEliminandoId] = useState<number | null>(null);

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

    const cargarGrupos = useCallback(async () => {
        setCargando(true);
        setError(null);

        try {
            const data = await listarGruposProfesor(claveAcceso);
            setGrupos(data);
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudieron cargar tus grupos',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, manejarErrorSesion]);

    useEffect(() => {
        void cargarGrupos();
    }, [cargarGrupos]);

    const totalEstudiantes = grupos.reduce(
        (total, grupo) => total + grupo.estudiantes,
        0,
    );

    const crear = async (evento: FormEvent<HTMLFormElement>) => {
        evento.preventDefault();

        const nombreLimpio = nombre.trim();

        if (nombreLimpio.length < 2) {
            setErrorFormulario('Escribe un nombre para el grupo');
            return;
        }

        setCreando(true);
        setErrorFormulario(null);
        setGrupoCreado(null);

        try {
            const nuevoGrupo = await crearGrupo(claveAcceso, nombreLimpio);
            setNombre('');
            setGrupoCreado(nuevoGrupo);
            await cargarGrupos();
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setErrorFormulario(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo crear el grupo',
                ),
            );
        } finally {
            setCreando(false);
        }
    };

    const eliminar = async (grupo: GrupoProfesor) => {
        const confirmacion = await Swal.fire({
            title: '¿Eliminar el grupo?',
            text: `Se eliminará ${grupo.nombre} y sus estudiantes dejarán de verlo.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#4b5563',
            background: '#202020',
            color: '#ffffff',
        });

        if (!confirmacion.isConfirmed) return;

        setEliminandoId(grupo.id);

        try {
            await eliminarGrupo(claveAcceso, grupo.id);
            await cargarGrupos();
        } catch (errorDesconocido) {
            if (manejarErrorSesion(errorDesconocido)) return;

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo eliminar el grupo',
                ),
            );
        } finally {
            setEliminandoId(null);
        }
    };

    const copiarCodigo = async (codigo: string) => {
        try {
            await navigator.clipboard.writeText(codigo);
            setCodigoCopiado(codigo);
        } catch {
            setCodigoCopiado(null);
        }
    };

    return (
        <section className="space-y-8">
            <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-br from-sky-400/10 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                    Panel del profesor
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    Hola, {usuario.username}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                    Crea grupos, comparte su código y revisa el avance de tus
                    estudiantes con reportes por fecha.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <TarjetaResumen
                    titulo="Grupos activos"
                    valor={formatearNumero(grupos.length)}
                    detalle="Solo se muestran los tuyos"
                    acento="azul"
                />
                <TarjetaResumen
                    titulo="Estudiantes"
                    valor={formatearNumero(totalEstudiantes)}
                    detalle="Matriculados en tus grupos"
                    acento="verde"
                />
                <TarjetaResumen
                    titulo="Reportes disponibles"
                    valor={formatearNumero(grupos.length)}
                    detalle="Uno por cada grupo"
                    acento="naranja"
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
                <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                    <h2 className="text-xl font-bold text-white">
                        Crear un grupo
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        El sistema generará un código de 6 caracteres para
                        compartirlo con tus estudiantes.
                    </p>

                    <form
                        onSubmit={(evento) => {
                            void crear(evento);
                        }}
                        className="mt-5 space-y-3"
                    >
                        <label
                            htmlFor="nombre-grupo"
                            className="block text-sm font-medium text-gray-200"
                        >
                            Nombre del grupo
                        </label>
                        <input
                            id="nombre-grupo"
                            value={nombre}
                            onChange={(evento) =>
                                setNombre(evento.target.value)
                            }
                            placeholder="Ej. 10-A o Grupo de refuerzo"
                            maxLength={80}
                            className="w-full rounded-xl border border-white/15 bg-[#181818] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-[#FF7C02]"
                        />
                        <button
                            type="submit"
                            disabled={creando}
                            className="w-full rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {creando ? 'Creando grupo...' : 'Crear grupo'}
                        </button>
                    </form>

                    {errorFormulario && (
                        <p className="mt-3 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {errorFormulario}
                        </p>
                    )}

                    {grupoCreado && (
                        <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                            <p className="text-sm font-semibold text-emerald-200">
                                Grupo creado: {grupoCreado.nombre}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#181818] px-3 py-2.5">
                                <span className="font-mono text-lg font-bold tracking-[0.3em] text-[#FF9D3D]">
                                    {grupoCreado.codigo}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        void copiarCodigo(
                                            grupoCreado.codigo,
                                        );
                                    }}
                                    className="rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
                                >
                                    {codigoCopiado === grupoCreado.codigo
                                        ? 'Copiado'
                                        : 'Copiar'}
                                </button>
                            </div>
                            <Link
                                to={`/grupos/${grupoCreado.id}`}
                                className="mt-3 inline-block text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                            >
                                Ver reporte del grupo
                            </Link>
                        </div>
                    )}
                </section>

                <section
                    id="grupos"
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Tus grupos
                            </h2>
                            <p className="mt-1 text-sm text-gray-400">
                                Comparte el código y revisa la evolución.
                            </p>
                        </div>
                        <span className="rounded-full bg-sky-400/15 px-3 py-1 text-xs font-bold text-sky-300">
                            {grupos.length}{' '}
                            {grupos.length === 1 ? 'grupo' : 'grupos'}
                        </span>
                    </div>

                    {cargando ? (
                        <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                            Cargando grupos...
                        </div>
                    ) : error ? (
                        <p className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                            {error}
                        </p>
                    ) : grupos.length === 0 ? (
                        <div className="mt-6 rounded-xl border border-dashed border-white/15 px-4 py-10 text-center">
                            <p className="font-semibold text-white">
                                Aún no tienes grupos
                            </p>
                            <p className="mt-1 text-sm text-gray-400">
                                Crea el primero con el formulario de la
                                izquierda.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-3">
                            {grupos.map((grupo) => (
                                <article
                                    key={grupo.id}
                                    className="rounded-2xl border border-white/10 bg-[#181818] p-4"
                                >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-bold text-white">
                                                {grupo.nombre}
                                            </h3>
                                            <p className="mt-1 text-xs text-gray-400">
                                                Creado el{' '}
                                                {formatearFecha(
                                                    grupo.createdAt,
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void copiarCodigo(
                                                        grupo.codigo,
                                                    );
                                                }}
                                                className="rounded-lg bg-[#FF7C02]/15 px-2.5 py-1.5 font-mono text-xs font-bold tracking-[0.2em] text-[#FF9D3D] transition hover:bg-[#FF7C02]/25"
                                                title="Copiar código del grupo"
                                            >
                                                {codigoCopiado === grupo.codigo
                                                    ? 'Copiado'
                                                    : grupo.codigo}
                                            </button>
                                            <span className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-gray-300">
                                                {grupo.estudiantes}{' '}
                                                {grupo.estudiantes === 1
                                                    ? 'estudiante'
                                                    : 'estudiantes'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center gap-3">
                                        <Link
                                            to={`/grupos/${grupo.id}`}
                                            className="rounded-xl bg-[#FF7C02] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#ff8f2b]"
                                        >
                                            Ver reporte
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                void eliminar(grupo);
                                            }}
                                            disabled={eliminandoId === grupo.id}
                                            className="text-xs font-semibold text-red-300 transition hover:text-red-200 disabled:opacity-50"
                                        >
                                            {eliminandoId === grupo.id
                                                ? 'Eliminando...'
                                                : 'Eliminar grupo'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </section>
    );
};

export default SeccionProfesor;
