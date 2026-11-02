import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { TokenContext } from '../../../Context/TokenContext';
import { UsuarioContext } from '../../../Context/UsuarioContext';
import { ejecutarPseudocodigo } from '../../Games/GeneradosPorIA/EditingBoard/pseintCompiler';
import {
    obtenerEjercicioEstudiante,
    guardarEstadoEjercicioEstudiante,
    entregarEjercicioEstudiante,
    listarSolucionesEjercicio,
    calificarEntrega,
} from '../../../api/gruposApi';
import type { EjercicioGrupoEstudiante, SolucionEstudianteGrupo } from '../../../types/dominio';
import '../../Games/GeneradosPorIA/app.css';

const DEFAULT_CODE = `Algoritmo SolucionGrupo
    // 1. Definir variables
    Definir x Como Real
    
    // 2. Leer datos o calcular
    Escribir "Ingrese un valor:"
    Leer x
    
    // 3. Mostrar resultado
    Escribir "El resultado es: ", x
FinAlgoritmo`;

export const TableroPseudocodigoGrupo: React.FC = () => {
    const { id, ejercicioId: paramEjercicioId } = useParams<{ id: string; ejercicioId: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const grupoId = Number(id);
    const ejercicioId = Number(paramEjercicioId);
    const revisarEstudianteId = searchParams.get('revisarEstudiante')
        ? Number(searchParams.get('revisarEstudiante'))
        : null;

    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);

    const esModoRevision = Boolean(revisarEstudianteId);

    // Datos del ejercicio
    const [titulo, setTitulo] = useState<string>('Pseudocódigo PSeInt');
    const [enunciado, setEnunciado] = useState<string>('');
    const [puntosMaximos, setPuntosMaximos] = useState<number>(100);

    // Estado del estudiante en revisión (Profesor)
    const [estudianteRevisado, setEstudianteRevisado] = useState<SolucionEstudianteGrupo | null>(null);
    const [notaAsignada, setNotaAsignada] = useState<number>(0);
    const [guardandoNota, setGuardandoNota] = useState<boolean>(false);

    // Estado del estudiante resolviendo (Estudiante)
    const [ejercicioEstudiante, setEjercicioEstudiante] = useState<EjercicioGrupoEstudiante | null>(null);
    const [entregando, setEntregando] = useState<boolean>(false);

    // Código y Consola
    const [code, setCode] = useState<string>(DEFAULT_CODE);
    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [estadoGuardado, setEstadoGuardado] = useState<'guardado' | 'guardando' | 'sin_guardar'>('guardado');
    const [cargando, setCargando] = useState<boolean>(true);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cargar información inicial
    useEffect(() => {
        if (!grupoId || !ejercicioId || !claveAcceso) return;

        let activo = true;

        const cargarDatos = async () => {
            setCargando(true);
            try {
                if (esModoRevision && revisarEstudianteId) {
                    // Modo Profesor: Solución del estudiante
                    const res = await listarSolucionesEjercicio(claveAcceso, ejercicioId, revisarEstudianteId);
                    if (!activo) return;

                    setTitulo(res.ejercicio.titulo);
                    setEnunciado(res.ejercicio.enunciado);
                    setPuntosMaximos(res.ejercicio.puntos);

                    const sol = res.soluciones.find((s) => s.usuario.id === revisarEstudianteId);
                    if (sol) {
                        setEstudianteRevisado(sol);
                        setNotaAsignada(sol.puntos ?? 0);
                        if (sol.estado_tablero) {
                            try {
                                const parsed =
                                    typeof sol.estado_tablero === 'string'
                                        ? JSON.parse(sol.estado_tablero)
                                        : sol.estado_tablero;
                                if (parsed && typeof parsed === 'object' && parsed.code) {
                                    setCode(parsed.code);
                                } else if (typeof sol.estado_tablero === 'string') {
                                    setCode(sol.estado_tablero);
                                }
                            } catch {
                                setCode(String(sol.estado_tablero));
                            }
                        }
                    }
                } else {
                    // Modo Estudiante: Resolver ejercicio
                    const ej = await obtenerEjercicioEstudiante(claveAcceso, grupoId, ejercicioId);
                    if (!activo) return;

                    setEjercicioEstudiante(ej);
                    setTitulo(ej.titulo);
                    setEnunciado(ej.enunciado);
                    setPuntosMaximos(ej.puntos);

                    if (ej.estado_tablero) {
                        try {
                            const parsed =
                                typeof ej.estado_tablero === 'string'
                                    ? JSON.parse(ej.estado_tablero)
                                    : ej.estado_tablero;
                            if (parsed && typeof parsed === 'object' && parsed.code) {
                                setCode(parsed.code);
                            } else if (typeof ej.estado_tablero === 'string') {
                                setCode(ej.estado_tablero);
                            }
                        } catch {
                            setCode(String(ej.estado_tablero));
                        }
                    }
                }
            } catch (err) {
                console.error('Error al cargar ejercicio de pseudocódigo:', err);
                void Swal.fire('Error', 'No se pudo cargar el ejercicio.', 'error');
            } finally {
                if (activo) setCargando(false);
            }
        };

        void cargarDatos();

        return () => {
            activo = false;
        };
    }, [grupoId, ejercicioId, revisarEstudianteId, esModoRevision, claveAcceso]);

    // Función de autoguardado para estudiantes
    const guardarProgresoEstudiante = useCallback(
        async (nuevoCodigo: string) => {
            if (esModoRevision || !claveAcceso) return;

            setEstadoGuardado('guardando');
            try {
                await guardarEstadoEjercicioEstudiante(claveAcceso, grupoId, ejercicioId, { code: nuevoCodigo });
                setEstadoGuardado('guardado');
            } catch (error) {
                console.error('Error guardando pseudocódigo:', error);
                setEstadoGuardado('sin_guardar');
            }
        },
        [esModoRevision, claveAcceso, grupoId, ejercicioId],
    );

    const handleCodeChange = (nuevoCodigo: string) => {
        setCode(nuevoCodigo);
        if (esModoRevision) return;

        setEstadoGuardado('sin_guardar');
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            void guardarProgresoEstudiante(nuevoCodigo);
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    // Sincronizar scroll de números de línea
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    // Manejo de sangrías con tecla Tab
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const { selectionStart, selectionEnd, value } = textarea;
            const tabSpaces = '    ';
            const newValue = value.substring(0, selectionStart) + tabSpaces + value.substring(selectionEnd);
            handleCodeChange(newValue);
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + tabSpaces.length;
            }, 0);
        }
    };

    // Ejecución local con el compilador PSeInt
    const handleEjecutar = async () => {
        if (!code.trim()) {
            void Swal.fire('Código vacío', 'Escribe tu algoritmo antes de ejecutarlo.', 'warning');
            return;
        }

        setIsRunning(true);
        setConsoleOutput(['[Sistema] Iniciando ejecución del pseudocódigo...']);

        try {
            const result = await ejecutarPseudocodigo(code, {
                imprimir: (texto) => {
                    setConsoleOutput((prev) => [...prev, texto]);
                },
                pedirEntrada: async (nombre, _tipo, mensajePrevio) => {
                    const aviso = mensajePrevio
                        ? `<div style="text-align:left;color:#555;font-weight:bold;margin-bottom:8px;">${mensajePrevio}</div>`
                        : '';
                    const { value, isConfirmed } = await Swal.fire({
                        title: 'Entrada requerida (Leer)',
                        html: `${aviso}<div style="text-align:left;color:#333;">El algoritmo solicita el valor para <strong>${nombre}</strong>:</div>`,
                        input: 'text',
                        inputPlaceholder: `Valor para ${nombre}...`,
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#FF7C02',
                    });

                    const valor = isConfirmed ? value ?? '' : '';
                    setConsoleOutput((prev) => [...prev, `> ${nombre} = ${valor}`]);
                    return String(valor);
                },
            });

            setIsRunning(false);
            setConsoleOutput((prev) => [...prev, '[Sistema] Ejecución finalizada con éxito.']);

            if (result.error) {
                setConsoleOutput((prev) => [...prev, `[Error] ${result.error}`]);
                void Swal.fire('Error en ejecución', result.error, 'error');
            }
        } catch (err: any) {
            setIsRunning(false);
            const msg = err instanceof Error ? err.message : String(err);
            setConsoleOutput((prev) => [...prev, `[Error] ${msg}`]);
            void Swal.fire('Error inesperado', msg, 'error');
        }
    };

    // Entrega del estudiante
    const handleEntregarEjercicio = async () => {
        if (!claveAcceso || !code.trim()) {
            void Swal.fire('Código vacío', 'Escribe tu pseudocódigo antes de entregarlo.', 'warning');
            return;
        }

        const confirmacion = await Swal.fire({
            title: '¿Entregar ejercicio?',
            text: 'Tu solución se enviará para que el profesor la revise y asigne tu calificación.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, entregar solución',
            cancelButtonText: 'Seguir editando',
            confirmButtonColor: '#10b981',
        });

        if (!confirmacion.isConfirmed) return;

        setEntregando(true);
        try {
            await entregarEjercicioEstudiante(claveAcceso, grupoId, ejercicioId, { code });
            setEstadoGuardado('guardado');
            await Swal.fire({
                title: '¡Entrega realizada!',
                text: 'Tu pseudocódigo ha sido entregado exitosamente a tu profesor.',
                icon: 'success',
            });
            navigate(`/grupos/${grupoId}`);
        } catch (err: any) {
            void Swal.fire('Error al entregar', err.response?.data?.message || 'No se pudo entregar el ejercicio.', 'error');
        } finally {
            setEntregando(false);
        }
    };

    // Calificar por profesor
    const handleGuardarCalificacion = async () => {
        if (!claveAcceso || !revisarEstudianteId) return;

        setGuardandoNota(true);
        try {
            await calificarEntrega(claveAcceso, ejercicioId, revisarEstudianteId, notaAsignada);
            void Swal.fire({
                title: '¡Calificación guardada!',
                text: `Se asignó ${notaAsignada}/${puntosMaximos} pts a este estudiante.`,
                icon: 'success',
                timer: 2000,
            });
            if (estudianteRevisado) {
                setEstudianteRevisado({ ...estudianteRevisado, puntos: notaAsignada });
            }
        } catch (err: any) {
            void Swal.fire('Error', err.response?.data?.message || 'No se pudo guardar la calificación.', 'error');
        } finally {
            setGuardandoNota(false);
        }
    };

    const lines = code.split('\n');

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#121212] text-white">
            {/* BARRA SUPERIOR PROFESOR (MODO REVISIÓN) */}
            {esModoRevision && (
                <header className="bg-slate-900 border-b border-slate-700 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/grupos/${grupoId}`}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
                        >
                            ← Volver al Grupo
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-sky-400">
                                Revisión Pseudocódigo: {titulo}
                            </h1>
                            <p className="text-xs text-slate-400">
                                Estudiante: <span className="font-semibold text-white">{estudianteRevisado?.usuario.username}</span> ({estudianteRevisado?.usuario.codigo}) | Estado: {estudianteRevisado?.completado ? '✅ Entregado' : '⏳ En progreso'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            disabled={isRunning}
                            onClick={handleEjecutar}
                            className="rounded-lg bg-sky-600 hover:bg-sky-500 px-3.5 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                        >
                            {isRunning ? 'Ejecutando...' : '▶ Probar Código'}
                        </button>
                        <div className="h-6 w-px bg-slate-700 mx-1" />
                        <label className="text-xs font-semibold text-slate-300">
                            Calificación (0 - {puntosMaximos}):
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={puntosMaximos}
                            value={notaAsignada}
                            onChange={(e) =>
                                setNotaAsignada(Math.max(0, Math.min(puntosMaximos, Number(e.target.value))))
                            }
                            className="w-20 rounded border border-slate-600 bg-slate-950 px-2 py-1 text-center font-bold text-amber-300 text-sm focus:border-amber-400 focus:outline-none"
                        />
                        <button
                            type="button"
                            disabled={guardandoNota}
                            onClick={handleGuardarCalificacion}
                            className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white transition disabled:opacity-50"
                        >
                            {guardandoNota ? 'Guardando...' : 'Asignar Nota'}
                        </button>
                    </div>
                </header>
            )}

            {/* BARRA SUPERIOR ESTUDIANTE */}
            {!esModoRevision && (
                <header className="bg-[#1e1e1e] border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/grupos/${grupoId}`}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition"
                        >
                            ← Volver al Grupo
                        </Link>
                        <div>
                            <h1 className="text-base font-bold text-white">
                                {titulo}
                            </h1>
                            <span className="text-xs font-semibold text-amber-400">
                                Valor: {puntosMaximos} pts {ejercicioEstudiante?.completado && `(Tu nota: ${ejercicioEstudiante.puntosObtenidos} pts)`}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Indicador de guardado */}
                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                            {estadoGuardado === 'guardando' && (
                                <>
                                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                    Guardando borrador...
                                </>
                            )}
                            {estadoGuardado === 'guardado' && (
                                <>
                                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                                    Borrador guardado
                                </>
                            )}
                            {estadoGuardado === 'sin_guardar' && (
                                <>
                                    <span className="inline-block w-2 h-2 rounded-full bg-gray-500" />
                                    Cambios pendientes...
                                </>
                            )}
                        </span>

                        <button
                            type="button"
                            disabled={isRunning}
                            onClick={handleEjecutar}
                            className="px-4 py-1.5 rounded-lg bg-[#FF7C02] hover:bg-[#ff8f2b] text-xs font-bold text-black transition shadow-lg disabled:opacity-50"
                        >
                            {isRunning ? 'Ejecutando...' : '▶ Ejecutar'}
                        </button>

                        <button
                            type="button"
                            disabled={entregando}
                            onClick={handleEntregarEjercicio}
                            className="px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-lg disabled:opacity-50"
                        >
                            {entregando ? 'Entregando...' : ejercicioEstudiante?.completado ? 'Actualizar Entrega' : '🚀 Entregar Ejercicio'}
                        </button>
                    </div>
                </header>
            )}

            {/* ENUNCIADO DEL PROBLEMA */}
            <div className="mx-4 my-2 px-4 py-2.5 rounded-xl bg-white/5 border-l-4 border-[#FF7C02] text-sm text-gray-200">
                <span className="font-bold text-[#FF9D3D] mr-2">Enunciado:</span>
                {enunciado || 'Sin descripción disponible'}
            </div>

            {/* ZONA DE TRABAJO (EDITOR + CONSOLA) */}
            <div className="flex-1 px-4 pb-4 overflow-hidden flex gap-4 min-h-0">
                {/* Panel Izquierdo: Editor PSeInt */}
                <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#181818] overflow-hidden shadow-2xl min-w-0">
                    <div className="bg-white/5 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
                        <span>pseint_algoritmo.psc</span>
                        <span>{lines.length} líneas</span>
                    </div>

                    <div className="flex-1 flex relative overflow-hidden min-h-0">
                        {/* Números de línea */}
                        <div
                            ref={lineNumbersRef}
                            className="w-12 bg-black/30 border-r border-white/10 py-3 text-right pr-2 text-xs font-mono text-gray-500 select-none overflow-hidden"
                            style={{ lineHeight: '24px' }}
                        >
                            {lines.map((_, i) => (
                                <div key={i} style={{ height: '24px' }}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>

                        {/* Textarea del código */}
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onScroll={handleScroll}
                            wrap="off"
                            className="flex-1 bg-transparent text-gray-100 p-3 font-mono text-xs outline-none resize-none overflow-auto"
                            style={{ lineHeight: '24px' }}
                            placeholder="// Escribe aquí tu pseudocódigo PSeInt..."
                        />
                    </div>
                </div>

                {/* Panel Derecho: Consola y Guía */}
                <div className="w-96 flex flex-col gap-4 min-h-0">
                    {/* Consola de Salida */}
                    <div className="flex-1 flex flex-col rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl min-h-0">
                        <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
                            <span className="font-semibold text-gray-300">📟 Consola de Salida</span>
                            <button
                                type="button"
                                onClick={() => setConsoleOutput([])}
                                className="text-[11px] text-gray-500 hover:text-white transition"
                            >
                                Limpiar
                            </button>
                        </div>
                        <div className="flex-1 p-3 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1">
                            {consoleOutput.length === 0 ? (
                                <span className="text-gray-500 italic">
                                    Haz clic en "▶ Ejecutar" para probar la ejecución de tu pseudocódigo.
                                </span>
                            ) : (
                                consoleOutput.map((log, index) => (
                                    <div key={index} className="whitespace-pre-wrap">
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Guía Rápida */}
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-gray-300 space-y-2">
                        <h4 className="font-bold text-amber-400">💡 Sintaxis Básica PSeInt</h4>
                        <ul className="list-disc pl-4 space-y-1 text-gray-400">
                            <li><b className="text-gray-200">Algoritmo Nombre ... FinAlgoritmo</b></li>
                            <li><b className="text-gray-200">Definir var Como Real / Entero / Cadena</b></li>
                            <li><b className="text-gray-200">Leer variable</b> (captura entrada)</li>
                            <li><b className="text-gray-200">Escribir "Mensaje", variable</b> (muestra texto)</li>
                            <li><b className="text-gray-200">var &lt;- valor</b> (asignación)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default TableroPseudocodigoGrupo;
