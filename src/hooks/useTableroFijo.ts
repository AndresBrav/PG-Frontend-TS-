import { useState, useEffect, useRef, useCallback } from 'react';
import type { Layout } from 'react-grid-layout';
import Swal from 'sweetalert2';
import {
    obtenerEstadoJuegoApi,
    guardarEstadoJuegoApi,
    reiniciarEstadoJuegoApi,
} from '../api/juegosFijosApi';

export function useTableroFijo(
    juegoId: number | string,
    initialLayout: Layout[],
    claveAcceso: string,
) {
    const [layout, setLayout] = useState<Layout[]>(initialLayout);
    const [cargando, setCargando] = useState<boolean>(true);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [guardado, setGuardado] = useState<boolean>(false);

    const cargadoRef = useRef<boolean>(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ultimoLayoutGuardadoRef = useRef<string>('');

    // 1. Cargar estado guardado al iniciar
    useEffect(() => {
        let montado = true;

        const cargarEstado = async () => {
            if (!claveAcceso) {
                setCargando(false);
                cargadoRef.current = true;
                return;
            }

            try {
                const data = await obtenerEstadoJuegoApi(claveAcceso, juegoId);
                if (montado && data?.estado_juego) {
                    try {
                        const parsed = JSON.parse(data.estado_juego);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            setLayout(parsed);
                            ultimoLayoutGuardadoRef.current = JSON.stringify(parsed);
                        }
                    } catch (e) {
                        console.error('Error al parsear estado_juego guardado:', e);
                    }
                } else if (montado) {
                    ultimoLayoutGuardadoRef.current = JSON.stringify(initialLayout);
                }
            } catch (err) {
                console.error('Error al cargar progreso del juego fijo:', err);
            } finally {
                if (montado) {
                    setCargando(false);
                    setTimeout(() => {
                        cargadoRef.current = true;
                    }, 500);
                }
            }
        };

        cargarEstado();

        return () => {
            montado = false;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [claveAcceso, juegoId, initialLayout]);

    // Función de guardado directo en backend
    const guardarDirecto = useCallback(
        async (layoutAGuardar: Layout[]) => {
            if (!claveAcceso) return;
            const serializado = JSON.stringify(layoutAGuardar);
            if (serializado === ultimoLayoutGuardadoRef.current) return;

            setGuardando(true);
            const ok = await guardarEstadoJuegoApi(
                claveAcceso,
                juegoId,
                layoutAGuardar,
            );
            setGuardando(false);
            if (ok) {
                ultimoLayoutGuardadoRef.current = serializado;
                setGuardado(true);
                setTimeout(() => setGuardado(false), 2500);
            }
        },
        [claveAcceso, juegoId],
    );

    // 2. Manejador de cambio de layout con debounce de auto-guardado
    const handleLayoutChange = useCallback(
        (newLayout: Layout[]) => {
            setLayout(newLayout);

            if (!cargadoRef.current) return;

            const serializado = JSON.stringify(newLayout);
            if (serializado === ultimoLayoutGuardadoRef.current) return;

            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                guardarDirecto(newLayout);
            }, 1500);
        },
        [guardarDirecto],
    );

    // Guardado manual
    const guardarManual = useCallback(async () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        await guardarDirecto(layout);
    }, [guardarDirecto, layout]);

    // Reiniciar tablero a las posiciones iniciales
    const reiniciarTablero = useCallback(async () => {
        const confirmacion = await Swal.fire({
            title: '¿Reiniciar ejercicio?',
            text: 'Se restablecerán las fichas a sus posiciones originales.',
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
            setLayout(initialLayout);
            ultimoLayoutGuardadoRef.current = JSON.stringify(initialLayout);

            if (claveAcceso) {
                await reiniciarEstadoJuegoApi(claveAcceso, juegoId);
            }

            Swal.fire({
                title: 'Tablero reiniciado',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
            });
        }
    }, [claveAcceso, initialLayout, juegoId]);

    return {
        layout,
        setLayout: handleLayoutChange,
        cargando,
        guardando,
        guardado,
        guardarManual,
        reiniciarTablero,
    };
}
