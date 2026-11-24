import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    agregarEstudiantesPorCodigo,
    crearTemarioGrupo,
    eliminarEjercicioGrupo,
    eliminarTemarioGrupo,
    listarEjerciciosGrupoEstudiante,
    listarEjerciciosGrupoProfesor,
    listarTemariosGrupo,
    listarTemariosGrupoEstudiante,
    obtenerRankingGrupo,
    obtenerRankingGrupoAdmin,
    obtenerRankingGrupoEstudiante,
    obtenerGrupoProfesor,
    renombrarTemarioGrupo,
} from '../../api/gruposApi';
import type { ResultadoInscripcionSIS } from '../../api/gruposApi';
import type {
    EjercicioGrupo,
    EstudianteGrupo,
    FilaRankingGrupo,
    RankingGrupo,
    TemarioGrupo,
} from '../../types/dominio';

/**
 * /grupos/:id — Detalle del grupo según el rol:
 * - Profesor: gestiona temarios y ejercicios, ve las entregas y el
 *   ranking. Crea ejercicios en su propia página.
 * - Estudiante: ve temarios con su avance, ejercicios con su estado
 *   (✅ completado / ⏳ pendiente / calificado) y el ranking.
 * - Admin: consulta la lista de estudiantes y puntos en solo lectura.
 */
const GrupoDetalle = () => {
    const { id } = useParams<{ id: string }>();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [temarios, setTemarios] = useState<TemarioGrupo[]>([]);
    const [ejercicios, setEjercicios] = useState<EjercicioGrupo[]>([]);
    const [ranking, setRanking] = useState<FilaRankingGrupo[]>([]);
    const [temarioActivo, setTemarioActivo] = useState<number | null>(null);
    const [nuevoTemario, setNuevoTemario] = useState('');

    const esProfesor = usuario?.rol === 'profesor';
    const esAdmin = usuario?.rol === 'admin';

    const cargar = async () => {
        if (!claveAcceso || !id || !usuario) return;
        if (esAdmin) {
            setCargando(false);
            return;
        }
        setCargando(true);
        try {
            let listaTemarios: TemarioGrupo[];
            let listaEjercicios: EjercicioGrupo[];

            if (esProfesor) {
                [listaTemarios, listaEjercicios] = await Promise.all([
                    listarTemariosGrupo(claveAcceso, id),
                    listarEjerciciosGrupoProfesor(claveAcceso, id),
                ]);
                const rank = await obtenerRankingGrupo(claveAcceso, id);
                setRanking(rank.ranking);
            } else {
                [listaTemarios, listaEjercicios] = await Promise.all([
                    listarTemariosGrupoEstudiante(claveAcceso, id),
                    listarEjerciciosGrupoEstudiante(claveAcceso, id),
                ]);
                const rank = await obtenerRankingGrupoEstudiante(
                    claveAcceso,
                    id,
                );
                setRanking(rank.ranking);
            }

            setTemarios(listaTemarios);
            setEjercicios(listaEjercicios);
            setTemarioActivo((anterior) =>
                anterior && listaTemarios.some((t) => t.id === anterior)
                    ? anterior
                    : (listaTemarios[0]?.id ?? null),
            );
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo cargar el grupo',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
            navigate('/grupos');
            return;
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        void cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, usuario?.rol]);

    const ejerciciosFiltrados = useMemo(
        () =>
            temarioActivo === null
                ? ejercicios
                : ejercicios.filter((e) => e.temario_id === temarioActivo),
        [ejercicios, temarioActivo],
    );

    if (!usuario || !id) return null;

    if (esAdmin) return <Navigate to={`/grupos/${id}/estudiantes`} replace />;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando el grupo..." />
            </AppShell>
        );
    }

    // ===================== TEMARIOS (profesor) =====================

    const agregarTemario = async () => {
        if (!claveAcceso || !id) return;
        if (nuevoTemario.trim().length < 2) return;

        try {
            const temario = await crearTemarioGrupo(
                claveAcceso,
                id,
                nuevoTemario.trim(),
            );
            setTemarios((prev) => [...prev, temario]);
            setTemarioActivo(temario.id);
            setNuevoTemario('');
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo crear el temario',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    const renombrar = async (temario: TemarioGrupo) => {
        if (!claveAcceso) return;

        const { value } = await Swal.fire({
            title: 'Renombrar temario',
            input: 'text',
            inputValue: temario.nombre,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            inputValidator: (v) =>
                v && v.trim().length >= 2
                    ? undefined
                    : 'Mínimo 2 caracteres',
        });

        if (!value) return;

        try {
            await renombrarTemarioGrupo(claveAcceso, temario.id, value.trim());
            void cargar();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo renombrar',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    const borrarTemario = async (temario: TemarioGrupo) => {
        if (!claveAcceso) return;

        const confirmar = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar temario?',
            text: `"${temario.nombre}" (solo si está vacío)`,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        if (!confirmar.isConfirmed) return;

        try {
            await eliminarTemarioGrupo(claveAcceso, temario.id);
            void cargar();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo eliminar el temario',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    // ===================== EJERCICIOS (profesor) =====================

    const borrarEjercicio = async (ejercicio: EjercicioGrupo) => {
        if (!claveAcceso) return;

        const confirmar = await Swal.fire({
            icon: 'warning',
            title: '¿Eliminar ejercicio?',
            text: `"${ejercicio.titulo}" y todas sus entregas`,
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d33',
        });

        if (!confirmar.isConfirmed) return;

        try {
            await eliminarEjercicioGrupo(claveAcceso, ejercicio.id);
            void cargar();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo eliminar el ejercicio',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    // ===================== RENDER =====================

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-5xl px-4 py-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            to="/grupos"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            ← Grupos
                        </Link>
                        <h1 className="text-3xl font-bold text-white">
                            Detalle del grupo
                        </h1>
                    </div>
                    {esProfesor && (
                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/grupos/${id}/reporte`}
                                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 font-semibold text-white hover:bg-white/10"
                            >
                                📊 Reporte de avance
                            </Link>
                            <Link
                                to={`/grupos/${id}/estudiantes`}
                                className="rounded-xl border border-white/15 bg-white/5 px-5 py-2 font-semibold text-white hover:bg-white/10"
                            >
                                👥 Estudiantes
                            </Link>
                            <Link
                                to={`/profesor/grupos/${id}/ejercicios/nuevo`}
                                className="rounded-xl bg-[#FF7C02] px-5 py-2 font-semibold text-black hover:brightness-110"
                            >
                                + Nuevo ejercicio
                            </Link>
                        </div>
                    )}
                </div>

                {/* Chips de temarios */}
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {temarios.map((temario) => (
                        <button
                            key={temario.id}
                            onClick={() => setTemarioActivo(temario.id)}
                            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                                temarioActivo === temario.id
                                    ? 'bg-[#FF7C02] text-black'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                            }`}
                        >
                            {temario.nombre}
                            {esProfesor
                                ? ` (${temario.ejercicios ?? 0})`
                                : ` (${temario.completados ?? 0}/${temario.total ?? 0})`}
                        </button>
                    ))}

                    {esProfesor && (
                        <>
                            <input
                                value={nuevoTemario}
                                onChange={(e) => setNuevoTemario(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        void agregarTemario();
                                    }
                                }}
                                placeholder="+ Temario"
                                className="w-40 rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                                maxLength={80}
                            />
                            {temarioActivo !== null && (
                                <>
                                    <button
                                        onClick={() => {
                                            const temario = temarios.find(
                                                (t) =>
                                                    t.id === temarioActivo,
                                            );
                                            if (temario) void renombrar(temario);
                                        }}
                                        className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/20"
                                    >
                                        ✏️ renombrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            const temario = temarios.find(
                                                (t) =>
                                                    t.id === temarioActivo,
                                            );
                                            if (temario)
                                                void borrarTemario(temario);
                                        }}
                                        className="rounded-full bg-red-500/20 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/30"
                                    >
                                        🗑 eliminar
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Ejercicios del temario activo */}
                <div className="grid gap-3">
                    {ejerciciosFiltrados.map((ejercicio) => (
                        <div
                            key={ejercicio.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-bold text-white">
                                            {ejercicio.titulo}
                                        </h3>
                                        <span className="rounded-full bg-sky-400/10 px-3 py-0.5 text-xs text-sky-300">
                                            {ejercicio.tipo === 'diagrama'
                                                ? 'Diagrama de flujo'
                                                : 'Pseudocódigo'}
                                        </span>
                                        <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-gray-300">
                                            {ejercicio.puntos} pts
                                        </span>
                                        {ejercicio.fecha_limite && (
                                            <span
                                                className={`rounded-full px-3 py-0.5 text-xs ${
                                                    ejercicio.vencido
                                                        ? 'bg-red-500/10 text-red-300'
                                                        : 'bg-amber-400/10 text-amber-300'
                                                }`}
                                            >
                                                {ejercicio.vencido
                                                    ? '⏰ Venció el'
                                                    : '⏰ Hasta'}{' '}
                                                {ejercicio.fecha_limite}
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 whitespace-pre-line text-sm text-gray-400">
                                        {ejercicio.enunciado}
                                    </p>
                                </div>

                                {esProfesor ? (
                                    <div className="flex flex-col items-stretch gap-2">
                                        <span className="text-center text-xs text-gray-400">
                                            {ejercicio.completados ?? 0}/
                                            {ejercicio.entregas ?? 0}{' '}
                                            completados/entregas
                                        </span>
                                        <Link
                                            to={`/profesor/grupos/${id}/ejercicios/${ejercicio.id}/revisar?tipo=${ejercicio.tipo}`}
                                            className="rounded-xl bg-[#FF7C02] px-4 py-2 text-center text-sm font-semibold text-black hover:brightness-110"
                                        >
                                            Revisar entregas
                                        </Link>
                                        <button
                                            onClick={() =>
                                                borrarEjercicio(ejercicio)
                                            }
                                            className="rounded-xl bg-red-500/20 px-4 py-2 text-sm text-red-300 hover:bg-red-500/30"
                                        >
                                            🗑 Eliminar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-stretch gap-2">
                                        {ejercicio.mi_entrega?.calificado && (
                                            <span className="rounded-full bg-amber-400/10 px-3 py-0.5 text-center text-xs text-amber-300">
                                                ⭐ Calificado:{' '}
                                                {ejercicio.mi_entrega
                                                    .puntos_profesor ?? 0}{' '}
                                                pts
                                            </span>
                                        )}
                                        <span className="text-center text-xs">
                                            {ejercicio.mi_entrega
                                                ?.completado ? (
                                                <span className="text-emerald-300">
                                                    ✅ Completado (
                                                    {
                                                        ejercicio.mi_entrega
                                                            .puntos
                                                    }{' '}
                                                    pts)
                                                </span>
                                            ) : ejercicio.vencido ? (
                                                <span className="text-red-300">
                                                    ⏰ Vencido
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">
                                                    ⏳ Pendiente
                                                </span>
                                            )}
                                        </span>
                                        <Link
                                            to={`/grupos/${id}/ejercicios/${ejercicio.id}/${ejercicio.tipo === 'diagrama' ? 'diagrama' : 'pseudocodigo'}`}
                                            className="rounded-xl bg-[#FF7C02] px-4 py-2 text-center text-sm font-semibold text-black hover:brightness-110"
                                        >
                                            {ejercicio.mi_entrega
                                                ?.completado
                                                ? 'Ver de nuevo'
                                                : ejercicio.vencido
                                                  ? 'Ver (vencido)'
                                                  : 'Resolver'}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {ejerciciosFiltrados.length === 0 && (
                        <p className="py-10 text-center text-sm text-gray-500">
                            {esProfesor
                                ? 'No hay ejercicios en este temario. Crea el primero con "+ Nuevo ejercicio".'
                                : 'No hay ejercicios en este temario todavía.'}
                        </p>
                    )}
                </div>

                {/* Ranking del grupo */}
                <div className="mt-10">
                    <h2 className="mb-3 text-xl font-bold text-white">
                        🏆 Ranking del grupo
                    </h2>
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                        {ranking.map((fila, indice) => (
                            <div
                                key={fila.estudiante.id}
                                className={`flex items-center justify-between gap-4 px-5 py-3 ${
                                    indice % 2 === 0
                                        ? 'bg-white/5'
                                        : 'bg-white/[0.02]'
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    <span className="w-8 text-center text-sm font-bold text-[#FF7C02]">
                                        {indice + 1}
                                    </span>
                                    <span className="text-white">
                                        {fila.estudiante.username}
                                        {!esProfesor &&
                                            fila.estudiante.id ===
                                                usuario.id && (
                                                <span className="ml-2 text-xs text-gray-500">
                                                    (tú)
                                                </span>
                                            )}
                                    </span>
                                </span>
                                <span className="flex gap-4 text-sm">
                                    <span className="text-gray-400">
                                        {fila.completados} completados
                                    </span>
                                    <span className="font-bold text-[#FF7C02]">
                                        {fila.puntos} pts
                                    </span>
                                </span>
                            </div>
                        ))}
                        {ranking.length === 0 && (
                            <p className="px-5 py-6 text-center text-sm text-gray-500">
                                Todavía no hay estudiantes inscritos.
                            </p>
                        )}
                    </div>
                </div>

            </div>
        </AppShell>
    );
};

interface EstudianteConPuntos {
    id: number;
    codigo: string;
    username: string;
    puntos: number;
}

const compararNombreEstudiante = (
    a: EstudianteConPuntos,
    b: EstudianteConPuntos,
): number =>
    a.username.localeCompare(b.username, 'es', { sensitivity: 'base' }) ||
    a.id - b.id;

/** Profesor: código de invitación e inscritos con búsqueda y ordenamiento. */
export const EstudiantesListado = ({
    grupoId,
    ranking,
}: {
    grupoId: string;
    ranking: FilaRankingGrupo[];
}) => {
    const { claveAcceso } = useContext(TokenContext);
    const [grupo, setGrupo] = useState<{
        codigo: string;
        estudiantes: EstudianteGrupo[];
    } | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            if (!claveAcceso) return;
            try {
                setGrupo(await obtenerGrupoProfesor(claveAcceso, grupoId));
            } catch (error) {
                if (esErrorDeSesion(error)) return;
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: obtenerMensajeError(
                        error,
                        'No se pudo cargar la información del grupo',
                    ),
                });
            } finally {
                setCargando(false);
            }
        };
        void cargar();
    }, [claveAcceso, grupoId]);

    const agregarPorCodigoSIS = async () => {
        if (!claveAcceso) return;

        const { value, isConfirmed } = await Swal.fire({
            title: 'Agregar estudiantes por código SIS',
            input: 'textarea',
            inputPlaceholder: 'Un código SIS por línea',
            inputAttributes: {
                'aria-label': 'Códigos SIS de los estudiantes',
                rows: '8',
            },
            showCancelButton: true,
            confirmButtonText: 'Agregar',
            cancelButtonText: 'Cancelar',
            inputValidator: (valor) => {
                const codigos = (valor ?? '')
                    .split(/\r?\n/)
                    .map((codigo) => codigo.trim())
                    .filter(Boolean);

                if (codigos.length === 0) {
                    return 'Ingresa al menos un código SIS';
                }
                if (codigos.length > 100) {
                    return 'Puedes ingresar hasta 100 códigos a la vez';
                }
                if (
                    codigos.some(
                        (codigo) => !/^[A-Za-z0-9]{4,20}$/.test(codigo),
                    )
                ) {
                    return 'Cada código SIS debe tener entre 4 y 20 caracteres alfanuméricos';
                }
                return undefined;
            },
        });

        if (!isConfirmed || typeof value !== 'string') return;

        const codigos = value
            .split(/\r?\n/)
            .map((codigo) => codigo.trim())
            .filter(Boolean);

        let resultados: ResultadoInscripcionSIS[];
        try {
            resultados = await agregarEstudiantesPorCodigo(
                claveAcceso,
                grupoId,
                codigos,
            );
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            await Swal.fire({
                icon: 'error',
                title: 'No se pudieron agregar los estudiantes',
                text: obtenerMensajeError(
                    error,
                    'No se pudo completar la inscripción',
                ),
            });
            return;
        }

        let errorRecarga: unknown;
        try {
            setGrupo(await obtenerGrupoProfesor(claveAcceso, grupoId));
        } catch (error) {
            errorRecarga = error;
        }

        const etiquetas = {
            agregado: 'agregado',
            ya_inscrito: 'ya estaba inscrito',
            no_encontrado: 'código no encontrado',
            no_es_estudiante: 'no corresponde a un estudiante',
        };
        const detalle = resultados
            .map(({ codigo, estado }) => `${codigo}: ${etiquetas[estado]}`)
            .join('\n');
        const todosAgregados = resultados.every(
            ({ estado }) => estado === 'agregado',
        );

        await Swal.fire({
            icon: todosAgregados ? 'success' : 'info',
            title: 'Resultado de la inscripción',
            text: detalle,
        });

        if (errorRecarga && !esErrorDeSesion(errorRecarga)) {
            await Swal.fire({
                icon: 'warning',
                title: 'Inscripción realizada',
                text: `No se pudo actualizar la lista: ${obtenerMensajeError(
                    errorRecarga,
                    'error al recargar el grupo',
                )}`,
            });
        }
    };

    if (cargando || !grupo) return null;

    const puntosPorEstudiante = new Map(
        ranking.map((fila) => [fila.estudiante.id, fila.puntos]),
    );

    return (
        <div className="mt-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#FF7C02]/30 bg-[#FF7C02]/10 p-5">
                <div>
                    <h2 className="text-lg font-bold text-white">
                        Código para unirse al grupo
                    </h2>
                    <p className="mt-1 text-sm text-gray-300">
                        Comparte este código con tus estudiantes.
                    </p>
                </div>
                <span className="rounded-xl bg-black/30 px-5 py-2 font-mono text-2xl font-bold tracking-[0.3em] text-[#FF7C02]">
                    {grupo.codigo}
                </span>
            </div>

            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            👥 Estudiantes inscritos ({grupo.estudiantes.length})
                        </h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Busca por nombre o SIS y ordena por puntos o nombre.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => void agregarPorCodigoSIS()}
                        className="rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#e66d00]"
                    >
                        + Agregar por código SIS
                    </button>
                </div>
                <TablaEstudiantesGrupo
                    estudiantes={grupo.estudiantes.map((estudiante) => ({
                        ...estudiante,
                        puntos:
                            puntosPorEstudiante.get(estudiante.id) ?? 0,
                    }))}
                />
            </section>
        </div>
    );
};

const TablaEstudiantesGrupo = ({
    estudiantes,
}: {
    estudiantes: EstudianteConPuntos[];
}) => {
    const [busqueda, setBusqueda] = useState('');
    const [orden, setOrden] = useState<'puntos' | 'nombre'>('puntos');

    const puestos = useMemo(() => {
        const ordenados = [...estudiantes].sort(
            (a, b) =>
                b.puntos - a.puntos || compararNombreEstudiante(a, b),
        );
        return new Map(
            ordenados.map((estudiante, indice) => [
                estudiante.id,
                indice + 1,
            ]),
        );
    }, [estudiantes]);

    const estudiantesVisibles = useMemo(() => {
        const consulta = busqueda.trim().toLocaleLowerCase();
        return estudiantes
            .filter(
                (estudiante) =>
                    estudiante.username
                        .toLocaleLowerCase()
                        .includes(consulta) ||
                    estudiante.codigo.toLocaleLowerCase().includes(consulta),
            )
            .sort((a, b) =>
                orden === 'puntos'
                    ? b.puntos - a.puntos ||
                      compararNombreEstudiante(a, b)
                    : compararNombreEstudiante(a, b),
            );
    }, [busqueda, estudiantes, orden]);

    return (
        <div>
            <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <input
                    type="search"
                    value={busqueda}
                    onChange={(event) => setBusqueda(event.target.value)}
                    placeholder="Buscar por nombre o código SIS"
                    aria-label="Buscar estudiantes por nombre o código SIS"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#FF7C02]"
                />
                <label className="flex items-center gap-2 text-sm text-gray-300">
                    Ordenar por
                    <select
                        value={orden}
                        onChange={(event) =>
                            setOrden(
                                event.target.value === 'nombre'
                                    ? 'nombre'
                                    : 'puntos',
                            )
                        }
                        className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2.5 text-white outline-none focus:border-[#FF7C02]"
                    >
                        <option value="puntos">Puntos (mayor a menor)</option>
                        <option value="nombre">Nombre (A–Z)</option>
                    </select>
                </label>
            </div>

            {estudiantesVisibles.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[560px] text-left text-sm">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Puesto</th>
                                <th className="px-4 py-3">Estudiante</th>
                                <th className="px-4 py-3">Código SIS</th>
                                <th className="px-4 py-3 text-right">Puntos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudiantesVisibles.map((estudiante) => (
                                <tr
                                    key={estudiante.id}
                                    className="border-t border-white/5 text-gray-200"
                                >
                                    <td className="px-4 py-3 font-semibold text-[#FF7C02]">
                                        {puestos.get(estudiante.id) ?? '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {estudiante.username}
                                    </td>
                                    <td className="px-4 py-3 text-gray-400">
                                        {estudiante.codigo}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-[#FF7C02]">
                                        {estudiante.puntos} pts
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm text-gray-400">
                    {estudiantes.length === 0
                        ? 'Aún no hay estudiantes inscritos en este grupo.'
                        : 'No hay estudiantes que coincidan con la búsqueda.'}
                </p>
            )}
        </div>
    );
};

export const EstudiantesListadoAdmin = ({ grupoId }: { grupoId: string }) => {
    const { claveAcceso } = useContext(TokenContext);
    const navigate = useNavigate();
    const [ranking, setRanking] = useState<RankingGrupo | null>(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            if (!claveAcceso) return;
            try {
                setRanking(await obtenerRankingGrupoAdmin(claveAcceso, grupoId));
            } catch (error) {
                if (esErrorDeSesion(error)) return;
                await Swal.fire({
                    icon: 'error',
                    title: 'No se pudo cargar el grupo',
                    text: obtenerMensajeError(
                        error,
                        'No se pudo cargar la lista de estudiantes',
                    ),
                });
                navigate('/admin?tab=grupos');
            } finally {
                setCargando(false);
            }
        };
        void cargar();
    }, [claveAcceso, grupoId, navigate]);

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando estudiantes del grupo..." />
            </AppShell>
        );
    }
    if (!ranking) return null;

    const estudiantes = ranking.ranking.map(({ estudiante, puntos }) => ({
        ...estudiante,
        puntos,
    }));

    return (
        <AppShell>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-400">
                        Vista administrativa · Solo lectura
                    </p>
                    <h1 className="text-3xl font-bold text-white">
                        Estudiantes de {ranking.grupo.nombre}
                    </h1>
                </div>
                <Link
                    to="/admin?tab=grupos"
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm text-gray-200 hover:bg-white/5"
                >
                    Volver a grupos
                </Link>
            </div>
            <TablaEstudiantesGrupo estudiantes={estudiantes} />
        </AppShell>
    );
};

export default GrupoDetalle;
