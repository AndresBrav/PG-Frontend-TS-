import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    crearTemarioGrupo,
    eliminarEjercicioGrupo,
    eliminarTemarioGrupo,
    listarEjerciciosGrupoEstudiante,
    listarEjerciciosGrupoProfesor,
    listarTemariosGrupo,
    listarTemariosGrupoEstudiante,
    obtenerRankingGrupo,
    obtenerRankingGrupoEstudiante,
    obtenerGrupoProfesor,
    renombrarTemarioGrupo,
} from '../../api/gruposApi';
import type {
    EjercicioGrupo,
    EstudianteGrupo,
    FilaRankingGrupo,
    TemarioGrupo,
} from '../../types/dominio';

/**
 * /grupos/:id — Detalle del grupo según el rol:
 * - Profesor: gestiona temarios y ejercicios, ve las entregas y el
 *   ranking. Crea ejercicios en su propia página.
 * - Estudiante: ve temarios con su avance, ejercicios con su estado
 *   (✅ completado / ⏳ pendiente / calificado) y el ranking.
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

    const cargar = async () => {
        if (!claveAcceso || !id) return;
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
                        <Link
                            to={`/profesor/grupos/${id}/ejercicios/nuevo`}
                            className="rounded-xl bg-[#FF7C02] px-5 py-2 font-semibold text-black hover:brightness-110"
                        >
                            + Nuevo ejercicio
                        </Link>
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

                {/* Estudiantes inscritos (solo profesor) */}
                {esProfesor && (
                    <EstudiantesListado grupoId={id} />
                )}
            </div>
        </AppShell>
    );
};

/** Lista simple de inscritos (el profesor la ve al final). */
const EstudiantesListado = ({ grupoId }: { grupoId: string }) => {
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

    if (cargando || !grupo) return null;

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

            {grupo.estudiantes.length > 0 && (
                <>
                    <h2 className="mb-3 text-xl font-bold text-white">
                        👥 Estudiantes inscritos ({grupo.estudiantes.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {grupo.estudiantes.map((est) => (
                            <span
                                key={est.id}
                                className="rounded-full bg-white/5 px-4 py-1.5 text-sm text-gray-300"
                            >
                                {est.username}{' '}
                                <span className="text-xs text-gray-500">
                                    · {est.codigo}
                                </span>
                            </span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default GrupoDetalle;
