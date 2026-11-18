import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { obtenerReporteGrupo } from '../../api/reportesApi';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import type { MetricasProgresoGrupo, ReporteGrupo } from '../../types/dominio';
import { formatearFechaHora, formatearNumero } from '../../utils/fechas';

const METRICAS_VACIAS: MetricasProgresoGrupo = {
    ejerciciosTotales: 0,
    completados: 0,
    enProgreso: 0,
    sinIniciar: 0,
    calificados: 0,
    pendientesCalificar: 0,
    puntosCalificados: 0,
    puntosMaximosCalificados: 0,
    avancePorcentaje: 0,
    ultimaActividad: null,
};

type EstadoReporte =
    | 'todos'
    | 'resueltos'
    | 'no_resueltos'
    | 'en_progreso'
    | 'sin_iniciar'
    | 'por_calificar'
    | 'calificados'
    | 'vencidos';

type CriterioFecha =
    | 'creacion'
    | 'limite'
    | 'entrega'
    | 'actividad'
    | 'inscripcion';

const inicioDia = (fecha: string) => {
    if (!fecha) return null;
    const valor = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(valor.getTime()) ? null : valor;
};

const finDia = (fecha: string) => {
    if (!fecha) return null;
    const valor = new Date(`${fecha}T23:59:59`);
    return Number.isNaN(valor.getTime()) ? null : valor;
};

const fechaEnRango = (
    valor: string | null,
    desde: string,
    hasta: string,
) => {
    if (!valor) return false;
    if (!desde && !hasta) return true;
    const fecha = new Date(valor);
    if (Number.isNaN(fecha.getTime())) return false;
    const limiteDesde = inicioDia(desde);
    const limiteHasta = finDia(hasta);
    return (
        (!limiteDesde || fecha >= limiteDesde) &&
        (!limiteHasta || fecha <= limiteHasta)
    );
};

const ReporteGrupoPage = () => {
    const { id } = useParams<{ id: string }>();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();
    const cerrarSesion = useCerrarSesion();

    const [reporte, setReporte] = useState<ReporteGrupo | null>(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [temarioActivo, setTemarioActivo] = useState('todos');
    const [tipoActivo, setTipoActivo] = useState<'todos' | 'diagrama' | 'pseudocodigo'>(
        'todos',
    );
    const [estadoActivo, setEstadoActivo] =
        useState<EstadoReporte>('todos');
    const [busqueda, setBusqueda] = useState('');
    const [criterioFecha, setCriterioFecha] =
        useState<CriterioFecha>('entrega');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState<
        number | null
    >(null);
    const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<
        number | null
    >(null);
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
                if (activo) {
                    setReporte(datos);
                    setTemarioActivo('todos');
                }
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
                        'No se pudo cargar el reporte del grupo',
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

    const ejerciciosVisibles = useMemo(
        () => {
            if (!reporte) return [];
            const entregas = reporte.entregas ?? [];
            const estudiantes = reporte.estudiantes;
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            return reporte.ejercicios.filter((ejercicio) => {
                if (
                    temarioActivo !== 'todos' &&
                    ejercicio.temario_id !== Number(temarioActivo)
                ) {
                    return false;
                }
                if (
                    tipoActivo !== 'todos' &&
                    ejercicio.tipo !== tipoActivo
                ) {
                    return false;
                }

                if (estadoActivo === 'resueltos' && ejercicio.completados === 0) {
                    return false;
                }
                if (
                    estadoActivo === 'no_resueltos' &&
                    ejercicio.sinIniciar + ejercicio.enProgreso === 0
                ) {
                    return false;
                }
                if (
                    estadoActivo === 'en_progreso' &&
                    ejercicio.enProgreso === 0
                ) {
                    return false;
                }
                if (
                    estadoActivo === 'sin_iniciar' &&
                    ejercicio.sinIniciar === 0
                ) {
                    return false;
                }
                if (
                    estadoActivo === 'por_calificar' &&
                    ejercicio.pendientesCalificar === 0
                ) {
                    return false;
                }
                if (estadoActivo === 'calificados' && ejercicio.calificados === 0) {
                    return false;
                }
                if (estadoActivo === 'vencidos') {
                    if (!ejercicio.fecha_limite) return false;
                    const limite = new Date(`${ejercicio.fecha_limite}T23:59:59`);
                    if (limite >= hoy) return false;
                }

                if (!fechaDesde && !fechaHasta) return true;
                if (criterioFecha === 'creacion') {
                    return fechaEnRango(
                        ejercicio.createdAt,
                        fechaDesde,
                        fechaHasta,
                    );
                }
                if (criterioFecha === 'limite') {
                    return ejercicio.fecha_limite
                        ? fechaEnRango(
                              `${ejercicio.fecha_limite}T23:59:59`,
                              fechaDesde,
                              fechaHasta,
                          )
                        : false;
                }
                if (criterioFecha === 'entrega') {
                    return entregas.some(
                        (entrega) =>
                            entrega.ejercicio_id === ejercicio.id &&
                            entrega.completado &&
                            fechaEnRango(
                                entrega.fecha_completado,
                                fechaDesde,
                                fechaHasta,
                            ),
                    );
                }
                if (criterioFecha === 'actividad') {
                    return entregas.some(
                        (entrega) =>
                            entrega.ejercicio_id === ejercicio.id &&
                            fechaEnRango(
                                entrega.ultima_actividad,
                                fechaDesde,
                                fechaHasta,
                            ),
                    );
                }
                const inscripcionesEnRango = estudiantes.some(
                    (estudiante) =>
                        fechaEnRango(
                            estudiante.fecha_union,
                            fechaDesde,
                            fechaHasta,
                        ) &&
                        entregas.some(
                            (entrega) =>
                                entrega.usuario_id === estudiante.id &&
                                entrega.ejercicio_id === ejercicio.id,
                        ),
                );
                return inscripcionesEnRango;
            });
        },
        [
            reporte,
            temarioActivo,
            tipoActivo,
            estadoActivo,
            criterioFecha,
            fechaDesde,
            fechaHasta,
        ],
    );

    const estudiantesVisibles = useMemo(
        () => {
            const hoy = new Date();
            hoy.setHours(23, 59, 59, 999);

            return (reporte?.estudiantes ?? [])
                .map((estudiante) => ({
                    ...estudiante,
                    metricas:
                        temarioActivo === 'todos'
                            ? estudiante
                            : (estudiante.porTemario.find(
                                  (temario) =>
                                      temario.temario_id ===
                                      Number(temarioActivo),
                              ) ?? METRICAS_VACIAS),
                }))
                .filter((estudiante) => {
                    const texto = `${estudiante.username} ${estudiante.codigo}`.toLowerCase();
                    if (
                        busqueda.trim() &&
                        !texto.includes(busqueda.trim().toLowerCase())
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'resueltos' &&
                        estudiante.metricas.completados === 0
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'no_resueltos' &&
                        estudiante.metricas.completados ===
                            estudiante.metricas.ejerciciosTotales
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'en_progreso' &&
                        estudiante.metricas.enProgreso === 0
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'sin_iniciar' &&
                        estudiante.metricas.sinIniciar === 0
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'por_calificar' &&
                        estudiante.metricas.pendientesCalificar === 0
                    ) {
                        return false;
                    }
                    if (
                        estadoActivo === 'calificados' &&
                        estudiante.metricas.calificados === 0
                    ) {
                        return false;
                    }
                    if (estadoActivo === 'vencidos') {
                        const tieneVencido = ejerciciosVisibles.some(
                            (ejercicio) => {
                                if (!ejercicio.fecha_limite) return false;
                                const limite = new Date(
                                    `${ejercicio.fecha_limite}T23:59:59`,
                                );
                                if (limite >= hoy) return false;
                                const entrega = (reporte?.entregas ?? []).find(
                                    (item) =>
                                        item.usuario_id === estudiante.id &&
                                        item.ejercicio_id === ejercicio.id,
                                );
                                return !entrega?.completado;
                            },
                        );
                        if (!tieneVencido) return false;
                    }

                    if (!fechaDesde && !fechaHasta) return true;
                    if (criterioFecha === 'inscripcion') {
                        return fechaEnRango(
                            estudiante.fecha_union,
                            fechaDesde,
                            fechaHasta,
                        );
                    }
                    const entregasEstudiante = (reporte?.entregas ?? []).filter(
                        (entrega) => entrega.usuario_id === estudiante.id,
                    );
                    if (criterioFecha === 'entrega') {
                        return entregasEstudiante.some(
                            (entrega) =>
                                entrega.completado &&
                                fechaEnRango(
                                    entrega.fecha_completado,
                                    fechaDesde,
                                    fechaHasta,
                                ),
                        );
                    }
                    if (criterioFecha === 'actividad') {
                        return entregasEstudiante.some((entrega) =>
                            fechaEnRango(
                                entrega.ultima_actividad,
                                fechaDesde,
                                fechaHasta,
                            ),
                        );
                    }
                    if (criterioFecha === 'creacion') {
                        return ejerciciosVisibles.some((ejercicio) =>
                            fechaEnRango(
                                ejercicio.createdAt,
                                fechaDesde,
                                fechaHasta,
                            ),
                        );
                    }
                    return ejerciciosVisibles.some(
                        (ejercicio) =>
                            ejercicio.fecha_limite &&
                            fechaEnRango(
                                `${ejercicio.fecha_limite}T23:59:59`,
                                fechaDesde,
                                fechaHasta,
                            ),
                    );
                });
        },
        [
            reporte,
            temarioActivo,
            busqueda,
            estadoActivo,
            criterioFecha,
            fechaDesde,
            fechaHasta,
            ejerciciosVisibles,
        ],
    );

    const resumenVisible = useMemo(() => {
        const completados = estudiantesVisibles.reduce(
            (total, estudiante) => total + estudiante.metricas.completados,
            0,
        );
        const enProgreso = estudiantesVisibles.reduce(
            (total, estudiante) => total + estudiante.metricas.enProgreso,
            0,
        );
        const pendientesCalificar = estudiantesVisibles.reduce(
            (total, estudiante) =>
                total + estudiante.metricas.pendientesCalificar,
            0,
        );
        const tareasPosibles =
            estudiantesVisibles.length * ejerciciosVisibles.length;

        return {
            completados,
            pendientesCalificar,
            avancePorcentaje: tareasPosibles
                ? Math.round((completados / tareasPosibles) * 100)
                : 0,
            enProgreso,
            sinIniciar: tareasPosibles - completados - enProgreso,
        };
    }, [estudiantesVisibles, ejerciciosVisibles]);

    if (!rolReporte) return null;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando reporte del grupo..." />
            </AppShell>
        );
    }

    const volverA =
        rolReporte === 'admin' ? '/admin?tab=grupos' : `/grupos/${id}`;

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
                <div>
                    <Link
                        to={volverA}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Volver
                    </Link>
                    {reporte && (
                        <>
                            <h1 className="mt-3 text-3xl font-bold text-white">
                                Reporte: {reporte.grupo.nombre}
                            </h1>
                            <p className="mt-1 text-sm text-gray-400">
                                Profesor: {reporte.grupo.profesor.username}
                            </p>
                        </>
                    )}
                </div>

                {error ? (
                    <p className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-sm text-red-300">
                        {error}
                    </p>
                ) : reporte ? (
                    <>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-400">
                                El reporte incluye únicamente los ejercicios de
                                este grupo.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setTemarioActivo('todos');
                                    setTipoActivo('todos');
                                    setEstadoActivo('todos');
                                    setBusqueda('');
                                    setCriterioFecha('entrega');
                                    setFechaDesde('');
                                    setFechaHasta('');
                                    setEjercicioSeleccionado(null);
                                    setEstudianteSeleccionado(null);
                                }}
                                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 hover:border-[#FF7C02]/50 hover:text-white"
                            >
                                Limpiar filtros
                            </button>
                        </div>

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
                                    Tipo
                                    <select
                                        value={tipoActivo}
                                        onChange={(event) =>
                                            setTipoActivo(
                                                event.target.value as
                                                    | 'todos'
                                                    | 'diagrama'
                                                    | 'pseudocodigo',
                                            )
                                        }
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="diagrama">Diagrama</option>
                                        <option value="pseudocodigo">
                                            Pseudocódigo
                                        </option>
                                    </select>
                                </label>
                                <label className="text-sm text-gray-300">
                                    Estado
                                    <select
                                        value={estadoActivo}
                                        onChange={(event) =>
                                            setEstadoActivo(
                                                event.target.value as EstadoReporte,
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
                                    Buscar estudiante
                                    <input
                                        value={busqueda}
                                        onChange={(event) =>
                                            setBusqueda(event.target.value)
                                        }
                                        placeholder="Nombre o código"
                                        className="mt-1 w-full rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white placeholder:text-gray-600 focus:border-[#FF7C02] focus:outline-none"
                                    />
                                </label>
                            </div>
                            <div className="mt-3 grid gap-3 md:grid-cols-3">
                                <label className="text-sm text-gray-300">
                                    Filtrar por fecha
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
                                        <option value="inscripcion">
                                            Inscripción
                                        </option>
                                    </select>
                                </label>
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
                        </section>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <TarjetaReporte
                                titulo="Estudiantes"
                                valor={formatearNumero(
                                    estudiantesVisibles.length,
                                )}
                                detalle="Inscritos en el grupo"
                            />
                            <TarjetaReporte
                                titulo="Ejercicios"
                                valor={formatearNumero(
                                    ejerciciosVisibles.length,
                                )}
                                detalle="En el filtro seleccionado"
                            />
                            <TarjetaReporte
                                titulo="Avance"
                                valor={`${resumenVisible.avancePorcentaje}%`}
                                detalle={`${resumenVisible.completados} entregas completadas`}
                            />
                            <TarjetaReporte
                                titulo="Por calificar"
                                valor={formatearNumero(
                                    resumenVisible.pendientesCalificar,
                                )}
                                detalle="Entregadas y pendientes de revisión"
                            />
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Avance por estudiante
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-400">
                                        Entregar y calificar se muestran por
                                        separado. Los puntos corresponden solo
                                        a ejercicios calificados.
                                    </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {resumenVisible.enProgreso} en progreso ·{' '}
                                    {resumenVisible.sinIniciar} sin iniciar
                                </span>
                            </div>

                            {estudiantesVisibles.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    Todavía no hay estudiantes inscritos en este
                                    grupo.
                                </p>
                            ) : (
                                <div className="mt-5 overflow-x-auto">
                                    <table className="w-full min-w-[850px] border-separate border-spacing-y-2 text-left text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                <th className="px-3 py-2">
                                                    Estudiante
                                                </th>
                                                <th className="px-3 py-2">
                                                    Progreso
                                                </th>
                                                <th className="px-3 py-2">
                                                    Estado de entregas
                                                </th>
                                                <th className="px-3 py-2">
                                                    Calificación
                                                </th>
                                                <th className="px-3 py-2">
                                                    Última actividad
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {estudiantesVisibles.map(
                                                ({
                                                    id: estudianteId,
                                                    username,
                                                    codigo,
                                                    metricas,
                                                }) => (
                                                    <tr
                                                        key={estudianteId}
                                                        className="bg-[#181818]"
                                                    >
                                                        <td className="rounded-l-xl px-3 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setEstudianteSeleccionado(
                                                                        estudianteId,
                                                                    )
                                                                }
                                                                className="font-semibold text-white hover:text-[#FF7C02]"
                                                            >
                                                                {username}
                                                            </button>
                                                            <span className="mt-1 block font-mono text-xs text-gray-500">
                                                                {codigo}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-24 overflow-hidden rounded-full bg-white/10">
                                                                    <div
                                                                        className="h-full rounded-full bg-[#FF7C02]"
                                                                        style={{
                                                                            width: `${metricas.avancePorcentaje}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-gray-300">
                                                                    {metricas.completados}/
                                                                    {metricas.ejerciciosTotales}{' '}
                                                                    (
                                                                    {metricas.avancePorcentaje}
                                                                    %)
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-300">
                                                            {metricas.enProgreso}{' '}
                                                            en progreso ·{' '}
                                                            {metricas.sinIniciar}{' '}
                                                            sin iniciar
                                                        </td>
                                                        <td className="px-3 py-3 text-xs text-gray-300">
                                                            {metricas.calificados}/
                                                            {metricas.ejerciciosTotales}{' '}
                                                            calificados ·{' '}
                                                            {metricas.puntosCalificados}
                                                            /
                                                            {metricas.puntosMaximosCalificados}{' '}
                                                            pts
                                                        </td>
                                                        <td className="rounded-r-xl px-3 py-3 text-xs text-gray-400">
                                                            {formatearFechaHora(
                                                                metricas.ultimaActividad,
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                            <h2 className="text-xl font-bold text-white">
                                Avance por ejercicio
                            </h2>
                            {ejerciciosVisibles.length === 0 ? (
                                <p className="mt-5 rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-gray-400">
                                    No hay ejercicios en el temario seleccionado.
                                </p>
                            ) : (
                                <div className="mt-5 overflow-x-auto">
                                    <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                                        <thead>
                                            <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                <th className="px-3 py-2">
                                                    Ejercicio
                                                </th>
                                                <th className="px-3 py-2">
                                                    Puntaje máx.
                                                </th>
                                                <th className="px-3 py-2">
                                                    Entregados
                                                </th>
                                                <th className="px-3 py-2">
                                                    En progreso
                                                </th>
                                                <th className="px-3 py-2">
                                                    Sin iniciar
                                                </th>
                                                <th className="px-3 py-2">
                                                    Por calificar
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ejerciciosVisibles.map(
                                                (ejercicio) => (
                                                    <tr
                                                        key={ejercicio.id}
                                                        className="bg-[#181818]"
                                                    >
                                                        <td className="rounded-l-xl px-3 py-3">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setEjercicioSeleccionado(
                                                                        ejercicio.id,
                                                                    )
                                                                }
                                                                className="font-semibold text-white hover:text-[#FF7C02]"
                                                            >
                                                                {ejercicio.titulo}
                                                            </button>
                                                            <span className="mt-1 block text-xs text-gray-500">
                                                                {ejercicio.temario}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-[#FF7C02]">
                                                            {ejercicio.puntos} pts
                                                        </td>
                                                        <td className="px-3 py-3 text-emerald-300">
                                                            {ejercicio.completados}
                                                        </td>
                                                        <td className="px-3 py-3 text-amber-300">
                                                            {ejercicio.enProgreso}
                                                        </td>
                                                        <td className="px-3 py-3 text-gray-400">
                                                            {ejercicio.sinIniciar}
                                                        </td>
                                                        <td className="rounded-r-xl px-3 py-3 text-sky-300">
                                                            {ejercicio.pendientesCalificar}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {ejercicioSeleccionado !== null && (
                            (() => {
                                const ejercicio = reporte.ejercicios.find(
                                    (item) => item.id === ejercicioSeleccionado,
                                );
                                if (!ejercicio) return null;
                                const hoy = new Date();
                                hoy.setHours(23, 59, 59, 999);
                                const vencido =
                                    Boolean(ejercicio.fecha_limite) &&
                                    new Date(
                                        `${ejercicio.fecha_limite}T23:59:59`,
                                    ) < hoy;

                                return (
                                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    Estudiantes: {ejercicio.titulo}
                                                </h2>
                                                <p className="mt-1 text-sm text-gray-400">
                                                    {ejercicio.temario} ·{' '}
                                                    {ejercicio.tipo === 'diagrama'
                                                        ? 'Diagrama'
                                                        : 'Pseudocódigo'}{' '}
                                                    · {ejercicio.puntos} pts
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEjercicioSeleccionado(null)
                                                }
                                                className="text-sm text-gray-400 hover:text-white"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                        <div className="mt-4 grid gap-2 sm:grid-cols-4">
                                            <span className="rounded-xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                                                Resolvieron: {ejercicio.completados}
                                            </span>
                                            <span className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
                                                En progreso: {ejercicio.enProgreso}
                                            </span>
                                            <span className="rounded-xl bg-white/5 px-3 py-2 text-sm text-gray-300">
                                                Sin iniciar: {ejercicio.sinIniciar}
                                            </span>
                                            <span className="rounded-xl bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
                                                Por calificar:{' '}
                                                {ejercicio.pendientesCalificar}
                                            </span>
                                        </div>
                                        <div className="mt-4 overflow-x-auto">
                                            <table className="w-full min-w-[700px] border-separate border-spacing-y-2 text-left text-sm">
                                                <thead>
                                                    <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                        <th className="px-3 py-2">Estudiante</th>
                                                        <th className="px-3 py-2">Estado</th>
                                                        <th className="px-3 py-2">Entrega</th>
                                                        <th className="px-3 py-2">Calificación</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reporte.estudiantes.map((estudiante) => {
                                                        const entrega = (reporte.entregas ?? []).find(
                                                            (item) =>
                                                                item.usuario_id === estudiante.id &&
                                                                item.ejercicio_id === ejercicio.id,
                                                        );
                                                        let estado = 'Sin iniciar';
                                                        if (entrega?.calificado) estado = 'Calificado';
                                                        else if (entrega?.completado) estado = 'Entregado';
                                                        else if (entrega) estado = 'En progreso';
                                                        else if (vencido) estado = 'Vencido sin entregar';

                                                        return (
                                                            <tr
                                                                key={estudiante.id}
                                                                className="bg-[#181818]"
                                                            >
                                                                <td className="rounded-l-xl px-3 py-3">
                                                                    <span className="font-semibold text-white">
                                                                        {estudiante.username}
                                                                    </span>
                                                                    <span className="mt-1 block font-mono text-xs text-gray-500">
                                                                        {estudiante.codigo}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-3 text-gray-300">
                                                                    {estado}
                                                                </td>
                                                                <td className="px-3 py-3 text-xs text-gray-400">
                                                                    {formatearFechaHora(
                                                                        entrega?.fecha_completado ??
                                                                            null,
                                                                    )}
                                                                </td>
                                                                <td className="rounded-r-xl px-3 py-3 text-xs text-gray-300">
                                                                    {entrega?.calificado
                                                                        ? `${entrega.puntos_profesor ?? 0}/${ejercicio.puntos} pts`
                                                                        : 'Pendiente'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                );
                            })()
                        )}

                        {estudianteSeleccionado !== null && (
                            (() => {
                                const estudiante = reporte.estudiantes.find(
                                    (item) => item.id === estudianteSeleccionado,
                                );
                                if (!estudiante) return null;

                                return (
                                    <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    Ejercicios: {estudiante.username}
                                                </h2>
                                                <p className="mt-1 font-mono text-xs text-gray-500">
                                                    {estudiante.codigo}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEstudianteSeleccionado(null)
                                                }
                                                className="text-sm text-gray-400 hover:text-white"
                                            >
                                                Cerrar
                                            </button>
                                        </div>
                                        <div className="mt-4 overflow-x-auto">
                                            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                                                <thead>
                                                    <tr className="text-xs uppercase tracking-wider text-gray-400">
                                                        <th className="px-3 py-2">Ejercicio</th>
                                                        <th className="px-3 py-2">Estado</th>
                                                        <th className="px-3 py-2">Última actividad</th>
                                                        <th className="px-3 py-2">Entrega</th>
                                                        <th className="px-3 py-2">Puntaje</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {ejerciciosVisibles.map((ejercicio) => {
                                                        const entrega = (reporte.entregas ?? []).find(
                                                            (item) =>
                                                                item.usuario_id === estudiante.id &&
                                                                item.ejercicio_id === ejercicio.id,
                                                        );
                                                        let estado = 'Sin iniciar';
                                                        if (entrega?.calificado) estado = 'Calificado';
                                                        else if (entrega?.completado) estado = 'Entregado';
                                                        else if (entrega) estado = 'En progreso';

                                                        return (
                                                            <tr
                                                                key={ejercicio.id}
                                                                className="bg-[#181818]"
                                                            >
                                                                <td className="rounded-l-xl px-3 py-3">
                                                                    <span className="font-semibold text-white">
                                                                        {ejercicio.titulo}
                                                                    </span>
                                                                    <span className="mt-1 block text-xs text-gray-500">
                                                                        {ejercicio.temario}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-3 text-gray-300">
                                                                    {estado}
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
                                                                    )}
                                                                </td>
                                                                <td className="rounded-r-xl px-3 py-3 text-xs text-[#FF7C02]">
                                                                    {entrega?.calificado
                                                                        ? `${entrega.puntos_profesor ?? 0}/${ejercicio.puntos}`
                                                                        : 'Pendiente'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                );
                            })()
                        )}
                    </>
                ) : null}
            </main>
        </AppShell>
    );
};

const TarjetaReporte = ({
    titulo,
    valor,
    detalle,
}: {
    titulo: string;
    valor: string;
    detalle: string;
}) => (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg">
        <p className="text-sm text-gray-400">{titulo}</p>
        <p className="mt-2 text-3xl font-extrabold text-white">{valor}</p>
        <p className="mt-1 text-xs text-gray-500">{detalle}</p>
    </article>
);

export default ReporteGrupoPage;
