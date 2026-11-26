import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import {
    buscarEstudiantesParaGrupo,
    agregarEstudiantesPorCodigo,
} from '../../api/gruposApi';
import type {
    UsuarioBusquedaGrupo,
    ResultadoInscripcionSIS,
} from '../../api/gruposApi';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';

interface ModalInscribirEstudiantesProps {
    claveAcceso: string;
    grupoId: string;
    onCerrar: () => void;
    onExito: () => Promise<void>;
}

export const ModalInscribirEstudiantes = ({
    claveAcceso,
    grupoId,
    onCerrar,
    onExito,
}: ModalInscribirEstudiantesProps) => {
    const [query, setQuery] = useState('');
    const [cargando, setCargando] = useState(true);
    const [estudiantes, setEstudiantes] = useState<UsuarioBusquedaGrupo[]>([]);
    const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
    const [guardando, setGuardando] = useState(false);

    // Carga inicial de todos los estudiantes del sistema
    useEffect(() => {
        let montado = true;
        const cargarEstudiantes = async () => {
            setCargando(true);
            try {
                const res = await buscarEstudiantesParaGrupo(
                    claveAcceso,
                    grupoId,
                    '',
                );
                if (montado) {
                    setEstudiantes(res);
                }
            } catch (error) {
                if (!esErrorDeSesion(error)) {
                    console.error('Error cargando estudiantes:', error);
                }
            } finally {
                if (montado) {
                    setCargando(false);
                }
            }
        };

        void cargarEstudiantes();

        return () => {
            montado = false;
        };
    }, [claveAcceso, grupoId]);

    // Filtrado en vivo por nombre, código o correo
    const estudiantesFiltrados = useMemo(() => {
        const termino = query.trim().toLowerCase();
        if (!termino) return estudiantes;

        return estudiantes.filter(
            (e) =>
                e.username.toLowerCase().includes(termino) ||
                e.codigo.toLowerCase().includes(termino) ||
                (e.correo && e.correo.toLowerCase().includes(termino)),
        );
    }, [estudiantes, query]);

    const toggleSeleccion = (id: number) => {
        setSeleccionados((prev) => {
            const nuevo = new Set(prev);
            if (nuevo.has(id)) {
                nuevo.delete(id);
            } else {
                nuevo.add(id);
            }
            return nuevo;
        });
    };

    const seleccionarTodosDisponibles = () => {
        const disponibles = estudiantesFiltrados.filter((r) => !r.yaInscrito);
        const todosDisponiblesSeleccionados = disponibles.every((r) =>
            seleccionados.has(r.id),
        );

        setSeleccionados((prev) => {
            const nuevo = new Set(prev);
            if (todosDisponiblesSeleccionados) {
                disponibles.forEach((r) => nuevo.delete(r.id));
            } else {
                disponibles.forEach((r) => nuevo.add(r.id));
            }
            return nuevo;
        });
    };

    const inscribirSeleccionados = async () => {
        if (seleccionados.size === 0) return;

        const listaCodigos = estudiantes
            .filter((e) => seleccionados.has(e.id))
            .map((e) => e.codigo || e.username);

        setGuardando(true);
        try {
            const resp = await agregarEstudiantesPorCodigo(
                claveAcceso,
                grupoId,
                listaCodigos,
            );

            const etiquetas: Record<string, string> = {
                agregado: 'agregado con éxito',
                ya_inscrito: 'ya estaba inscrito',
                no_encontrado: 'no encontrado',
                no_es_estudiante: 'no corresponde a un estudiante',
            };

            const detalle = resp
                .map(
                    ({ codigo, estado }) =>
                        `${codigo}: ${etiquetas[estado] ?? estado}`,
                )
                .join('\n');

            const todosAgregados = resp.every(
                ({ estado }) => estado === 'agregado',
            );

            await Swal.fire({
                icon: todosAgregados ? 'success' : 'info',
                title: 'Inscripción completada',
                text: detalle,
            });

            await onExito();
            onCerrar();
        } catch (error) {
            if (esErrorDeSesion(error)) return;
            await Swal.fire({
                icon: 'error',
                title: 'No se pudieron inscribir los estudiantes',
                text: obtenerMensajeError(error, 'Error al inscribir'),
            });
        } finally {
            setGuardando(false);
        }
    };

    const disponiblesVisibles = estudiantesFiltrados.filter((r) => !r.yaInscrito);
    const todosDisponiblesSeleccionados =
        disponiblesVisibles.length > 0 &&
        disponiblesVisibles.every((r) => seleccionados.has(r.id));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#141414] shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Agregar estudiantes al grupo
                        </h2>
                        <p className="text-xs text-gray-400">
                            Selecciona a los estudiantes que deseas unir al grupo. Puedes buscarlos por nombre, código o correo.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCerrar}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                        aria-label="Cerrar ventana"
                    >
                        ✕
                    </button>
                </div>

                {/* Barra de búsqueda interactiva */}
                <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Filtrar por nombre, código SIS o correo..."
                            className="w-full rounded-xl border border-white/10 bg-[#1c1c1c] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FF7C02]"
                            autoFocus
                        />
                        {query && (
                            <button
                                type="button"
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-3 text-xs text-gray-400 hover:text-white"
                            >
                                Limpiar
                            </button>
                        )}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                        <span>
                            Mostrando {estudiantesFiltrados.length} de {estudiantes.length} estudiantes
                        </span>
                        {disponiblesVisibles.length > 0 && (
                            <button
                                type="button"
                                onClick={seleccionarTodosDisponibles}
                                className="font-semibold text-[#FF7C02] hover:underline"
                            >
                                {todosDisponiblesSeleccionados
                                    ? 'Deseleccionar disponibles'
                                    : 'Seleccionar todos los disponibles'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Lista de todos los estudiantes */}
                <div className="flex-1 overflow-y-auto p-6">
                    {cargando ? (
                        <div className="py-12 text-center text-sm text-gray-400">
                            Cargando estudiantes del sistema…
                        </div>
                    ) : estudiantesFiltrados.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-white/10 py-12 text-center text-sm text-gray-400">
                            {estudiantes.length === 0
                                ? 'No hay estudiantes registrados en la plataforma.'
                                : 'No se encontraron estudiantes con ese criterio de búsqueda.'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {estudiantesFiltrados.map((estudiante) => {
                                const estaSeleccionado = seleccionados.has(
                                    estudiante.id,
                                );
                                return (
                                    <div
                                        key={estudiante.id}
                                        onClick={() => {
                                            if (!estudiante.yaInscrito) {
                                                toggleSeleccion(estudiante.id);
                                            }
                                        }}
                                        className={`flex items-center justify-between rounded-xl border p-3.5 transition ${
                                            estudiante.yaInscrito
                                                ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                                                : estaSeleccionado
                                                ? 'border-[#FF7C02] bg-[#FF7C02]/10 cursor-pointer shadow-sm'
                                                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08] cursor-pointer'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <input
                                                type="checkbox"
                                                checked={estaSeleccionado}
                                                disabled={estudiante.yaInscrito}
                                                onChange={() => toggleSeleccion(estudiante.id)}
                                                className="h-4 w-4 rounded accent-[#FF7C02]"
                                            />
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {estudiante.username}
                                                </p>
                                                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-gray-400">
                                                    <span>
                                                        SIS: <strong className="font-mono text-gray-300">{estudiante.codigo}</strong>
                                                    </span>
                                                    {estudiante.correo && (
                                                        <span>
                                                            Correo: <strong className="text-gray-300">{estudiante.correo}</strong>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            {estudiante.yaInscrito ? (
                                                <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                                    Ya en el grupo
                                                </span>
                                            ) : estaSeleccionado ? (
                                                <span className="rounded-lg bg-[#FF7C02]/20 px-2.5 py-1 text-xs font-bold text-[#FF7C02]">
                                                    Seleccionado
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-500">
                                                    Clic para elegir
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer de acción */}
                <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
                    <span className="text-sm font-semibold text-gray-300">
                        {seleccionados.size === 0
                            ? 'Ningún estudiante seleccionado'
                            : `${seleccionados.size} estudiante(s) seleccionado(s)`}
                    </span>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onCerrar}
                            disabled={guardando}
                            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => void inscribirSeleccionados()}
                            disabled={guardando || seleccionados.size === 0}
                            className="rounded-xl bg-[#FF7C02] px-6 py-2.5 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-40"
                        >
                            {guardando
                                ? 'Inscribiendo…'
                                : `Agregar al grupo (${seleccionados.size})`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
