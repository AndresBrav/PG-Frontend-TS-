import React, { useCallback, useContext, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { TipoEjercicioGrupo, DatosCrearEjercicioGrupo, TemarioGrupo } from '../../types/dominio';
import { TokenContext } from '../../Context/TokenContext';
import { crearEjercicioGrupo, listarTemariosProfesor } from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import useCerrarSesion from '../../hooks/useCerrarSesion';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    grupoId: number;
    onEjercicioCreado?: () => void;
}

export const CrearEjercicioModal: React.FC<Props> = ({
    isOpen,
    onClose,
    grupoId,
    onEjercicioCreado,
}) => {
    const { claveAcceso } = useContext(TokenContext);
    const cerrarSesion = useCerrarSesion();
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<TipoEjercicioGrupo>('diagrama');
    const [puntos, setPuntos] = useState(10);
    const [enunciado, setEnunciado] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [creando, setCreando] = useState(false);
    const [temarios, setTemarios] = useState<TemarioGrupo[]>([]);
    const [temarioId, setTemarioId] = useState<number | null>(null);

    // Cargar los temarios del grupo al abrir el modal
    useEffect(() => {
        if (!isOpen || !claveAcceso || !Number.isInteger(grupoId)) return;

        let activo = true;

        const cargar = async () => {
            try {
                const lista = await listarTemariosProfesor(claveAcceso, grupoId);
                if (activo) {
                    setTemarios(lista);
                    // Si la lista cambió, conserva la selección válida
                    setTemarioId((prev) =>
                        prev !== null && lista.some((t) => t.id === prev)
                            ? prev
                            : (lista[0]?.id ?? null),
                    );
                }
            } catch {
                if (activo) setTemarios([]);
            }
        };

        void cargar();

        return () => {
            activo = false;
        };
    }, [isOpen, claveAcceso, grupoId]);

    const handleSubmit = useCallback(
        async (e: FormEvent) => {
            e.preventDefault();

            if (creando) return;

            setError(null);

            if (!titulo.trim()) {
                setError('Ingresa un título para el ejercicio');
                return;
            }

            if (!enunciado.trim()) {
                setError('Ingresa el enunciado o consigna del ejercicio');
                return;
            }

            if (puntos <= 0) {
                setError('Los puntos deben ser mayores a 0');
                return;
            }

            if (temarioId === null) {
                setError('Selecciona el temario del ejercicio');
                return;
            }

            if (!claveAcceso) {
                setError('Sesión no válida. Inicia sesión de nuevo.');
                cerrarSesion();
                return;
            }

            const datos: DatosCrearEjercicioGrupo = {
                titulo: titulo.trim(),
                tipo,
                puntos,
                enunciado: enunciado.trim(),
                temario_id: temarioId,
            };

            setCreando(true);

            try {
                await crearEjercicioGrupo(claveAcceso, grupoId, datos);
                setTitulo('');
                setEnunciado('');
                setPuntos(10);
                setTipo('diagrama');
                setCreando(false);
                onEjercicioCreado?.();
                onClose();
            } catch (err) {
                setCreando(false);
                if (esErrorDeSesion(err)) {
                    cerrarSesion();
                    return;
                }
                setError(
                    obtenerMensajeError(err, 'Error al crear el ejercicio'),
                );
            }
        },
        [
            creando,
            titulo,
            enunciado,
            puntos,
            tipo,
            temarioId,
            claveAcceso,
            grupoId,
            onEjercicioCreado,
            onClose,
            cerrarSesion,
        ],
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div
                className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#202020] p-6 text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h2 className="text-xl font-bold text-white">
                        Crear Nuevo Ejercicio de Grupo
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Temario
                        </label>
                        {temarios.length === 0 ? (
                            <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-300">
                                Este grupo todavía no tiene temarios. Crea uno
                                primero en el detalle del grupo.
                            </p>
                        ) : (
                            <select
                                value={temarioId ?? ''}
                                onChange={(e) =>
                                    setTemarioId(Number(e.target.value))
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FF7C02]"
                                required
                            >
                                {temarios.map((temario) => (
                                    <option key={temario.id} value={temario.id}>
                                        {temario.nombre}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Título del Ejercicio
                        </label>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Suma de dos números, Determinar si es par..."
                            className="w-full rounded-xl border border-white/15 bg-[#181818] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FF7C02]"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Tipo de Ejercicio
                            </label>
                            <select
                                value={tipo}
                                onChange={(e) =>
                                    setTipo(e.target.value as TipoEjercicioGrupo)
                                }
                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FF7C02]"
                            >
                                <option value="diagrama">Diagrama de Flujo</option>
                                <option value="pseudocodigo">
                                    Pseudocódigo (PSeInt)
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                                Puntos Máximos
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={puntos}
                                onChange={(e) => setPuntos(Number(e.target.value))}
                                className="w-full rounded-xl border border-white/15 bg-[#181818] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FF7C02]"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-300">
                            Enunciado o Instrucciones
                        </label>
                        <textarea
                            value={enunciado}
                            onChange={(e) => setEnunciado(e.target.value)}
                            rows={4}
                            placeholder="Describe claramente lo que el estudiante debe resolver..."
                            className="w-full rounded-xl border border-white/15 bg-[#181818] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#FF7C02]"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/10"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={creando}
                            className="rounded-xl bg-[#FF7C02] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-[#ff8f2b] disabled:opacity-50"
                        >
                            {creando ? 'Creando...' : 'Publicar Ejercicio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearEjercicioModal;
