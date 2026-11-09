import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import {
    listarSolucionesEjercicio,
    calificarEntrega,
} from '../../api/gruposApi';
import type {
    DetalleSolucionesGrupo,
    SolucionEstudianteGrupo,
    TipoEjercicioGrupo,
} from '../../types/dominio';

// Página de Revisión de Entregas de un ejercicio de grupo (solo profesor).
// Ruta: /grupos/:id/ejercicios/:ejercicioId/revision
// Autocontenida: el enunciado, tipo y puntaje vienen del endpoint de soluciones.
export const RevisionEntregas = () => {
    const { id, ejercicioId: ejercicioIdParam } = useParams<{
        id: string;
        ejercicioId: string;
    }>();
    const grupoId = Number(id);
    const ejercicioId = Number(ejercicioIdParam);
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ejercicio, setEjercicio] = useState<{
        titulo: string;
        tipo: TipoEjercicioGrupo;
        puntos: number;
    } | null>(null);
    const [soluciones, setSoluciones] = useState<SolucionEstudianteGrupo[]>([]);
    const [notasLocales, setNotasLocales] = useState<Record<number, number>>(
        {}
    );
    const [guardandoNota, setGuardandoNota] = useState<Record<number, boolean>>(
        {}
    );
    const [mensajeExito, setMensajeExito] = useState<string | null>(null);

    const puntosMaximos = ejercicio?.puntos ?? 10;

    useEffect(() => {
        if (!claveAcceso || !ejercicioId) return;

        const cargar = async () => {
            setCargando(true);
            setError(null);
            setMensajeExito(null);
            try {
                const res: DetalleSolucionesGrupo =
                    await listarSolucionesEjercicio(claveAcceso, ejercicioId);
                setEjercicio({
                    titulo: res.ejercicio.titulo,
                    tipo: res.ejercicio.tipo,
                    puntos: Number(res.ejercicio.puntos),
                });
                setSoluciones(res.soluciones);
                const notasInit: Record<number, number> = {};
                res.soluciones.forEach((sol) => {
                    notasInit[sol.usuario.id] = sol.puntos ?? 0;
                });
                setNotasLocales(notasInit);
            } catch (err: any) {
                setError(
                    err.response?.data?.message ||
                        'Error al cargar las soluciones de los estudiantes.'
                );
            } finally {
                setCargando(false);
            }
        };

        cargar();
    }, [claveAcceso, ejercicioId]);

    const handleNotaChange = (estudianteId: number, valor: number) => {
        const valNormalizado = Math.max(0, Math.min(puntosMaximos, valor));
        setNotasLocales((prev) => ({
            ...prev,
            [estudianteId]: valNormalizado,
        }));
    };

    const handleGuardarNota = async (estudianteId: number) => {
        if (!claveAcceso) return;
        const nota = notasLocales[estudianteId] ?? 0;
        setGuardandoNota((prev) => ({ ...prev, [estudianteId]: true }));
        setError(null);
        setMensajeExito(null);
        try {
            await calificarEntrega(
                claveAcceso,
                ejercicioId,
                estudianteId,
                nota
            );
            setSoluciones((prev) =>
                prev.map((s) =>
                    s.usuario.id === estudianteId ? { ...s, puntos: nota } : s
                )
            );
            setMensajeExito(
                `Nota guardada correctamente (${nota}/${puntosMaximos} pts).`
            );
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                    'Error al guardar la nota del estudiante.'
            );
        } finally {
            setGuardandoNota((prev) => ({ ...prev, [estudianteId]: false }));
        }
    };

    const handleVerSolucion = (estudianteId: number) => {
        const rutaTablero = `/grupos/${grupoId}/ejercicios/${ejercicioId}/${ejercicio?.tipo ?? 'pseudocodigo'}?revisarEstudiante=${estudianteId}`;
        navigate(rutaTablero);
    };

    return (
        <AppShell>
            <div className="p-4 sm:p-6">
                <div className="max-w-5xl mx-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
                        <div>
                            <button
                                type="button"
                                onClick={() => navigate(`/grupos/${grupoId}`)}
                                className="text-xs font-semibold text-slate-400 hover:text-white transition"
                            >
                                ← Volver al Grupo
                            </button>
                            <h2 className="text-xl font-bold text-sky-400 mt-2">
                                Revisar Entregas: {ejercicio?.titulo ?? '…'}
                            </h2>
                            <p className="text-xs text-slate-400 mt-1">
                                Tipo:{' '}
                                <span className="uppercase font-semibold text-slate-300">
                                    {ejercicio?.tipo ?? '—'}
                                </span>{' '}
                                | Puntaje máximo:{' '}
                                <span className="font-semibold text-amber-400">
                                    {puntosMaximos} pts
                                </span>
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 rounded-lg bg-red-900/40 border border-red-700 p-3 text-sm text-red-200">
                            {error}
                        </div>
                    )}

                    {mensajeExito && (
                        <div className="mt-4 rounded-lg bg-emerald-900/40 border border-emerald-700 p-3 text-sm text-emerald-200">
                            {mensajeExito}
                        </div>
                    )}

                    <div className="mt-4 overflow-x-auto">
                        {cargando ? (
                            <div className="py-12 text-center text-slate-400">
                                Cargando entregas de los estudiantes...
                            </div>
                        ) : soluciones.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                                No hay estudiantes inscritos en este grupo aún.
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm text-slate-300 min-w-[640px]">
                                <thead className="bg-slate-800 text-xs uppercase tracking-wider text-slate-400">
                                    <tr>
                                        <th className="py-3 px-4 rounded-l-lg">
                                            Estudiante
                                        </th>
                                        <th className="py-3 px-4">Código</th>
                                        <th className="py-3 px-4">Estado</th>
                                        <th className="py-3 px-4">Solución</th>
                                        <th className="py-3 px-4 text-center">
                                            Calificación (0 - {puntosMaximos})
                                        </th>
                                        <th className="py-3 px-4 rounded-r-lg text-right">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {soluciones.map((sol) => (
                                        <tr
                                            key={sol.usuario.id}
                                            className="hover:bg-slate-800/40"
                                        >
                                            <td className="py-3 px-4 font-semibold text-white">
                                                {sol.usuario.username}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                                                {sol.usuario.codigo}
                                            </td>
                                            <td className="py-3 px-4">
                                                {sol.completado ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                                                        Entregado
                                                    </span>
                                                ) : sol.tieneSolucion ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-900/60 text-amber-300 border border-amber-700">
                                                        En progreso
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                                                        Sin iniciar
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleVerSolucion(
                                                            sol.usuario.id
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-500 text-white transition"
                                                >
                                                    👁️ Ver Tablero
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="inline-flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={puntosMaximos}
                                                        value={
                                                            notasLocales[
                                                                sol.usuario.id
                                                            ] ?? 0
                                                        }
                                                        onChange={(e) =>
                                                            handleNotaChange(
                                                                sol.usuario.id,
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        className="w-16 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-center font-bold text-amber-300 focus:border-amber-400 focus:outline-none"
                                                    />
                                                    <span className="text-xs text-slate-400">
                                                        / {puntosMaximos}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    type="button"
                                                    disabled={
                                                        guardandoNota[
                                                            sol.usuario.id
                                                        ]
                                                    }
                                                    onClick={() =>
                                                        handleGuardarNota(
                                                            sol.usuario.id
                                                        )
                                                    }
                                                    className="rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition disabled:opacity-50"
                                                >
                                                    {guardandoNota[
                                                        sol.usuario.id
                                                    ]
                                                        ? 'Guardando...'
                                                        : 'Asignar Nota'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* <div className="mt-6 flex justify-end border-t border-slate-800 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/grupos/${grupoId}`)}
                            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-700 transition"
                        >
                            Volver al Grupo
                        </button>
                    </div> */}
                </div>
            </div>
        </AppShell>
    );
};
