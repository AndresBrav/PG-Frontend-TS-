import { useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import {
    crearEjercicioGrupo,
    listarTemariosGrupo,
} from '../../api/gruposApi';
import type { TemarioGrupo } from '../../types/dominio';

/**
 * /profesor/grupos/:id/ejercicios/nuevo — Creación de ejercicio de
 * grupo como PÁGINA (no modal): título, enunciado, tipo, puntos,
 * temario obligatorio y fecha límite opcional.
 */
const CrearEjercicioPage = () => {
    const { id } = useParams<{ id: string }>();
    const { claveAcceso } = useContext(TokenContext);
    const navigate = useNavigate();

    const [temarios, setTemarios] = useState<TemarioGrupo[]>([]);
    const [temarioId, setTemarioId] = useState<string>('');
    const [titulo, setTitulo] = useState('');
    const [enunciado, setEnunciado] = useState('');
    const [tipo, setTipo] = useState<'diagrama' | 'pseudocodigo'>(
        'pseudocodigo',
    );
    const [puntos, setPuntos] = useState('5');
    const [conLimite, setConLimite] = useState(false);
    const [fechaLimite, setFechaLimite] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        const cargar = async () => {
            if (!claveAcceso || !id) return;
            try {
                const lista = await listarTemariosGrupo(claveAcceso, id);
                setTemarios(lista);
                if (lista.length > 0) {
                    setTemarioId(String(lista[0].id));
                }
            } catch (error) {
                if (esErrorDeSesion(error)) return;
                const mensaje = obtenerMensajeError(
                    error,
                    'No se pudieron cargar los temarios',
                );
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje,
                });
            }
        };
        void cargar();
    }, [claveAcceso, id]);

    const guardar = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!claveAcceso || !id) return;

        setGuardando(true);
        try {
            await crearEjercicioGrupo(claveAcceso, id, {
                temario_id: Number(temarioId),
                titulo: titulo.trim(),
                enunciado: enunciado.trim(),
                tipo,
                puntos: Number(puntos),
                fecha_limite: conLimite && fechaLimite ? fechaLimite : null,
            });

            await Swal.fire({
                icon: 'success',
                title: 'Ejercicio publicado',
                text: 'Los estudiantes del grupo recibieron una notificación.',
                timer: 1800,
                showConfirmButton: false,
            });
            navigate(`/grupos/${id}`);
        } catch (error) {
            const mensaje = obtenerMensajeError(
                error,
                'No se pudo crear el ejercicio',
            );
            await Swal.fire({ icon: 'error', title: 'Error', text: mensaje });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-3xl px-4 py-8">
                <Link
                    to={`/grupos/${id}`}
                    className="text-sm text-gray-400 hover:text-white"
                >
                    ← Volver al grupo
                </Link>
                <h1 className="mb-6 text-3xl font-bold text-white">
                    Nuevo ejercicio
                </h1>

                <form onSubmit={guardar} className="grid gap-5">
                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Temario (obligatorio)
                        </label>
                        <select
                            value={temarioId}
                            onChange={(e) => setTemarioId(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                            required
                        >
                            <option value="">Elige un temario…</option>
                            {temarios.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Título
                        </label>
                        <input
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej. Sumar dos números"
                            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            maxLength={120}
                            required
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-400">
                            Enunciado
                        </label>
                        <textarea
                            value={enunciado}
                            onChange={(e) => setEnunciado(e.target.value)}
                            placeholder="Describe lo que el estudiante debe resolver…"
                            rows={4}
                            className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white placeholder:text-gray-500 focus:border-[#FF7C02] focus:outline-none"
                            required
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-400">
                                Tipo de tablero
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) =>
                                    setTipo(
                                        e.target.value as
                                            | 'diagrama'
                                            | 'pseudocodigo',
                                    )
                                }
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                            >
                                <option value="pseudocodigo">
                                    Pseudocódigo (PSeInt)
                                </option>
                                <option value="diagrama">
                                    Diagrama de flujo
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm text-gray-400">
                                Puntos al completarlo (0–100)
                            </label>
                            <input
                                type="number"
                                value={puntos}
                                onChange={(e) => setPuntos(e.target.value)}
                                min={0}
                                max={100}
                                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <label className="flex items-center gap-3 text-sm text-white">
                            <input
                                type="checkbox"
                                checked={conLimite}
                                onChange={(e) => setConLimite(e.target.checked)}
                            />
                            Fecha límite (hasta qué día se puede resolver)
                        </label>
                        {conLimite && (
                            <input
                                type="date"
                                value={fechaLimite}
                                onChange={(e) => setFechaLimite(e.target.value)}
                                className="mt-3 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2 text-white focus:border-[#FF7C02] focus:outline-none"
                                required
                            />
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            Vencida la fecha el estudiante puede ver el
                            ejercicio pero no guardar ni entregar.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            guardando ||
                            !temarioId ||
                            titulo.trim().length < 3 ||
                            enunciado.trim().length < 3
                        }
                        className="rounded-xl bg-[#FF7C02] px-5 py-3 font-semibold text-black disabled:opacity-50"
                    >
                        {guardando ? 'Publicando...' : 'Publicar ejercicio'}
                    </button>
                </form>
            </div>
        </AppShell>
    );
};

export default CrearEjercicioPage;
