import { useContext, useEffect, useState } from 'react';
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    calificarEntregaGrupo,
    listarEjerciciosGrupoProfesor,
    listarSolucionesEjercicio,
} from '../../api/gruposApi';
import type {
    CasoPruebaGrupo,
    EntregaGrupo,
    ResultadoCasoPrueba,
} from '../../types/dominio';
import { formatearFechaHora } from '../../utils/fechas';

/**
 * /profesor/grupos/:id/ejercicios/:ejercicioId/revisar — PÁGINA de
 * revisión (no modal): lista las entregas de ese ejercicio y permite
 * calificar hasta los puntos máximos del ejercicio y comentar SOLO esa
 * entrega del par
 * (ejercicio, estudiante). La solución del estudiante se abre en el
 * tablero en modo solo lectura.
 */
const RevisarEntregas = () => {
    const { id, ejercicioId } = useParams<{
        id: string;
        ejercicioId: string;
    }>();
    const [params] = useSearchParams();
    const tipoTablero =
        params.get('tipo') === 'diagrama' ? 'diagrama' : 'pseudocodigo';
    const { claveAcceso } = useContext(TokenContext);
    const navigate = useNavigate();

    const [cargando, setCargando] = useState(true);
    const [entregas, setEntregas] = useState<EntregaGrupo[]>([]);
    const [puntosMaximos, setPuntosMaximos] = useState<number | null>(null);
    const [casosPrueba, setCasosPrueba] = useState<CasoPruebaGrupo[]>([]);

    const cargar = async () => {
        if (!claveAcceso || !id || !ejercicioId) return;
        setCargando(true);
        setPuntosMaximos(null);
        try {
            const [lista, ejercicios] = await Promise.all([
                listarSolucionesEjercicio(claveAcceso, ejercicioId),
                listarEjerciciosGrupoProfesor(claveAcceso, id),
            ]);
            const ejercicio = ejercicios.find(
                (item) => item.id === Number(ejercicioId)
            );
            if (!ejercicio) {
                throw new Error('No se encontró el ejercicio de este grupo');
            }
            setEntregas(lista);
            setPuntosMaximos(ejercicio.puntos);
            setCasosPrueba(ejercicio.casos_prueba ?? []);
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            const mensaje = obtenerMensajeError(
                error,
                'No se pudieron cargar las entregas'
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        void cargar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claveAcceso, id, ejercicioId]);

    const calificar = async (entrega: EntregaGrupo) => {
        if (!claveAcceso || puntosMaximos === null) return;

        const resultado = await Swal.fire<{
            puntos: number;
            comentario: string;
        }>({
            title: `Calificar a ${entrega.estudiante.username}`,
            html: `
                <input
                    id="puntos"
                    type="number"
                    min="0"
                    max="${puntosMaximos}"
                    value="${entrega.puntos_profesor ?? 0}"
                    class="swal2-input"
                    placeholder="Puntos (máximo ${puntosMaximos})"
                >
                <textarea id="comentario" class="swal2-textarea"
                    placeholder="Comentario (opcional)">${
                        entrega.comentario_profesor ?? ''
                    }</textarea>
            `,
            showCancelButton: true,
            confirmButtonText: 'Calificar',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
                const inputPuntos = document.getElementById(
                    'puntos'
                ) as HTMLInputElement | null;
                if (!inputPuntos?.value.trim()) {
                    Swal.showValidationMessage('Ingresa una puntuación');
                    return null;
                }
                const puntos = Number(inputPuntos.value);
                const comentario = (
                    document.getElementById('comentario') as HTMLTextAreaElement
                )?.value;
                if (
                    !Number.isInteger(puntos) ||
                    puntos < 0 ||
                    puntos > puntosMaximos
                ) {
                    Swal.showValidationMessage(
                        `Los puntos deben ser un entero entre 0 y ${puntosMaximos}`
                    );
                    return null;
                }
                return { puntos, comentario: comentario ?? '' };
            },
        });

        if (!resultado.isConfirmed || !resultado.value) return;
        const { puntos, comentario } = resultado.value;

        try {
            await calificarEntregaGrupo(
                claveAcceso,
                ejercicioId ?? '',
                entrega.usuario_id,
                puntos,
                comentario.trim() || null
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
            const mensaje = obtenerMensajeError(error, 'No se pudo calificar');
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
                    Cada fila es la entrega de UN estudiante en ESTE ejercicio
                    (calificar aquí no afecta a otros ejercicios). Puntaje
                    máximo: {puntosMaximos ?? '—'} pts.
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
                                                ⭐{' '}
                                                {entrega.puntos_profesor ?? 0}{' '}
                                                pts (profesor)
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Última actividad:{' '}
                                        {entrega.ultima_actividad
                                            ? formatearFechaHora(
                                                  entrega.ultima_actividad
                                              )
                                            : '—'}
                                        {entrega.comentario_profesor && (
                                            <>
                                                {' '}
                                                · 💬 "
                                                {entrega.comentario_profesor}"
                                            </>
                                        )}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/grupos/${id}/ejercicios/${ejercicioId}/${tipoTablero}?revisarEstudiante=${entrega.usuario_id}`
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
                            {casosPrueba.length > 0 && (
                                <section className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="font-semibold text-white">
                                            Resultados de casos de prueba
                                        </h3>
                                    </div>
                                    {entrega.resultado_casos_prueba ? (
                                        <>
                                            <p className="mt-2 text-sm text-gray-300">
                                                {
                                                    entrega.resultado_casos_prueba.filter(
                                                        (resultado) =>
                                                            resultado.aprobado
                                                    ).length
                                                }
                                                /{casosPrueba.length} casos
                                                aprobados
                                            </p>
                                            <div className="mt-3 grid gap-2">
                                                {casosPrueba.map(
                                                    (caso, indice) => {
                                                        const resultado =
                                                            entrega.resultado_casos_prueba?.find(
                                                                (item) =>
                                                                    item.indice ===
                                                                    indice
                                                            );
                                                        return (
                                                            <ResultadoCaso
                                                                key={indice}
                                                                indice={indice}
                                                                caso={caso}
                                                                resultado={
                                                                    resultado
                                                                }
                                                            />
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <p className="mt-2 text-sm text-gray-400">
                                            No se adjuntó un resultado de
                                            ejecución al entregar.
                                        </p>
                                    )}
                                </section>
                            )}
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

const ResultadoCaso = ({
    indice,
    caso,
    resultado,
}: {
    indice: number;
    caso: CasoPruebaGrupo;
    resultado: ResultadoCasoPrueba | undefined;
}) => (
    <article className="rounded-lg border border-white/10 p-3 text-sm">
        <p className="font-medium text-white">
            Caso {indice + 1}:{' '}
            {resultado
                ? resultado.aprobado
                    ? '✅ Aprobado'
                    : '❌ No aprobado'
                : 'Sin resultado'}
        </p>
        <div className="mt-2 grid gap-3 text-gray-300 sm:grid-cols-3">
            <div>
                <span className="text-xs text-gray-500">Entradas</span>
                <pre className="mt-1 whitespace-pre-wrap">
                    {caso.entradas.join('\n') || '(ninguna)'}
                </pre>
            </div>
            <div>
                <span className="text-xs text-gray-500">Esperado</span>
                <pre className="mt-1 whitespace-pre-wrap">
                    {caso.salidas_esperadas.join('\n')}
                </pre>
            </div>
            <div>
                <span className="text-xs text-gray-500">Obtenido</span>
                <pre className="mt-1 whitespace-pre-wrap">
                    {resultado?.salida_obtenida.join('\n') || '(sin salida)'}
                </pre>
            </div>
        </div>
        {resultado?.error && (
            <p className="mt-2 text-sm text-red-300">{resultado.error}</p>
        )}
    </article>
);

export default RevisarEntregas;
