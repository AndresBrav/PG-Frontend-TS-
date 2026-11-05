import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { listarGruposProfesor } from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type {
    GrupoProfesor,
    PerfilUsuario,
} from '../../types/dominio';
import TarjetaResumen from '../../components/ui/TarjetaResumen';
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

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <h2 className="text-lg font-bold text-white">
                            ¿Dónde está "Mis grupos"?
                        </h2>
                        <p className="mt-1 max-w-xl text-sm text-gray-400">
                            Crea grupos, revisa ejercicios y reportes en la
                            sección{' '}
                            <Link
                                to="/grupos"
                                className="font-bold text-sky-300 hover:underline"
                            >
                                Grupos
                            </Link>{' '}
                            del menú superior: allí están tus grupos con el
                            código para compartir y el botón "Crear grupo".
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
        </section>
    );
};

export default SeccionProfesor;
