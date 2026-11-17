import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listarMisGruposProfesor } from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { GrupoProfesor, PerfilUsuario } from '../../types/dominio';
import { formatearNumero } from '../../utils/fechas';

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

    const cargarGrupos = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setGrupos(await listarMisGruposProfesor(claveAcceso));
        } catch (errorDesconocido) {
            if (esErrorDeSesion(errorDesconocido)) {
                cerrarSesion();
                navigate('/');
                return;
            }
            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudieron cargar tus grupos',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, cerrarSesion, navigate]);

    useEffect(() => {
        void cargarGrupos();
    }, [cargarGrupos]);

    const inscripciones = grupos.reduce(
        (total, grupo) => total + grupo.estudiantes,
        0,
    );

    return (
        <section className="space-y-6">
            <div className="rounded-3xl border border-[#FF7C02]/20 bg-gradient-to-br from-[#FF7C02]/15 via-white/5 to-transparent p-6 shadow-2xl sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFB86C]">
                    Panel del profesor
                </p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
                    ¡Bienvenido, profesor {usuario.username}!
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                    Consulta tus grupos, revisa su avance y entra rápidamente a
                    administrar sus ejercicios.
                </p>
                <Link
                    to="/grupos"
                    className="mt-5 inline-flex rounded-xl bg-[#FF7C02] px-4 py-2.5 text-sm font-bold text-black transition hover:brightness-110"
                >
                    Administrar grupos
                </Link>
            </div>

            {cargando ? (
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-gray-400">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-[#FF7C02]" />
                    Cargando tus grupos...
                </div>
            ) : error ? (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                    {error}
                </p>
            ) : (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-sm text-gray-400">Tus grupos</p>
                            <p className="mt-2 text-3xl font-extrabold text-white">
                                {formatearNumero(grupos.length)}
                            </p>
                        </article>
                        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
                            <p className="text-sm text-gray-400">
                                Inscripciones en tus grupos
                            </p>
                            <p className="mt-2 text-3xl font-extrabold text-[#FF7C02]">
                                {formatearNumero(inscripciones)}
                            </p>
                        </article>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                Tus grupos
                            </h2>
                            <p className="mt-1 text-sm text-gray-400">
                                Abre un grupo para gestionar ejercicios o
                                consultar su reporte.
                            </p>
                        </div>
                        <Link
                            to="/grupos"
                            className="text-sm font-semibold text-[#FF7C02] hover:underline"
                        >
                            Ver todos y crear grupos →
                        </Link>
                    </div>

                    {grupos.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-10 text-center">
                            <p className="font-semibold text-white">
                                Aún no tienes grupos creados
                            </p>
                            <p className="mt-2 text-sm text-gray-400">
                                Crea un grupo para compartir ejercicios con tus
                                estudiantes.
                            </p>
                            <Link
                                to="/grupos"
                                className="mt-4 inline-flex rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-bold text-black hover:brightness-110"
                            >
                                Crear mi primer grupo
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {grupos.map((grupo) => (
                                <article
                                    key={grupo.id}
                                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-lg font-bold text-white">
                                            {grupo.nombre}
                                        </h3>
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                                            {grupo.estudiantes}{' '}
                                            {grupo.estudiantes === 1
                                                ? 'estudiante'
                                                : 'estudiantes'}
                                        </span>
                                    </div>
                                    <p className="mt-3 text-xs uppercase tracking-wide text-gray-500">
                                        Código para unirse
                                    </p>
                                    <p className="mt-1 font-mono text-lg font-bold tracking-[0.2em] text-[#FF7C02]">
                                        {grupo.codigo}
                                    </p>
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <Link
                                            to={`/grupos/${grupo.id}`}
                                            className="flex-1 rounded-xl bg-[#FF7C02] px-3 py-2 text-center text-sm font-semibold text-black hover:brightness-110"
                                        >
                                            Abrir grupo
                                        </Link>
                                        <Link
                                            to={`/grupos/${grupo.id}/reporte`}
                                            className="flex-1 rounded-xl border border-white/15 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-white/10"
                                        >
                                            Ver reporte
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};

export default SeccionProfesor;
