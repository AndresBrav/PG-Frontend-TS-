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
        () =>
            !reporte
                ? []
                : temarioActivo === 'todos'
                  ? reporte.ejercicios
                  : reporte.ejercicios.filter(
                        (ejercicio) =>
                            ejercicio.temario_id === Number(temarioActivo),
                    ),
        [reporte, temarioActivo],
    );

    const estudiantesVisibles = useMemo(
        () =>
            (reporte?.estudiantes ?? []).map((estudiante) => ({
                ...estudiante,
                metricas:
                    temarioActivo === 'todos'
                        ? estudiante
                        : (estudiante.porTemario.find(
                              (temario) =>
                                  temario.temario_id ===
                                  Number(temarioActivo),
                          ) ?? METRICAS_VACIAS),
            })),
        [reporte, temarioActivo],
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
                            <label className="flex items-center gap-3 text-sm text-gray-300">
                                Temario
                                <select
                                    value={temarioActivo}
                                    onChange={(event) =>
                                        setTemarioActivo(event.target.value)
                                    }
                                    className="rounded-xl border border-white/10 bg-[#181818] px-3 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
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
                        </div>

                        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <TarjetaReporte
                                titulo="Estudiantes"
                                valor={formatearNumero(
                                    reporte.resumen.estudiantes,
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
                                                            <span className="font-semibold text-white">
                                                                {username}
                                                            </span>
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
                                                            <span className="font-semibold text-white">
                                                                {ejercicio.titulo}
                                                            </span>
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
