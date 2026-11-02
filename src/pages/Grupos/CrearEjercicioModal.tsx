import React, { useState } from 'react';
import type { FormEvent } from 'react';
import type { TipoEjercicioGrupo, DatosCrearEjercicioGrupo } from '../../types/dominio';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCrear: (datos: DatosCrearEjercicioGrupo) => Promise<void>;
    creando: boolean;
}

export const CrearEjercicioModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onCrear,
    creando,
}) => {
    const [titulo, setTitulo] = useState('');
    const [tipo, setTipo] = useState<TipoEjercicioGrupo>('diagrama');
    const [puntos, setPuntos] = useState(10);
    const [enunciado, setEnunciado] = useState('');
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
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

        try {
            await onCrear({
                titulo: titulo.trim(),
                tipo,
                puntos,
                enunciado: enunciado.trim(),
            });
            setTitulo('');
            setEnunciado('');
            setPuntos(10);
            onClose();
        } catch (err: any) {
            setError(err?.message || 'Error al crear el ejercicio');
        }
    };

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
