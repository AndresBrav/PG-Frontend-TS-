import React, {
    useState,
    useRef,
    useContext,
    useEffect,
    useCallback,
} from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { TokenContext } from '../../../../Context/TokenContext';
import { completarJuego } from '../../../../api/ejerciciosIA/ejercicios';
import { verificarPseudocodigo } from '../../../../api/ejerciciosIA/verificarPseudocodigo';
import {
    ERROR_CANCELADO,
    ejecutarPseudocodigo,
    esCanceladoPorUsuario,
} from './pseintCompiler';
import {
    obtenerJuegoIAPorId,
    guardarEstadoTablero,
    reiniciarEstadoTableroApi,
} from '../../../../api/ejerciciosIA/ejercicioIAapi';
import '../app.css';

interface LocationState {
    juegoId?: number;
    juegoDescripcion?: string;
}

const DEFAULT_INSTRUCCIONES = 'Diseña un programa ';

const DEFAULT_CODE = `Algoritmo Inicio
   
FinAlgoritmo`;

const obtenerCodigoPlantilla = (textoEnunciado: string) => {
    if (
        textoEnunciado === DEFAULT_INSTRUCCIONES ||
        (textoEnunciado.includes('dos n') && textoEnunciado.includes('sume'))
    ) {
        return DEFAULT_CODE;
    }
    return `Algoritmo SolucionIA
    // 1. Definir variables (Ej: Definir x Como Real)
    
    // 2. Leer entrada (Ej: Leer x)
    
    // 3. Operar (Ej: y <- x * 2)
    
    // 4. Mostrar resultado (Ej: Escribir y)
FinAlgoritmo`;
};

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

    // Código inicial: según el enunciado cargamos la plantilla adecuada
    const [code, setCode] = useState<string>(() => {
        const initialEnunciado =
            locationState?.juegoDescripcion || DEFAULT_INSTRUCCIONES;
        return obtenerCodigoPlantilla(initialEnunciado);
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

    // Funcion de guardado en la base de datos
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
                    // ignorar li­mites de storage
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
                    'Error guardando progreso de pseudocodigo:',
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

    const handleReiniciar = async () => {
        const confirmacion = await Swal.fire({
            title: '¿Reiniciar ejercicio?',
            text: 'Se restablecerá el editor de pseudocódigo a la plantilla inicial y se limpiará la consola.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e11919',
        });

        if (confirmacion.isConfirmed) {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            const plantilla = obtenerCodigoPlantilla(enunciado);
            setCode(plantilla);
            setConsoleOutput([]);

            if (juegoId) {
                try {
                    localStorage.removeItem(`editing_draft_${juegoId}`);
                } catch {
                    // ignorar
                }

                if (claveAcceso) {
                    await reiniciarEstadoTableroApi(claveAcceso, juegoId);
                }
            }

            setEstadoGuardado('guardado');

            Swal.fire({
                title: 'Código reiniciado',
                text: 'El editor ha vuelto a su plantilla inicial.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        }
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

    // Sincronizar scroll entre textarea y numeros de linea
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

        // Enter -> Auto-indentacion
        if (e.key === 'Enter') {
            e.preventDefault();
            const linesBeforeCursor = value
                .substring(0, selectionStart)
                .split('\n');
            const currentLine = linesBeforeCursor[linesBeforeCursor.length - 1];

            // Buscar espacios iniciales de la li­nea actual
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

    // Ejecutar el pseudocodigo localmente (transpilado a JavaScript)
    const handleEjecutar = async () => {
        if (!code.trim()) {
            Swal.fire({
                title: 'Codigo vaci­o',
                text: 'Por favor, escribe tu pseudocodigo antes de ejecutar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF7C02',
            });
            return;
        }

        setIsRunning(true);
        setConsoleOutput(['[Sistema] Iniciando ejecucion del pseudocodigo...']);

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

                    if (!isConfirmed) {
                        // Cancelar detiene TODA la ejecución, no solo esta iteración
                        setConsoleOutput((prev) => [
                            ...prev,
                            `> ${nombre} = (cancelado)`,
                            '[Sistema] Ejecucion cancelada por el usuario.',
                        ]);
                        throw new Error(ERROR_CANCELADO);
                    }
                    const valor = value ?? '';
                    setConsoleOutput((prev) => [
                        ...prev,
                        `> ${nombre} = ${valor}`,
                    ]);
                    return String(valor);
                },
            });

            setIsRunning(false);

            if (result.error) {
                if (esCanceladoPorUsuario(result.error)) {
                    return;
                }
                setConsoleOutput((prev) => [
                    ...prev,
                    '[Sistema] Ejecucion finalizada.',
                    `[Error] ${result.error}`,
                ]);
                Swal.fire({
                    title: 'Error en la ejecucion',
                    text: result.error,
                    icon: 'error',
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#FF7C02',
                });
                return;
            }

            setConsoleOutput((prev) => [
                ...prev,
                '[Sistema] Ejecucion finalizada.',
            ]);
        } catch (err) {
            setIsRunning(false);
            if (esCanceladoPorUsuario(err)) {
                setConsoleOutput((prev) => [
                    ...prev,
                    '[Sistema] Ejecucion cancelada por el usuario.',
                ]);
                return;
            }
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
                title: 'Codigo vaci­o',
                text: 'Por favor, escribe tu pseudocodigo antes de verificar.',
                icon: 'warning',
                confirmButtonText: 'Entendido',
                confirmButtonColor: '#FF7C02',
            });
            return;
        }

        setIsVerifying(true);
        Swal.fire({
            title: 'Verificando pseudocodigo...',
            html: 'Por favor espera mientras la IA analiza la logica de tu solucion.',
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
                    ? '✓ Pseudocodigo Correcto'
                    : '✗ Solucion Incorrecta',
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

            // Si es valido y hay juegoId, marcar como completado y guardar estado
            if (esValido && swalResult.isConfirmed) {
                if (juegoId && claveAcceso) {
                    try {
                        void guardarProgresoEnBD(code, false);
                        if (counterRate === 1) {
                            await completarJuego(claveAcceso, juegoId);
                            console.log(
                                'Juego de pseudocodigo completado en base de datos:',
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
                title: 'Error de verificacion',
                text: 'No se pudo comunicar con el servidor de IA. Intente de nuevo.',
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
                        Editor de Pseudocodigo
                    </h2>
                </div>
                <div
                    className="toolbar-actions"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
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
                            onClick={handleReiniciar}
                            disabled={estadoGuardado === 'guardando'}
                            style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
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
                            onMouseEnter={(e) => {
                                if (estadoGuardado !== 'guardando') {
                                    e.currentTarget.style.backgroundColor =
                                        'rgba(239, 68, 68, 0.35)';
                                    e.currentTarget.style.color = '#ffffff';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (estadoGuardado !== 'guardando') {
                                    e.currentTarget.style.backgroundColor =
                                        'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.color = '#fca5a5';
                                }
                            }}
                            title="Restablecer código a plantilla inicial"
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
                                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Reiniciar
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
                    {/* Panel Izquierdo: Editor con Sidebar de Numeros Integrado */}
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

                        {/* Editor Body: Sidebar de numeros + Textarea contenidos */}
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                position: 'relative',
                                overflow: 'hidden',
                                minHeight: 0,
                            }}
                        >
                            {/* Panel/Sidebar de Numeros de linea */}
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

                            {/* Campo de Texto del Codigo */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) =>
                                    handleCodeChange(e.target.value)
                                }
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
                                placeholder="// Escribe tu pseudocodigo aqui..."
                            />
                        </div>
                    </div>

                    {/* Panel Derecho: Consola y Guia Rapida */}
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
                        {/* Simulacion de Consola */}
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
                                        simulacion de tu codigo aqui.
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

                        {/* Guia Rapida */}
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
                                💡 Guia Rapida de Pseudocodigo (PseInt)
                            </h4>
                            <ul style={{ paddingLeft: '18px', margin: 0 }}>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Estructura:</strong> Comienza con{' '}
                                    <code>Algoritmo Nombre</code> y termina con{' '}
                                    <code>FinAlgoritmo</code>.
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Variables:</strong>{' '}
                                    <code>Definir variable Como Real</code>.
                                </li>
                                <li style={{ marginBottom: '4px' }}>
                                    <strong>Asignacion:</strong> Usa{' '}
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
