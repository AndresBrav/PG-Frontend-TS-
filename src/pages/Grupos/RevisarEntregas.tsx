import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    calificarEntregaGrupo,
    listarSolucionesEjercicio,
} from '../../api/gruposApi';
import type { EntregaGrupo } from '../../types/dominio';
import { formatearFechaHora } from '../../utils/fechas';

/**
 * /profesor/grupos/:id/ejercicios/:ejercicioId/revisar — PÁGINA de
 * revisión (no modal): lista las entregas de ese ejercicio y permite
 * calificar (puntos 0-100) y comentar SOLO esa entrega del par
 * (ejercicio, estudiante). La solución del estudiante se abre en el
 * tablero en modo solo lectura.
 */
const RevisarEntregas = () => {
    const { id, ejercicioId } = useParams<{
        id: string;
        ejercicioId: string;
    }>();
    const [params] = useSearchParams();
    const tipoTablero = params.get('tipo') === 'diagrama' ? 'diagrama' : 'pseudocodigo';
    const { claveAcceso } = useContext(TokenContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [entregas, setEntregas] = useState<EntregaGrupo[]>([]);

    const cargar = async () => {
        if (!claveAcceso || !ejercicioId) return;
        setCargando(true);
        try {
            const lista = await listarSolucionesEjercicio(
                claveAcceso,
                ejercicioId,
            );
            setEntregas(lista);
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            const mensaje = obtenerMensajeError(
                error,
                'No se pudieron cargar las entregas',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        void cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claveAcceso, ejercicioId]);

    const calificar = async (entrega: EntregaGrupo) => {
        if (!claveAcceso) return;

        const { value } = await Swal.fire({
            title: `Calificar a ${entrega.estudiante.username}`,
            html: `
                <input id="puntos" type="number" min="0" max="100"
                    value="${entrega.puntos_profesor ?? 0}"
                    class="swal2-input" placeholder="Puntos (0-100)">
                <textarea id="comentario" class="swal2-textarea"
                    placeholder="Comentario (opcional)">${
                    entrega.comentario_profesor ?? ''
                }</textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Calificar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const puntos = Number(
                    (document.getElementById('puntos') as HTMLInputElement)
                        ?.value,
                );
                const comentario = (
                    document.getElementById(
                        'comentario',
                    ) as HTMLTextAreaElement
                )?.value;
                if (!Number.isInteger(puntos) || puntos < 0 || puntos > 100) {
                    Swal.showValidationMessage(
                        'Los puntos deben ser un entero entre 0 y 100',
                    );
                    return null;
                }
                return { puntos, comentario: comentario ?? '' };
            },
        });

        if (value === null) return;

        try {
            await calificarEntregaGrupo(
                claveAcceso,
                ejercicioId ?? '',
                entrega.usuario_id,
                value.puntos,
                value.comentario.trim() || null,
            );
            await Swal.fire({
                icon: 'success',
                title: 'Calificación enviada',
                text: 'El estudiante recibió una notificación.',
                timer: 1500,
                showConfirmButton: false,
            });
            void cargar();
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo calificar',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        }
    };

    if (!id || !ejercicioId) return null;

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando entregas..." />
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-4xl px-4 py-8">
                <Link
                    to={`/grupos/${id}`}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Volver al grupo
                </Link>
                <h1 className="mb-1 text-3xl font-bold text-white">
                    Entregas del ejercicio
                </h1>
                <p className="mb-6 text-sm text-gray-500">
                    Cada fila es la entrega de UN estudiante en ESTE
                    ejercicio (calificar aquí no afecta a otros
                    ejercicios).
                </p>

                <div className="grid gap-3">
                    {entregas.map((entrega) => (
                        <div
                            key={entrega.id}
                            className="rounded-2xl border border-white/10 bg-white/5 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-bold text-white">
                                            {entrega.estudiante.username}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            · {entrega.estudiante.codigo}
                                        </span>
                                        {entrega.completado ? (
                                            <span className="rounded-full bg-emerald-400/10 px-3 py-0.5 text-xs text-emerald-300">
                                                ✅ Entregado
                                            </span>
                                        ) : (
                                            <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs text-gray-400">
                                                ⏳ En progreso
                                            </span>
                                        )}
                                        {entrega.calificado && (
                                            <span className="rounded-full bg-amber-400/10 px-3 py-0.5 text-xs text-amber-300">
                                                ⭐ {entrega.puntos_profesor ?? 0}{' '}
                                                pts (profesor)
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Última actividad:{' '}
                                        {entrega.ultima_actividad
                                            ? formatearFechaHora(
                                                  entrega.ultima_actividad,
                                              )
                                            : '—'}
                                        {entrega.comentario_profesor && (
                                            <>
                                                {' '}· 💬 "
                                                {entrega.comentario_profesor}
                                                "
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/grupos/${id}/ejercicios/${ejercicioId}/${tipoTablero}?revisarEstudiante=${entrega.usuario_id}`,
                                            )
                                        }
                                        className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                                    >
                                        Ver solución
                                    </button>
                                    <button
                                        onClick={() => calificar(entrega)}
                                        className="rounded-xl bg-[#FF7C02] px-4 py-2 text-sm font-semibold text-black hover:brightness-110"
                                    >
                                        ⭐ Calificar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {entregas.length === 0 && (
                        <p className="py-10 text-center text-sm text-gray-500">
                            Nadie ha abierto este ejercicio todavía.
                        </p>
                    )}
                </div>
            </div>
        </AppShell>
    );
};

export default RevisarEntregas;
