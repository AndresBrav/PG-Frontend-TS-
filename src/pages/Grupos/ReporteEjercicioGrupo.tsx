import { useContext, useEffect, useMemo, useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    calificarEntregaGrupo,
    listarEjerciciosGrupoAdmin,
    listarEjerciciosGrupoProfesor,
} from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { obtenerReporteGrupo } from '../../api/reportesApi';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { EjercicioGrupo, ReporteGrupo } from '../../types/dominio';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { imprimirSeccionReporte } from '../../utils/imprimirReporte';

type EstadoEstudiante =
    | 'resuelto'
    | 'en_progreso'
    | 'sin_iniciar';

type FiltroEstado =
    | 'todos'
    | 'resueltos'
    | 'no_resueltos'
    | 'en_progreso'
    | 'sin_iniciar'
    | 'por_calificar'
    | 'calificados'
    | 'vencidos';

const estadosValidos: FiltroEstado[] = [
    'todos',
    'resueltos',
    'no_resueltos',
    'en_progreso',
    'sin_iniciar',
    'por_calificar',
    'calificados',
    'vencidos',
];

const etiquetasEstado: Record<FiltroEstado, string> = {
    todos: 'Todos',
    resueltos: 'Resueltos',
    no_resueltos: 'No resueltos',
    en_progreso: 'En progreso',
    sin_iniciar: 'Sin iniciar',
    por_calificar: 'Por calificar',
    calificados: 'Calificados',
    vencidos: 'Vencidos',
};

type FilaEstudiante = {
    estudiante: ReporteGrupo['estudiantes'][number];
    entrega: ReporteGrupo['entregas'][number] | undefined;
    estado: EstadoEstudiante;
    vencido: boolean;
};

const ReporteEjercicioGrupo = () => {
    const { id, ejercicioId } = useParams<{
        id: string;
        ejercicioId: string;
    }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [reporte, setReporte] = useState<ReporteGrupo | null>(null);
    const [ejercicio, setEjercicio] = useState<EjercicioGrupo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>(() => {
        const estado = searchParams.get('estado');
        return estado && estadosValidos.includes(estado as FiltroEstado)
            ? (estado as FiltroEstado)
            : 'todos';
    });
    const [busqueda, setBusqueda] = useState(
        () => searchParams.get('q') ?? '',
    );
    const [calificandoId, setCalificandoId] = useState<number | null>(null);
    const rolReporte =
        usuario?.rol === 'profesor' || usuario?.rol === 'admin'
            ? usuario.rol
            : null;

    useEffect(() => {
        if (!claveAcceso || !id || !ejercicioId || !rolReporte) {
            setCargando(false);
            return;
        }

        let activo = true;
        setCargando(true);
        setError(null);

        const cargar = async () => {
            try {
                const [datosReporte, ejerciciosGrupo] = await Promise.all([
                    obtenerReporteGrupo(claveAcceso, id, rolReporte),
                    rolReporte === 'admin'
                        ? listarEjerciciosGrupoAdmin(claveAcceso, id)
                        : listarEjerciciosGrupoProfesor(claveAcceso, id),
                ]);
                if (!activo) return;

                const ejercicioEncontrado = ejerciciosGrupo.find(
                    (item) => item.id === Number(ejercicioId),
                );
                const datosEjercicioReporte = datosReporte.ejercicios.find(
                    (item) => item.id === Number(ejercicioId),
                );
                if (!ejercicioEncontrado || !datosEjercicioReporte) {
                    setError(
                        'No se encontró el ejercicio en este grupo o no tienes acceso.',
                    );
                    return;
                }

                setReporte(datosReporte);
                setEjercicio({
                    ...ejercicioEncontrado,
                    asignacion: datosEjercicioReporte.asignacion,
                    estudiantes_asignados_ids:
                        datosEjercicioReporte.estudiantes_asignados_ids,
                });
            } catch (errorDesconocido) {
                if (!activo) return;
                if (esErrorDeSesion(errorDesconocido)) {
                    cerrarSesion();
                    navigate('/');
                    return;
                }
                setError(
                    obtenerMensajeError(
                        errorDesconocido,
                        'No se pudo cargar el detalle del ejercicio',
                    ),
                );
            } finally {
                if (activo) setCargando(false);
            }
        };

        void cargar();
        return () => {
            activo = false;
        };
    }, [claveAcceso, id, ejercicioId, rolReporte, cerrarSesion, navigate]);

    const filas = useMemo<FilaEstudiante[]>(() => {
        if (!reporte || !ejercicio) return [];

        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);
        const fechaLimite = ejercicio.fecha_limite
            ? new Date(`${ejercicio.fecha_limite}T23:59:59`)
            : null;

        const estudiantesAsignados = new Set(
            ejercicio.estudiantes_asignados_ids ?? [],
        );
        return reporte.estudiantes
            .filter(
                (estudiante) =>
                    ejercicio.asignacion !== 'seleccionados' ||
                    estudiantesAsignados.has(estudiante.id),
            )
            .map((estudiante) => {
                const entrega = (reporte.entregas ?? []).find(
                    (item) =>
                        item.ejercicio_id === ejercicio.id &&
                        item.usuario_id === estudiante.id,
                );
                const resuelto = Boolean(entrega?.completado);
                const iniciado = Boolean(
                    entrega?.estado_tablero?.trim() ||
                        entrega?.ultima_actividad,
                );

                return {
                    estudiante,
                    entrega,
                    estado: resuelto
                        ? 'resuelto'
                        : iniciado
                          ? 'en_progreso'
                          : 'sin_iniciar',
                    vencido:
                        !resuelto &&
                        fechaLimite !== null &&
                        fechaLimite < hoy,
                };
            });
    }, [reporte, ejercicio]);

    const filasVisibles = useMemo(() => {
        const termino = busqueda.trim().toLowerCase();
        return filas.filter(({ estudiante, entrega, estado, vencido }) => {
            const coincideBusqueda =
                !termino ||
                `${estudiante.username} ${estudiante.codigo}`
                    .toLowerCase()
                    .includes(termino);
            if (!coincideBusqueda) return false;

            switch (filtroEstado) {
                case 'resueltos':
                    return estado === 'resuelto';
                case 'no_resueltos':
                    return estado !== 'resuelto';
                case 'en_progreso':
                    return estado === 'en_progreso';
                case 'sin_iniciar':
                    return estado === 'sin_iniciar';
                case 'por_calificar':
                    return Boolean(entrega?.completado && !entrega.calificado);
                case 'calificados':
                    return Boolean(entrega?.calificado);
                case 'vencidos':
                    return vencido;
                default:
                    return true;
            }
        });
    }, [filas, filtroEstado, busqueda]);

    const calificar = async (
        fila: FilaEstudiante,
        ejercicioActual: EjercicioGrupo,
    ) => {
        const { entrega, estudiante } = fila;
        if (
            usuario?.rol !== 'profesor' ||
            !claveAcceso ||
            !id ||
            !entrega?.completado ||
            calificandoId !== null
        ) {
            return;
        }

        const resultado = await Swal.fire<{
            puntos: number;
            comentario: string;
        }>({
            title: 'Calificar entrega',
            text: `Estudiante: ${estudiante.username}`,
            html: `
                <input
                    id="puntos"
                    type="number"
                    min="0"
                    max="${ejercicioActual.puntos}"
                    class="swal2-input"
                    placeholder="Puntos (máximo ${ejercicioActual.puntos})"
                >
                <textarea
                    id="comentario"
                    class="swal2-textarea"
                    placeholder="Comentario (opcional)"
                ></textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar calificación',
            cancelButtonText: 'Cancelar',
            didOpen: () => {
                const inputPuntos = document.getElementById(
                    'puntos',
                ) as HTMLInputElement | null;
                const inputComentario = document.getElementById(
                    'comentario',
                ) as HTMLTextAreaElement | null;
                if (inputPuntos) {
                    inputPuntos.value = String(entrega.puntos_profesor ?? 0);
                }
                if (inputComentario) {
                    inputComentario.value = entrega.comentario_profesor ?? '';
                }
            },
            preConfirm: () => {
                const inputPuntos = document.getElementById(
                    'puntos',
                ) as HTMLInputElement | null;
                if (!inputPuntos?.value.trim()) {
                    Swal.showValidationMessage('Ingresa una puntuación');
                    return null;
                }

                const puntos = Number(inputPuntos.value);
                const comentario = (
                    document.getElementById('comentario') as HTMLTextAreaElement | null
                )?.value;
                if (
                    !Number.isInteger(puntos) ||
                    puntos < 0 ||
                    puntos > ejercicioActual.puntos
                ) {
                    Swal.showValidationMessage(
                        `Los puntos deben ser un entero entre 0 y ${ejercicioActual.puntos}`,
                    );
                    return null;
                }
                return { puntos, comentario: comentario ?? '' };
            },
        });

        if (!resultado.isConfirmed || !resultado.value) return;

        const { puntos, comentario } = resultado.value;
        setCalificandoId(estudiante.id);
        try {
            await calificarEntregaGrupo(
                claveAcceso,
                ejercicioActual.id,
                estudiante.id,
                puntos,
                comentario.trim() || null,
            );
            setReporte((anterior) =>
                anterior
                    ? {
                          ...anterior,
                          entregas: (anterior.entregas ?? []).map((item) =>
                              item.ejercicio_id === ejercicioActual.id &&
                              item.usuario_id === estudiante.id
                                  ? {
                                        ...item,
                                        calificado: true,
                                        puntos_profesor: puntos,
                                        comentario_profesor:
                                            comentario.trim() || null,
                                    }
                                  : item,
                          ),
                      }
                    : anterior,
            );
            await Swal.fire({
                icon: 'success',
                title: 'Calificación guardada',
                text: 'El estudiante recibió una notificación.',
                timer: 1500,
                showConfirmButton: false,
            });
        } catch (errorCalificacion) {
            if (esErrorDeSesion(errorCalificacion)) {
                cerrarSesion();
                navigate('/');
                return;
            }
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: obtenerMensajeError(
                    errorCalificacion,
                    'No se pudo guardar la calificación',
                ),
            });
        } finally {
            setCalificandoId(null);
        }
    };

    if (!rolReporte) return null;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando detalle del ejercicio..." />
            </AppShell>
        );
    }

    const queryRetorno = searchParams.toString();
    const rutaRetorno = `/grupos/${id}/reporte${
        queryRetorno ? `?${queryRetorno}` : ''
    }`;
    const resumenFiltrosImpresion = [
        `Estado: ${etiquetasEstado[filtroEstado]}`,
        `Búsqueda: ${busqueda.trim() || 'Todos'}`,
    ].join(' · ');

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
                <div>
                    <Link
                        to={rutaRetorno}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Volver al reporte del grupo
                    </Link>
                    {ejercicio && reporte && (
                        <>
                            <h1 className="mt-3 text-3xl font-bold text-white">
                                Detalle del ejercicio
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                {reporte.grupo.nombre} ·{' '}
                                {reporte.temarios.find(
                                    (temario) =>
                                        temario.id === ejercicio.temario_id,
                                )?.nombre ?? 'Temario'}{' '}
                                ·{' '}
                                {ejercicio.tipo === 'diagrama'
                                    ? 'Diagrama'
                                    : 'Pseudocódigo'}
                            </p>
                        </>
                    )}
                </div>

                {error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : !reporte || !ejercicio ? null : (
                    <>
                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {ejercicio.titulo}
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-400">
                                        Puntaje máximo: {ejercicio.puntos} pts
                                        {' · '}Fecha límite:{' '}
                                        {formatearFecha(ejercicio.fecha_limite)}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Asignación:{' '}
                                        {ejercicio.asignacion === 'todos'
                                            ? 'Todo el grupo'
                                            : 'Estudiantes seleccionados'}
                                    </p>
                                </div>
                                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
                                    {ejercicio.tipo === 'diagrama'
                                        ? 'Diagrama'
                                        : 'Pseudocódigo'}
                                </span>
                            </div>
                            <div className="mt-5 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-gray-200">
                                {ejercicio.enunciado}
                            </div>
                            {ejercicio.casos_prueba &&
                                ejercicio.casos_prueba.length > 0 && (
                                    <details className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                                        <summary className="cursor-pointer text-sm font-semibold text-white">
                                            Casos de prueba
                                        </summary>
                                        <div className="mt-3 grid gap-2">
                                            {ejercicio.casos_prueba.map(
                                                (caso, indice) => (
                                                    <div
                                                        key={indice}
                                                        className="rounded-lg bg-white/5 p-3 text-xs text-gray-300"
                                                    >
                                                        <p>
                                                            Caso {indice + 1}
                                                        </p>
                                                        <p className="mt-1 text-gray-400">
                                                            Entrada:{' '}
                                                            {caso.entradas.join(
                                                                ', ',
                                                            )}
                                                        </p>
                                                        <p className="text-gray-400">
                                                            Salida esperada:{' '}
                                                            {caso.salidas_esperadas.join(
                                                                ', ',
                                                            )}
                                                        </p>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </details>
                                )}
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <TarjetaReporte
                                titulo="Estudiantes"
                                valor={filas.length}
                            />
                            <TarjetaReporte
                                titulo="Resolvieron"
                                valor={
                                    filas.filter(
                                        (fila) => fila.estado === 'resuelto',
                                    ).length
                                }
                            />
                            <TarjetaReporte
                                titulo="En progreso"
                                valor={
                                    filas.filter(
                                        (fila) =>
                                            fila.estado === 'en_progreso',
                                    ).length
                                }
                            />
                            <TarjetaReporte
                                titulo="Sin iniciar"
                                valor={
                                    filas.filter(
                                        (fila) =>
                                            fila.estado === 'sin_iniciar',
                                    ).length
                                }
                            />
                            <TarjetaReporte
                                titulo="Por calificar"
                                valor={
                                    filas.filter(
                                        ({ entrega }) =>
                                            entrega?.completado &&
                                            !entrega.calificado,
                                    ).length
                                }
                            />
                        </section>

                        <section className="reporte-seccion-impresion reporte-seccion-entregas-ejercicio-impresion rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                            <header className="reporte-solo-impresion">
                                <h1>Estudiantes y entregas</h1>
                                <p>Grupo: {reporte.grupo.nombre}</p>
                                <p>Ejercicio: {ejercicio.titulo}</p>
                                <p>
                                    Generado:{' '}
                                    {new Date().toLocaleDateString('es-BO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p>Filtros: {resumenFiltrosImpresion}</p>
                                <p>
                                    Estudiantes incluidos:{' '}
                                    {filasVisibles.length}
                                </p>
                            </header>
                            <div className="ocultar-en-impresion flex flex-wrap items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Estudiantes y entregas
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Se incluyen solo los estudiantes
                                        asignados, también quienes aún no
                                        iniciaron el ejercicio.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <label className="text-sm text-gray-300">
                                        Estado
                                        <select
                                            value={filtroEstado}
                                            onChange={(event) =>
                                                setFiltroEstado(
                                                    event.target.value as FiltroEstado,
                                                )
                                            }
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white"
                                        >
                                            <option value="todos">Todos</option>
                                            <option value="resueltos">
                                                Resueltos
                                            </option>
                                            <option value="no_resueltos">
                                                No resueltos
                                            </option>
                                            <option value="en_progreso">
                                                En progreso
                                            </option>
                                            <option value="sin_iniciar">
                                                Sin iniciar
                                            </option>
                                            <option value="por_calificar">
                                                Por calificar
                                            </option>
                                            <option value="calificados">
                                                Calificados
                                            </option>
                                            <option value="vencidos">
                                                Vencidos
                                            </option>
                                        </select>
                                    </label>
                                    <label className="text-sm text-gray-300">
                                        Buscar estudiante
                                        <input
                                            value={busqueda}
                                            onChange={(event) =>
                                                setBusqueda(event.target.value)
                                            }
                                            placeholder="Nombre o código"
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white placeholder:text-gray-600"
                                        />
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        imprimirSeccionReporte(
                                            'entregas-ejercicio',
                                        )
                                    }
                                    className="rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-bold text-black hover:brightness-110"
                                >
                                    Imprimir / guardar PDF
                                </button>
                            </div>

                            {filasVisibles.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    No hay estudiantes que coincidan con los
                                    filtros.
                                </p>
                            ) : (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full min-w-[1050px] border-separate border-spacing-y-2 text-left text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                <th className="px-3 py-2">
                                                    Estudiante
                                                </th>
                                                <th className="px-3 py-2">
                                                    Estado
                                                </th>
                                                <th className="px-3 py-2">
                                                    Última actividad
                                                </th>
                                                <th className="px-3 py-2">
                                                    Entrega
                                                </th>
                                                <th className="px-3 py-2">
                                                    Calificación
                                                </th>
                                                <th className="ocultar-en-impresion px-3 py-2">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filasVisibles.map((fila) => {
                                                const { estudiante, entrega } =
                                                    fila;
                                                const puedeVerSolucion =
                                                    Boolean(
                                                        entrega &&
                                                            (entrega.completado ||
                                                                entrega.estado_tablero?.trim()),
                                                    );
                                                const estadoTexto =
                                                    fila.estado === 'resuelto'
                                                        ? 'Resuelto'
                                                        : fila.estado ===
                                                            'en_progreso'
                                                          ? 'En progreso'
                                                          : 'Sin iniciar';

                                                return (
                                                    <tr
                                                        key={estudiante.id}
                                                        className="bg-[#181818]"
                                                    >
                                                        <td className="rounded-l-xl px-3 py-3">
                                                            <span className="font-semibold text-white">
                                                                {
                                                                    estudiante.username
                                                                }
                                                            </span>
                                                            <span className="mt-1 block font-mono text-xs text-gray-500">
                                                                {
                                                                    estudiante.codigo
                                                                }
                                                            </span>
                                                            {estudiante.correo && (
                                                                <span className="mt-0.5 block text-xs text-gray-400">
                                                                    {estudiante.correo}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span className="text-gray-300">
                                                                {estadoTexto}
                                                            </span>
                                                            {fila.vencido && (
                                                                <span className="ml-2 rounded-full bg-red-500/10 px-2 py-1 text-xs text-red-300">
                                                                    Vencido
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-400">
                                                            {formatearFechaHora(
                                                                entrega?.ultima_actividad ??
                                                                    null,
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-400">
                                                            {formatearFechaHora(
                                                                entrega?.fecha_completado ??
                                                                    null,
                                                                'Sin entregar',
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-300">
                                                            {entrega?.calificado
                                                                ? `${entrega.puntos_profesor ?? 0}/${ejercicio.puntos} pts`
                                                                : entrega?.completado
                                                                  ? 'Pendiente de calificar'
                                                                  : '—'}
                                                            {entrega?.comentario_profesor && (
                                                                <span className="mt-1 block max-w-xs text-gray-500">
                                                                    {
                                                                        entrega.comentario_profesor
                                                                    }
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="ocultar-en-impresion rounded-r-xl px-3 py-3">
                                                            <div className="flex flex-wrap gap-2">
                                                                {puedeVerSolucion ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            navigate(
                                                                                `/grupos/${id}/ejercicios/${ejercicio.id}/${ejercicio.tipo}?revisarEstudiante=${estudiante.id}`,
                                                                                {
                                                                                    state: {
                                                                                        rutaVolver: `${location.pathname}${location.search}`,
                                                                                    },
                                                                                },
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
                                                                    >
                                                                        Ver solución
                                                                    </button>
                                                                ) : (
                                                                    <span className="px-2 py-1.5 text-xs text-gray-500">
                                                                        Sin solución
                                                                    </span>
                                                                )}
                                                                {usuario?.rol ===
                                                                    'profesor' &&
                                                                    entrega?.completado && (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            calificandoId !==
                                                                            null
                                                                        }
                                                                        onClick={() =>
                                                                            void calificar(
                                                                                fila,
                                                                                ejercicio,
                                                                            )
                                                                        }
                                                                        className="rounded-lg bg-[#FF7C02] px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {calificandoId ===
                                                                        estudiante.id
                                                                            ? 'Guardando…'
                                                                            : entrega.calificado
                                                                              ? 'Editar nota'
                                                                              : 'Calificar'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </AppShell>
    );
};

const TarjetaReporte = ({
    titulo,
    valor,
}: {
    titulo: string;
    valor: number;
}) => (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
        <p className="text-sm text-gray-400">{titulo}</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{valor}</p>
    </article>
);

export default ReporteEjercicioGrupo;
