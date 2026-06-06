import React, { useState, useRef, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { TokenContext } from '../../../../Context/TokenContext';
import { completarJuego } from '../../../../api/ejerciciosIA/ejercicios';
import { verificarPseudocodigo } from '../../../../api/ejerciciosIA/verificarPseudocodigo';
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
    const navigate = useNavigate();
    const { claveAcceso } = useContext(TokenContext);

    const { juegoId, juegoDescripcion } =
        (location.state as LocationState) || {};

    const enunciado = juegoDescripcion || DEFAULT_INSTRUCCIONES;

    // Código inicial: si el enunciado es el de suma, cargamos el por defecto para demostración,
    // si no, cargamos una plantilla vacía.
    const [code, setCode] = useState<string>(() => {
        if (
            enunciado === DEFAULT_INSTRUCCIONES ||
            (enunciado.includes('dos números') && enunciado.includes('sume'))
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

    const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
    const [isVerifying, setIsVerifying] = useState<boolean>(false);
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
            setCode(newValue);

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
            setCode(newValue);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                    selectionStart + 1 + leadingWhitespace.length;
            }, 0);
        }
    };

    // Ejecutar localmente (imprime en console.log y en la consola simulada)
    const handleEjecutar = () => {
        const lineas = code.split('\n');

        console.log('--- EJECUTANDO PSEUDOCODIGO ---');
        lineas.forEach((linea, i) => {
            console.log(`Línea ${i + 1}: ${linea}`);
        });
        console.log('--------------------------------');

        const logs = [
            `[Sistema] Iniciando simulación de pseudocódigo...`,
            ...lineas.map(
                (linea, i) => `[L-${String(i + 1).padStart(2, '0')}] ${linea}`
            ),
            `[Sistema] Ejecución finalizada. ${lineas.length} líneas procesadas. Verificado en console.log.`,
        ];

        setConsoleOutput(logs);

        Swal.fire({
            title: 'Ejecutado correctamente',
            text: 'Se han impreso todas las líneas del código en la consola del navegador.',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#FF7C02',
            customClass: {
                title: 'titulo-celular',
                confirmButton: 'btn-semitransparente',
                icon: 'icono-celular',
            },
            width: '80%',
        });
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

            // Si es válido y hay juegoId, marcar como completado
            if (esValido && swalResult.isConfirmed) {
                if (juegoId && claveAcceso) {
                    try {
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
                        onClick={() => navigate('/dashboardIA')}
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
                        title="Volver al Dashboard"
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
                    style={{ display: 'flex', gap: '10px' }}
                >
                    <button
                        className="btn"
                        onClick={handleEjecutar}
                        style={{
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'scale(1.03)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                    >
                        ▶ Ejecutar
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
                }}
            >
                {/* Enunciado del Ejercicio */}
                <div
                    style={{
                        padding: '15px 20px',
                        margin: '15px',
                        backgroundColor: 'rgba(217, 217, 217, 0.1)',
                        borderRadius: '10px',
                        borderLeft: '4px solid #FF7C02',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    }}
                >
                    <h3
                        style={{
                            margin: '0 0 5px 0',
                            color: '#FF7C02',
                            fontSize: '15px',
                            fontWeight: 'bold',
                        }}
                    >
                        Enunciado del Problema
                    </h3>
                    <p
                        style={{
                            margin: '0',
                            color: 'var(--text-h)',
                            lineHeight: '1.5',
                            fontSize: '15px',
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
                        padding: '0 15px 15px 15px',
                        minHeight: 0,
                        flexWrap: 'wrap',
                    }}
                    className="main-layout-panels"
                >
                    {/* Panel Izquierdo: Editor */}
                    <div
                        style={{
                            flex: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: 'var(--code-bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            minWidth: '320px',
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

                        {/* Editor Body */}
                        <div
                            style={{
                                display: 'flex',
                                flex: 1,
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Números de línea */}
                            <div
                                ref={lineNumbersRef}
                                style={{
                                    width: '45px',
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    color: '#888',
                                    padding: '12px 0',
                                    textAlign: 'center',
                                    fontFamily: 'var(--mono)',
                                    fontSize: '14px',
                                    lineHeight: '24px',
                                    borderRight: '1px solid var(--border)',
                                    overflow: 'hidden',
                                    userSelect: 'none',
                                }}
                            >
                                {lines.map((_, i) => (
                                    <div key={i}>{i + 1}</div>
                                ))}
                            </div>

                            {/* Campo de Texto */}
                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
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
                                    fontSize: '14px',
                                    lineHeight: '24px',
                                    resize: 'none',
                                    whiteSpace: 'pre',
                                    overflow: 'auto',
                                }}
                                placeholder="// Escribe tu pseudocódigo aquí..."
                            />
                        </div>
                    </div>

                    {/* Panel Derecho: Consola y Guía */}
                    <div
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            minWidth: '280px',
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
                                    borderBottom: '1px solid #444',
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
                                <li>
                                    <strong>Estructura:</strong> Comienza con{' '}
                                    <code>Algoritmo Nombre</code> y termina con{' '}
                                    <code>FinAlgoritmo</code>.
                                </li>
                                <li>
                                    <strong>Variables:</strong>{' '}
                                    <code>
                                        Definir variable Como
                                        Real/Entero/Caracter
                                    </code>
                                    .
                                </li>
                                <li>
                                    <strong>Asignación:</strong> Usa la flecha{' '}
                                    <code>&lt;-</code> (Ej:{' '}
                                    <code>resultado &lt;- a + b</code>).
                                </li>
                                <li>
                                    <strong>Entrada:</strong> Usa{' '}
                                    <code>Leer variable</code> para ingresar un
                                    valor.
                                </li>
                                <li>
                                    <strong>Salida:</strong> Usa{' '}
                                    <code>Escribir "Mensaje"</code> para
                                    imprimir.
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
