import { useContext, useEffect, useMemo, useState } from 'react';
import {
    Link,
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';
import Swal from 'sweetalert2';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { calificarEntregaGrupo } from '../../api/gruposApi';
import { obtenerReporteGrupo } from '../../api/reportesApi';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { ReporteGrupo } from '../../types/dominio';
import { formatearFecha, formatearFechaHora } from '../../utils/fechas';
import { imprimirSeccionReporte } from '../../utils/imprimirReporte';

type EstadoDetalle =
    | 'todos'
    | 'resueltos'
    | 'no_resueltos'
    | 'en_progreso'
    | 'sin_iniciar'
    | 'por_calificar'
    | 'calificados'
    | 'vencidos';

type CriterioFecha = 'creacion' | 'limite' | 'entrega' | 'actividad';

const estadosValidos: EstadoDetalle[] = [
    'todos',
    'resueltos',
    'no_resueltos',
    'en_progreso',
    'sin_iniciar',
    'por_calificar',
    'calificados',
    'vencidos',
];

const criteriosFechaValidos: CriterioFecha[] = [
    'creacion',
    'limite',
    'entrega',
    'actividad',
];

const etiquetasEstado: Record<EstadoDetalle, string> = {
    todos: 'Todos',
    resueltos: 'Resueltos',
    no_resueltos: 'No resueltos',
    en_progreso: 'En progreso',
    sin_iniciar: 'Sin iniciar',
    por_calificar: 'Por calificar',
    calificados: 'Calificados',
    vencidos: 'Vencidos',
};

const etiquetasCriterioFecha: Record<CriterioFecha, string> = {
    creacion: 'Creación del ejercicio',
    limite: 'Fecha límite',
    entrega: 'Fecha de entrega',
    actividad: 'Última actividad',
};

const dentroDelRango = (
    valor: string | null,
    desde: string,
    hasta: string,
): boolean => {
    if (!valor) return false;
    if (!desde && !hasta) return true;

    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return false;

    const limiteDesde = desde ? new Date(`${desde}T00:00:00`) : null;
    const limiteHasta = hasta ? new Date(`${hasta}T23:59:59.999`) : null;
    return (
        (!limiteDesde || fecha >= limiteDesde) &&
        (!limiteHasta || fecha <= limiteHasta)
    );
};

const ReporteEstudianteGrupo = () => {
    const { id, estudianteId } = useParams<{
        id: string;
        estudianteId: string;
    }>();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [reporte, setReporte] = useState<ReporteGrupo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [calificando, setCalificando] = useState(false);
    const [temarioActivo, setTemarioActivo] = useState(
        () => searchParams.get('temario') ?? 'todos',
    );
    const [estadoActivo, setEstadoActivo] = useState<EstadoDetalle>(() => {
        const estado = searchParams.get('estado');
        return estado && estadosValidos.includes(estado as EstadoDetalle)
            ? (estado as EstadoDetalle)
            : 'todos';
    });
    const [criterioFecha, setCriterioFecha] =
        useState<CriterioFecha>(() => {
            const criterio = searchParams.get('fecha');
            return criterio &&
                criteriosFechaValidos.includes(criterio as CriterioFecha)
                ? (criterio as CriterioFecha)
                : 'entrega';
        });
    const [fechaDesde, setFechaDesde] = useState(
        () => searchParams.get('desde') ?? '',
    );
    const [fechaHasta, setFechaHasta] = useState(
        () => searchParams.get('hasta') ?? '',
    );
    const rolReporte =
        usuario?.rol === 'profesor' || usuario?.rol === 'admin'
            ? usuario.rol
            : null;

    useEffect(() => {
        if (!claveAcceso || !id || !rolReporte) {
            setCargando(false);
            return;
        }

        let activo = true;
        setCargando(true);
        setError(null);

        const cargar = async () => {
            try {
                const datos = await obtenerReporteGrupo(
                    claveAcceso,
                    id,
                    rolReporte,
                );
                if (activo) setReporte(datos);
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
                        'No se pudo cargar el detalle del estudiante',
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
    }, [claveAcceso, id, rolReporte, cerrarSesion, navigate]);

    const estudiante = reporte?.estudiantes.find(
        (item) => item.id === Number(estudianteId),
    );

    const calificar = async (ejercicioId: number, puntosMaximos: number) => {
        if (
            usuario?.rol !== 'profesor' ||
            !claveAcceso ||
            !estudiante ||
            calificando
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
                    max="${puntosMaximos}"
                    class="swal2-input"
                    placeholder="Puntos (máximo ${puntosMaximos})"
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
                const entrega = reporte?.entregas.find(
                    (item) =>
                        item.ejercicio_id === ejercicioId &&
                        item.usuario_id === estudiante.id,
                );
                if (inputPuntos) {
                    inputPuntos.value = String(
                        entrega?.puntos_profesor ?? 0,
                    );
                }
                if (inputComentario) {
                    inputComentario.value =
                        entrega?.comentario_profesor ?? '';
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
                    puntos > puntosMaximos
                ) {
                    Swal.showValidationMessage(
                        `Los puntos deben ser un entero entre 0 y ${puntosMaximos}`,
                    );
                    return null;
                }
                return { puntos, comentario: comentario ?? '' };
            },
        });

        if (!resultado.isConfirmed || !resultado.value) return;

        const { puntos, comentario } = resultado.value;
        setCalificando(true);
        try {
            await calificarEntregaGrupo(
                claveAcceso,
                ejercicioId,
                estudiante.id,
                puntos,
                comentario.trim() || null,
            );
            setReporte((anterior) =>
                anterior
                    ? {
                          ...anterior,
                          entregas: (anterior.entregas ?? []).map((entrega) =>
                              entrega.ejercicio_id === ejercicioId &&
                              entrega.usuario_id === estudiante.id
                                  ? {
                                        ...entrega,
                                        calificado: true,
                                        puntos_profesor: puntos,
                                        comentario_profesor:
                                            comentario.trim() || null,
                                    }
                                  : entrega,
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
            setCalificando(false);
        }
    };

    const ejerciciosConEstado = useMemo(() => {
        if (!reporte || !estudiante) return [];

        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);

        return reporte.ejercicios
            .filter((ejercicio) => {
                const estaAsignado =
                    ejercicio.asignacion !== 'seleccionados' ||
                    ejercicio.estudiantes_asignados_ids.includes(
                        estudiante.id,
                    );
                const coincideTemario =
                    temarioActivo === 'todos' ||
                    ejercicio.temario_id === Number(temarioActivo);
                return estaAsignado && coincideTemario;
            })
            .map((ejercicio) => {
                const entrega = (reporte.entregas ?? []).find(
                    (item) =>
                        item.usuario_id === estudiante.id &&
                        item.ejercicio_id === ejercicio.id,
                );
                const actividadRegistrada = Boolean(
                    entrega?.estado_tablero?.trim() ||
                        entrega?.ultima_actividad,
                );
                const resuelto = Boolean(entrega?.completado);
                const vencido =
                    !resuelto &&
                    Boolean(ejercicio.fecha_limite) &&
                    new Date(`${ejercicio.fecha_limite}T23:59:59`) < hoy;
                const estado = resuelto
                    ? 'resueltos'
                    : actividadRegistrada
                      ? 'en_progreso'
                      : 'sin_iniciar';

                return {
                    ejercicio,
                    entrega,
                    estado,
                    vencido,
                };
            })
            .filter(({ ejercicio, entrega, estado, vencido }) => {
                if (estadoActivo === 'resueltos' && !entrega?.completado) {
                    return false;
                }
                if (estadoActivo === 'no_resueltos' && entrega?.completado) {
                    return false;
                }
                if (estadoActivo === 'en_progreso' && estado !== 'en_progreso') {
                    return false;
                }
                if (estadoActivo === 'sin_iniciar' && estado !== 'sin_iniciar') {
                    return false;
                }
                if (
                    estadoActivo === 'por_calificar' &&
                    (!entrega?.completado || entrega.calificado)
                ) {
                    return false;
                }
                if (
                    estadoActivo === 'calificados' &&
                    !entrega?.calificado
                ) {
                    return false;
                }
                if (estadoActivo === 'vencidos' && !vencido) return false;

                if (!fechaDesde && !fechaHasta) return true;
                if (criterioFecha === 'creacion') {
                    return dentroDelRango(
                        ejercicio.createdAt,
                        fechaDesde,
                        fechaHasta,
                    );
                }
                if (criterioFecha === 'limite') {
                    return dentroDelRango(
                        ejercicio.fecha_limite
                            ? `${ejercicio.fecha_limite}T12:00:00`
                            : null,
                        fechaDesde,
                        fechaHasta,
                    );
                }
                if (criterioFecha === 'entrega') {
                    return dentroDelRango(
                        entrega?.fecha_completado ?? null,
                        fechaDesde,
                        fechaHasta,
                    );
                }
                return dentroDelRango(
                    entrega?.ultima_actividad ?? null,
                    fechaDesde,
                    fechaHasta,
                );
            });
    }, [
        reporte,
        estudiante,
        temarioActivo,
        estadoActivo,
        criterioFecha,
        fechaDesde,
        fechaHasta,
    ]);

    if (!rolReporte) return null;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando detalle del estudiante..." />
            </AppShell>
        );
    }

    const queryRetorno = searchParams.toString();
    const rutaRetorno = `/grupos/${id}/reporte${
        queryRetorno ? `?${queryRetorno}` : ''
    }`;
    const temarioImpresion =
        temarioActivo === 'todos'
            ? 'Todos'
            : (reporte?.temarios.find(
                  (temario) => temario.id === Number(temarioActivo),
              )?.nombre ?? 'Temario seleccionado');
    const filtrosImpresion = [
        `Temario: ${temarioImpresion}`,
        `Estado: ${etiquetasEstado[estadoActivo]}`,
        `Fecha: ${etiquetasCriterioFecha[criterioFecha]}`,
        `Desde: ${fechaDesde || '—'}`,
        `Hasta: ${fechaHasta || '—'}`,
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
                    {reporte && estudiante && (
                        <>
                            <h1 className="mt-3 text-3xl font-bold text-white">
                                Detalle del estudiante
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                {estudiante.username} · código {estudiante.codigo}{' '}
                                · Grupo {reporte.grupo.nombre}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Inscrito: {formatearFecha(estudiante.fecha_union)}
                            </p>
                        </>
                    )}
                </div>

                {error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : !reporte ? null : !estudiante ? (
                    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                        <p className="text-gray-300">
                            No se encontró al estudiante inscrito en este grupo.
                        </p>
                        <Link
                            to={rutaRetorno}
                            className="mt-4 inline-flex rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-semibold text-black"
                        >
                            Volver al reporte
                        </Link>
                    </section>
                ) : (
                    <>
                        <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <label className="text-sm text-gray-300">
                                    Temario
                                    <select
                                        value={temarioActivo}
                                        onChange={(event) =>
                                            setTemarioActivo(event.target.value)
                                        }
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                    >
                                        <option value="todos">Todos</option>
                                        {reporte.temarios.map((temario) => (
                                            <option
                                                key={temario.id}
                                                value={temario.id}
                                            >
                                                {temario.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="text-sm text-gray-300">
                                    Estado
                                    <select
                                        value={estadoActivo}
                                        onChange={(event) =>
                                            setEstadoActivo(
                                                event.target.value as EstadoDetalle,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="resueltos">Resueltos</option>
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
                                        <option value="vencidos">Vencidos</option>
                                    </select>
                                </label>
                                <label className="text-sm text-gray-300">
                                    Filtrar fecha de
                                    <select
                                        value={criterioFecha}
                                        onChange={(event) =>
                                            setCriterioFecha(
                                                event.target.value as CriterioFecha,
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                    >
                                        <option value="creacion">
                                            Creación del ejercicio
                                        </option>
                                        <option value="limite">
                                            Fecha límite
                                        </option>
                                        <option value="entrega">
                                            Fecha de entrega
                                        </option>
                                        <option value="actividad">
                                            Última actividad
                                        </option>
                                    </select>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="text-sm text-gray-300">
                                        Desde
                                        <input
                                            type="date"
                                            value={fechaDesde}
                                            onChange={(event) =>
                                                setFechaDesde(event.target.value)
                                            }
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white"
                                        />
                                    </label>
                                    <label className="text-sm text-gray-300">
                                        Hasta
                                        <input
                                            type="date"
                                            value={fechaHasta}
                                            onChange={(event) =>
                                                setFechaHasta(event.target.value)
                                            }
                                            className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white"
                                        />
                                    </label>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setTemarioActivo('todos');
                                    setEstadoActivo('todos');
                                    setCriterioFecha('entrega');
                                    setFechaDesde('');
                                    setFechaHasta('');
                                }}
                                className="mt-3 text-sm text-[#FF9A3D] hover:text-white"
                            >
                                Limpiar filtros
                            </button>
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <TarjetaResumen
                                titulo="Ejercicios"
                                valor={ejerciciosConEstado.length}
                            />
                            <TarjetaResumen
                                titulo="Resueltos"
                                valor={
                                    ejerciciosConEstado.filter(
                                        (item) => item.entrega?.completado,
                                    ).length
                                }
                            />
                            <TarjetaResumen
                                titulo="En progreso"
                                valor={
                                    ejerciciosConEstado.filter(
                                        (item) => item.estado === 'en_progreso',
                                    ).length
                                }
                            />
                            <TarjetaResumen
                                titulo="Sin iniciar"
                                valor={
                                    ejerciciosConEstado.filter(
                                        (item) => item.estado === 'sin_iniciar',
                                    ).length
                                }
                            />
                            <TarjetaResumen
                                titulo="Por calificar"
                                valor={
                                    ejerciciosConEstado.filter(
                                        (item) =>
                                            item.entrega?.completado &&
                                            !item.entrega.calificado,
                                    ).length
                                }
                            />
                        </section>

                        <section className="reporte-seccion-impresion reporte-seccion-ejercicios-estudiante-impresion rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                            <header className="reporte-solo-impresion">
                                <h1>Ejercicios del estudiante</h1>
                                <p>
                                    Estudiante: {estudiante.username} · SIS{' '}
                                    {estudiante.codigo}
                                </p>
                                <p>Grupo: {reporte.grupo.nombre}</p>
                                <p>
                                    Generado:{' '}
                                    {new Date().toLocaleDateString('es-BO', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                                <p>Filtros: {filtrosImpresion}</p>
                                <p>
                                    Ejercicios incluidos:{' '}
                                    {ejerciciosConEstado.length}
                                </p>
                            </header>
                            <div className="ocultar-en-impresion flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Ejercicios del estudiante
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Los ejercicios sin entrega registrada se muestran
                                        como “Sin iniciar”.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        imprimirSeccionReporte(
                                            'ejercicios-estudiante',
                                        )
                                    }
                                    className="rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-bold text-black hover:brightness-110"
                                >
                                    Imprimir / guardar PDF
                                </button>
                            </div>

                            {ejerciciosConEstado.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    No hay ejercicios que coincidan con los filtros.
                                </p>
                            ) : (
                                <div className="mt-4 overflow-x-auto">
                                    <table className="w-full min-w-[1120px] border-separate border-spacing-y-2 text-left text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                <th className="px-3 py-2">
                                                    Ejercicio
                                                </th>
                                                <th className="px-3 py-2">
                                                    Estado
                                                </th>
                                                <th className="px-3 py-2">
                                                    Fecha límite
                                                </th>
                                                <th className="px-3 py-2">
                                                    Última actividad
                                                </th>
                                                <th className="px-3 py-2">
                                                    Fecha de entrega
                                                </th>
                                                <th className="px-3 py-2">
                                                    Calificación
                                                </th>
                                                <th className="ocultar-en-impresion px-3 py-2">
                                                    Solución
                                                </th>
                                                {usuario?.rol === 'profesor' && (
                                                    <th className="ocultar-en-impresion px-3 py-2">
                                                        Calificar
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ejerciciosConEstado.map(
                                                ({
                                                    ejercicio,
                                                    entrega,
                                                    estado,
                                                    vencido,
                                                }) => (
                                                    <tr
                                                        key={ejercicio.id}
                                                        className="bg-[#181818]"
                                                    >
                                                        <td className="rounded-l-xl px-3 py-3">
                                                            <span className="font-semibold text-white">
                                                                {ejercicio.titulo}
                                                            </span>
                                                            <span className="mt-1 block text-xs text-gray-500">
                                                                {ejercicio.temario}{' '}
                                                                ·{' '}
                                                                {ejercicio.tipo ===
                                                                'diagrama'
                                                                    ? 'Diagrama'
                                                                    : 'Pseudocódigo'}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <span
                                                                className={`rounded-full px-2.5 py-1 text-xs ${
                                                                    estado ===
                                                                    'resueltos'
                                                                        ? 'bg-emerald-500/10 text-emerald-300'
                                                                        : estado ===
                                                                            'en_progreso'
                                                                          ? 'bg-amber-500/10 text-amber-300'
                                                                          : 'bg-white/10 text-gray-300'
                                                                }`}
                                                            >
                                                                {estado ===
                                                                'resueltos'
                                                                    ? 'Resuelto'
                                                                    : estado ===
                                                                        'en_progreso'
                                                                      ? 'En progreso'
                                                                      : 'Sin iniciar'}
                                                            </span>
                                                            {vencido && (
                                                                <span className="ml-2 rounded-full bg-red-500/10 px-2.5 py-1 text-xs text-red-300">
                                                                    Vencido
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-400">
                                                            {formatearFecha(
                                                                ejercicio.fecha_limite,
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
                                                        <td className="ocultar-en-impresion px-3 py-3">
                                                            {entrega &&
                                                            (entrega.completado ||
                                                                Boolean(
                                                                    entrega.estado_tablero?.trim(),
                                                                )) ? (
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
                                                                    className="rounded-lg bg-[#FF7C02] px-3 py-1.5 text-xs font-semibold text-black hover:brightness-110"
                                                                >
                                                                    Revisar
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-500">
                                                                    Sin solución
                                                                </span>
                                                            )}
                                                        </td>
                                                        {usuario?.rol ===
                                                            'profesor' && (
                                                            <td className="ocultar-en-impresion rounded-r-xl px-3 py-3">
                                                                {entrega?.completado ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled={
                                                                            calificando
                                                                        }
                                                                        onClick={() =>
                                                                            void calificar(
                                                                                ejercicio.id,
                                                                                ejercicio.puntos,
                                                                            )
                                                                        }
                                                                        className="rounded-lg border border-[#FF7C02]/50 px-3 py-1.5 text-xs font-semibold text-[#FF9A3D] hover:bg-[#FF7C02]/10 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {calificando
                                                                            ? 'Guardando…'
                                                                            : entrega.calificado
                                                                              ? 'Editar'
                                                                              : 'Calificar'}
                                                                    </button>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">
                                                                        Disponible al entregar
                                                                    </span>
                                                                )}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ),
                                            )}
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

const TarjetaResumen = ({
    titulo,
    valor,
}: {
    titulo: string;
    valor: number;
}) => (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg">
        <p className="text-sm text-gray-400">{titulo}</p>
        <p className="mt-2 text-2xl font-extrabold text-white">{valor}</p>
    </article>
);

export default ReporteEstudianteGrupo;
