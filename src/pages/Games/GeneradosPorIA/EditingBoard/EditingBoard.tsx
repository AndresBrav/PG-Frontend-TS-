import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { TokenContext } from '../../../../Context/TokenContext';
import { completarJuego } from '../../../../api/ejerciciosIA/ejercicios';
import { verificarPseudocodigo } from '../../../../api/ejerciciosIA/verificarPseudocodigo';
import { ejecutarPseudocodigo } from './pseintCompiler';
import {
    obtenerJuegoIAPorId,
    guardarEstadoTablero,
} from '../../../../api/ejerciciosIA/ejercicioIAapi';
import '../app.css';

interface LocationState {
    juegoId?: number;
    juegoDescripcion?: string;
}

const DEFAULT_INSTRUCCIONES = 'Diseña un programa ';

const DEFAULT_CODE = `Algoritmo Inicio
   
FinAlgoritmo`;

const EditingBoard: React.FC = () => {
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);

    const locationState = location.state as LocationState | null;
    const queryId = searchParams.get('id');
    const juegoId =
        locationState?.juegoId ?? (queryId ? Number(queryId) : undefined);

    const [enunciado, setEnunciado] = useState<string>(
        locationState?.juegoDescripcion || DEFAULT_INSTRUCCIONES
    );

    // Código inicial: si el enunciado es el de suma, cargamos el por defecto para demostración,
    // si no, cargamos una plantilla vacía.
    const [code, setCode] = useState<string>(() => {
        const initialEnunciado =
            locationState?.juegoDescripcion || DEFAULT_INSTRUCCIONES;
        if (
            initialEnunciado === DEFAULT_INSTRUCCIONES ||
            (initialEnunciado.includes('dos números') &&
                initialEnunciado.includes('sume'))
        ) {
            return DEFAULT_CODE;
        }
        return `Algoritmo SolucionIA
    // 1. Definir variables (Ej: Definir x Como Real)
    
    // 2. Leer entrada (Ej: Leer x)
    
    // 3. Operar (Ej: y <- x * 2)
    
    // 4. Mostrar resultado (Ej: Escribir y)
FinAlgoritmo`;
    });

    const [estadoGuardado, setEstadoGuardado] = useState<
        'guardado' | 'guardando' | 'sin_guardar'
    >('guardado');
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cargar progreso previo guardado al montar el componente
    useEffect(() => {
        if (!juegoId || !claveAcceso) return;

        let activo = true;

        const cargarProgreso = async () => {
            const juego = await obtenerJuegoIAPorId(claveAcceso, juegoId);
            if (!activo || !juego) return;

            if (juego.descripcion) {
                setEnunciado(juego.descripcion);
            }

            if (juego.estado_tablero) {
                try {
                    const parsed = JSON.parse(juego.estado_tablero);
                    if (parsed && typeof parsed.code === 'string') {
                        setCode(parsed.code);
                        setEstadoGuardado('guardado');
                        return;
                    }
                } catch {
                    // ignorar si no era JSON
                }

                if (
                    typeof juego.estado_tablero === 'string' &&
                    juego.estado_tablero.trim()
                ) {
                    setCode(juego.estado_tablero);
                    setEstadoGuardado('guardado');
                }
            }
        };

        void cargarProgreso();

        return () => {
            activo = false;
        };
    }, [juegoId, claveAcceso]);

    // Función de guardado en la base de datos
    const guardarProgresoEnBD = useCallback(
        async (codigoAGuardar: string, mostrarToast = false) => {
            if (!juegoId || !claveAcceso) return;

            setEstadoGuardado('guardando');

            try {
                await guardarEstadoTablero(claveAcceso, juegoId, {
                    code: codigoAGuardar,
                });
                setEstadoGuardado('guardado');

                try {
                    localStorage.setItem(
                        `editing_draft_${juegoId}`,
                        codigoAGuardar
                    );
                } catch {
                    // ignorar límites de storage
                }

                if (mostrarToast) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Progreso guardado',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true,
                    });
                }
            } catch (error) {
                console.error(
                    'Error guardando progreso de pseudocódigo:',
                    error
                );
                setEstadoGuardado('sin_guardar');
            }
        },
        [juegoId, claveAcceso]
    );

    const handleCodeChange = (nuevoCodigo: string) => {
        setCode(nuevoCodigo);
        setEstadoGuardado('sin_guardar');

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            void guardarProgresoEnBD(nuevoCodigo, false);
        }, 1500);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [counterRate, setCounterRate] = useState<number>(1);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    // Sincronizar scroll entre textarea y números de línea
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
        }
    };

    // Interceptar teclado para Tab y Enter
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = e.currentTarget;
        const { selectionStart, selectionEnd, value } = textarea;

        // Tab -> 4 espacios
        if (e.key === 'Tab') {
            e.preventDefault();
            const tabSpaces = '    ';
            const newValue =
                value.substring(0, selectionStart) +
                tabSpaces +
                value.substring(selectionEnd);
            handleCodeChange(newValue);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                    selectionStart + tabSpaces.length;
            }, 0);
        }

        // Enter -> Auto-indentación
        if (e.key === 'Enter') {
            e.preventDefault();
            const linesBeforeCursor = value
                .substring(0, selectionStart)
                .split('\n');
            const currentLine = linesBeforeCursor[linesBeforeCursor.length - 1];

            // Buscar espacios iniciales de la línea actual
            const match = currentLine.match(/^(\s*)/);
            const leadingWhitespace = match ? match[0] : '';

            const newValue =
                value.substring(0, selectionStart) +
                '\n' +
                leadingWhitespace +
                value.substring(selectionEnd);
            handleCodeChange(newValue);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                    selectionStart + 1 + leadingWhitespace.length;
            }, 0);
        }
    };

    // Ejecutar el pseudocódigo localmente (transpilado a JavaScript)
    const handleEjecutar = async () => {
        if (!code.trim()) {
            Swal.fire({
                title: 'Código vacío',
                text: 'Por favor, escribe tu pseudocódigo antes de ejecutar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF7C02',
            });
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
                        ? `<div style="text-align:left;color:#555;line-height:1.5;font-weight:bold;margin-bottom:8px;">${mensajePrevio}</div>`
                        : '';
                    const { value, isConfirmed } = await Swal.fire({
                        title: 'Entrada requerida (Leer)',
                        html: `${aviso}<div style="text-align:left;color:#333;line-height:1.5;">El algoritmo necesita el valor de <strong>${nombre}</strong>.</div>`,
                        input: 'text',
                        inputPlaceholder: `Escribe un valor para ${nombre}...`,
                        showCancelButton: true,
                        confirmButtonText: 'Enviar',
                        cancelButtonText: 'Cancelar',
                        confirmButtonColor: '#FF7C02',
                        customClass: {
                            title: 'titulo-celular',
                            confirmButton: 'btn-semitransparente',
                            icon: 'icono-celular',
                        },
                        width: '80%',
                    });

                    const valor = isConfirmed ? (value ?? '') : '';
                    setConsoleOutput((prev) => [
                        ...prev,
                        `> ${nombre} = ${valor}`,
                    ]);
                    return String(valor);
                },
            });

            setIsRunning(false);
            setConsoleOutput((prev) => [
                ...prev,
                '[Sistema] Ejecución finalizada.',
            ]);

            if (result.error) {
                setConsoleOutput((prev) => [
                    ...prev,
                    `[Error] ${result.error}`,
                ]);
                Swal.fire({
                    title: 'Error en la ejecución',
                    text: result.error,
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#FF7C02',
                });
                return;
            }
        } catch (err) {
            setIsRunning(false);
            setConsoleOutput((prev) => [
                ...prev,
                `[Error] ${err instanceof Error ? err.message : String(err)}`,
            ]);
            Swal.fire({
                title: 'Error inesperado',
                text: err instanceof Error ? err.message : String(err),
                icon: 'error',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#FF7C02',
            });
        }
    };

    // Validar con Inteligencia Artificial (Mistral)
    const handleVerificarIA = async () => {
        if (!code.trim()) {
            Swal.fire({
                title: 'Código vacío',
                text: 'Por favor, escribe tu pseudocódigo antes de verificar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF7C02',
            });
            return;
        }

        setIsVerifying(true);
        Swal.fire({
            title: 'Verificando pseudocódigo...',
            html: 'Por favor espera mientras la IA analiza la lógica de tu solución.',
            icon: 'info',
            iconColor: '#FF7C02',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const resultado = await verificarPseudocodigo(code, enunciado);
            setIsVerifying(false);

            const esValido =
                !resultado.toLowerCase().includes('incorrecto') &&
                !resultado.toLowerCase().includes('error') &&
                resultado.toLowerCase().includes('correcto');

            const swalResult = await Swal.fire({
                title: esValido
                    ? '✓ Pseudocódigo Correcto'
                    : '✗ Solución Incorrecta',
                html: `<div style="text-align: left; color: #333; line-height: 1.6;">${resultado}</div>`,
                icon: esValido ? 'success' : 'error',
                iconColor: esValido ? 'green' : '#e74c3c',
                confirmButtonText: esValido ? 'Excelente' : 'Reintentar',
                customClass: {
                    title: 'titulo-celular',
                    confirmButton: 'btn-semitransparente',
                    icon: 'icono-celular',
                },
                width: '80%',
            });

            // Si es válido y hay juegoId, marcar como completado y guardar estado
            if (esValido && swalResult.isConfirmed) {
                if (juegoId && claveAcceso) {
                    try {
                        void guardarProgresoEnBD(code, false);
                        if (counterRate === 1) {
                            await completarJuego(claveAcceso, juegoId);
                            console.log(
                                'Juego de pseudocódigo completado en base de datos:',
                                juegoId
                            );
                        }
                    } catch (err) {
                        console.error('Error al guardar completado:', err);
                    }
                    setCounterRate((prev) => prev + 1);
                }
            }
        } catch (error) {
            setIsVerifying(false);
            console.error('Error al verificar:', error);
            Swal.fire({
                title: 'Error de verificación',
                text: 'No se pudo comunicar con el servidor de IA. Inténtalo de nuevo.',
                icon: 'error',
                confirmButtonText: 'Cerrar',
            });
        }
    };

    const lines = code.split('\n');

    return (
        <div className="app">
            {/* Header / Toolbar */}
            <div
                className="toolbar"
                style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--toolbar-bg)',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                    }}
                >
                    <button
                        onClick={() => navigate('/ejercicios-ia')}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-h)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            padding: '5px',
                        }}
                        title="Volver a Ejercicios IA"
                    >
                        ←
                    </button>
                    <h2
                        style={{
                            margin: 0,
                            fontSize: '20px',
                            color: 'var(--text-h)',
                        }}
                    >
                        Editor de Pseudocódigo
                    </h2>
                </div>
                <div
                    className="toolbar-actions"
                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    {juegoId && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                color:
                                    estadoGuardado === 'guardando'
                                        ? '#FBBF24'
                                        : estadoGuardado === 'guardado'
                                        ? '#34D399'
                                        : '#9CA3AF',
                                marginRight: '6px',
                            }}
                        >
                            <span
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor:
                                        estadoGuardado === 'guardando'
                                            ? '#FBBF24'
                                            : estadoGuardado === 'guardado'
                                            ? '#34D399'
                                            : '#9CA3AF',
                                }}
                            />
                            <span>
                                {estadoGuardado === 'guardando'
                                    ? 'Guardando...'
                                    : estadoGuardado === 'guardado'
                                    ? 'Guardado'
                                    : 'Sin guardar'}
                            </span>
                        </div>
                    )}
                    {juegoId && (
                        <button
                            type="button"
                            onClick={() => void guardarProgresoEnBD(code, true)}
                            disabled={estadoGuardado === 'guardando'}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                color: 'white',
                                border: '1px solid rgba(255, 255, 255, 0.25)',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor:
                                    estadoGuardado === 'guardando'
                                        ? 'not-allowed'
                                        : 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                            title="Guardar progreso ahora"
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                                <polyline points="7 3 7 8 15 8"></polyline>
                            </svg>
                            Guardar
                        </button>
                    )}
                    <button
                        className="btn"
                        onClick={handleEjecutar}
                        disabled={isRunning}
                        style={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: isRunning ? 0.7 : 1,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            !isRunning &&
                            (e.currentTarget.style.transform = 'scale(1.03)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                    >
                        {isRunning ? '⏳ Ejecutando...' : '▶ Ejecutar'}
                    </button>
                    <button
                        className="btn"
                        onClick={handleVerificarIA}
                        disabled={isVerifying}
                        style={{
                            backgroundColor: '#22C55E',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            opacity: isVerifying ? 0.7 : 1,
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            !isVerifying &&
                            (e.currentTarget.style.transform = 'scale(1.03)')
                        }
                        onMouseLeave={(e) =>
                            !isVerifying &&
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                    >
                        ✨ Verificar con IA
                    </button>
                </div>
            </div>

            {/* Layout Principal */}
            <div
                style={{
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minHeight: 0,
                }}
            >
                {/* Enunciado del Ejercicio */}
                <div
                    style={{
                        padding: '12px 20px',
                        margin: '12px 15px 5px 15px',
                        backgroundColor: 'rgba(217, 217, 217, 0.1)',
                        borderRadius: '10px',
                        borderLeft: '4px solid #FF7C02',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        flexShrink: 0,
                    }}
                >
                    <h3
                        style={{
                            margin: '0 0 4px 0',
                            color: '#FF7C02',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        Enunciado del Problema
                    </h3>
                    <p
                        style={{
                            margin: '0',
                            color: 'var(--text-h)',
                            lineHeight: '1.4',
                            fontSize: '14px',
                        }}
                    >
                        {enunciado}
                    </p>
                </div>

                {/* Editor y Consola */}
                <div
                    style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        gap: '15px',
                        padding: '10px 15px 15px 15px',
                        minHeight: 0,
                        overflow: 'hidden',
                    }}
                    className="main-layout-panels"
                >
                    {/* Panel Izquierdo: Editor con Sidebar de Números Integrado */}
                    <div
                        style={{
                            flex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--code-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            minWidth: 0,
                            minHeight: 0,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                        }}
                    >
                        {/* Editor Header */}
                        <div
                            style={{
                                padding: '8px 15px',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    color: 'var(--text)',
                                }}
                            >
                                pseint_editor.psc
                            </span>
                            <span
                                style={{ fontSize: '11px', color: '#858585' }}
                            >
                                UTF-8
                            </span>
                        </div>

                        {/* Editor Body: Sidebar de números + Textarea contenidos */}
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: 0,
                            }}
                        >
                            {/* Panel/Sidebar de Números de línea */}
                            <div
                                ref={lineNumbersRef}
                                style={{
                                    width: '55px',
                                    minWidth: '55px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: '#888',
                                    padding: '12px 0',
                                    textAlign: 'right',
                                    paddingRight: '10px',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '13px',
                                    lineHeight: '24px',
                                    borderRight: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    userSelect: 'none',
                                    boxSizing: 'border-box',
                                }}
                            >
                                {lines.map((_, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            height: '24px',
                                            lineHeight: '24px',
                                        }}
                                    >
                                        {i + 1}
                                    </div>
                                ))}
                            </div>

                            {/* Campo de Texto del Código */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => handleCodeChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onScroll={handleScroll}
                                wrap="off"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-h)',
                                    border: 'none',
                                    outline: 'none',
                                    padding: '12px',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '13px',
                                    lineHeight: '24px',
                                    resize: 'none',
                                    whiteSpace: 'pre',
                                    overflow: 'auto',
                                    boxSizing: 'border-box',
                                }}
                                placeholder="// Escribe tu pseudocódigo aquí..."
                            />
                        </div>
                    </div>

                    {/* Panel Derecho: Consola y Guía Rápida */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            minWidth: 0,
                            minHeight: 0,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Simulación de Consola */}
                        <div
                            style={{
                                flex: 1,
                                backgroundColor: '#1e1e1e',
                                borderRadius: '10px',
                                border: '1px solid #333',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                                minHeight: 0,
                            }}
                        >
                            <div
                                style={{
                                    backgroundColor: '#2d2d2d',
                                    padding: '8px 15px',
                                    color: '#ccc',
                                    fontSize: '13px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: '1px solid #444',
                                    flexShrink: 0,
                                }}
                            >
                                <span>📟 Consola de Salida</span>
                                <button
                                    onClick={() => setConsoleOutput([])}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#888',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    Limpiar
                                </button>
                            </div>
                            <div
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '12px',
                                    color: '#00FF00',
                                    overflowY: 'auto',
                                    lineHeight: '1.6',
                                }}
                            >
                                {consoleOutput.length === 0 ? (
                                    <span style={{ color: '#888' }}>
                                        Haz clic en "Ejecutar" para ver la
                                        simulación de tu código aquí.
                                    </span>
                                ) : (
                                    consoleOutput.map((log, index) => (
                                        <div
                                            key={index}
                                            style={{ whiteSpace: 'pre-wrap' }}
                                        >
                                            {log}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Guía Rápida */}
                        <div
                            style={{
                                backgroundColor: 'var(--sidebar-bg)',
                                border: '1px solid var(--border)',
                                borderRadius: '10px',
                                padding: '15px',
                                fontSize: '13px',
                                color: 'var(--text)',
                                lineHeight: '1.5',
                                flexShrink: 0,
                                overflowY: 'auto',
                                maxHeight: '45%',
                            }}
                        >
                            <h4
                                style={{
                                    margin: '0 0 10px 0',
                                    color: 'var(--text-h)',
                                    fontWeight: 'bold',
                                }}
                            >
                                💡 Guía Rápida de Pseudocódigo (PseInt)
                            </h4>
                            <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Estructura:</strong> Comienza con{' '}
                                    <code>Algoritmo Nombre</code> y termina con{' '}
                                    <code>FinAlgoritmo</code>.
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Variables:</strong>{' '}
                                    <code>
                                        Definir variable Como Real
                                    </code>
                                    .
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Asignación:</strong> Usa{' '}
                                    <code>&lt;-</code> (Ej:{' '}
                                    <code>a &lt;- b + c</code>).
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Entrada:</strong> Usa{' '}
                                    <code>Leer variable</code>.
                                </li>
                                <li>
                                    <strong>Salida:</strong> Usa{' '}
                                    <code>Escribir "Mensaje"</code>.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditingBoard;
