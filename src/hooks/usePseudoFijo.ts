import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import {
    obtenerEstadoJuegoApi,
    guardarEstadoJuegoApi,
    reiniciarEstadoJuegoApi,
} from '../api/juegosFijosApi';

// Persistencia de los ejercicios fijos de pseudocódigo (Nivel 2).
// Igual patrón que useTableroFijo (Nivel 1) pero serializando
// { available, selected } en el campo estado_juego (endpoints genéricos
// /juegos/estado, /guardarEstado y /reiniciarEstado).
export function usePseudoFijo<T>(
    juegoId: number | string,
    initialCode: T[],
    claveAcceso: string | undefined
) {
    const [available, setAvailable] = useState<T[]>(initialCode);
    const [selected, setSelected] = useState<T[]>([]);
    const [cargando, setCargando] = useState<boolean>(true);
    const [guardando, setGuardando] = useState<boolean>(false);
    const [guardado, setGuardado] = useState<boolean>(false);

    const cargadoRef = useRef<boolean>(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ultimoGuardadoRef = useRef<string>('');

    // 1. Cargar estado guardado al iniciar
    useEffect(() => {
        let montado = true;

        const cargarEstado = async () => {
            if (!claveAcceso) {
                setCargando(false);
                return;
            }

            try {
                const data = await obtenerEstadoJuegoApi(claveAcceso, juegoId);
                if (montado && data?.estado_juego) {
                    try {
                        const parsed = JSON.parse(data.estado_juego);
                        if (
                            Array.isArray(parsed?.available) &&
                            Array.isArray(parsed?.selected)
                        ) {
                            setAvailable(parsed.available);
                            setSelected(parsed.selected);
                            ultimoGuardadoRef.current = data.estado_juego;
                        }
                    } catch (e) {
                        console.error(
                            'Error al parsear estado de pseudocódigo guardado:',
                            e
                        );
                    }
                }
            } catch (err) {
                console.error(
                    'Error al cargar progreso del ejercicio de pseudocódigo:',
                    err
                );
            } finally {
                if (montado) {
                    setCargando(false);
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
    }, [claveAcceso, juegoId]);

    // Habilitar el autoguardado solo después de cargar
    useEffect(() => {
        if (cargando) return;
        const t = setTimeout(() => {
            cargadoRef.current = true;
        }, 300);
        return () => clearTimeout(t);
    }, [cargando]);

    // 2. Auto-guardado debounced cuando cambian las columnas
    useEffect(() => {
        if (!cargadoRef.current || !claveAcceso) return;

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        const timer = setTimeout(async () => {
            const serializado = JSON.stringify({ available, selected });
            if (serializado === ultimoGuardadoRef.current) return;

            setGuardando(true);
            const ok = await guardarEstadoJuegoApi(claveAcceso, juegoId, {
                available,
                selected,
            });
            setGuardando(false);
            if (ok) {
                ultimoGuardadoRef.current = serializado;
                setGuardado(true);
                setTimeout(() => setGuardado(false), 2500);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [available, selected, claveAcceso, juegoId]);

    // 3. Guardado manual (fuerza el guardado inmediato)
    const guardarEstadoActual = async () => {
        if (!claveAcceso) return;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        await guardarEstadoJuegoApi(claveAcceso, juegoId, {
            available,
            selected,
        });
    };

    // 4. Reiniciar: borra el estado guardado y devuelve las líneas al banco
    // (con la misma confirmación que useTableroFijo en Nivel 1)
    const reiniciarTablero = async () => {
        const confirmacion = await Swal.fire({
            title: '¿Reiniciar ejercicio?',
            text: 'Se restablecerán las líneas a su orden original.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reiniciar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e11919',
        });

        if (!confirmacion.isConfirmed) return;

        if (!claveAcceso) return;
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        setAvailable(initialCode);
        setSelected([]);
        ultimoGuardadoRef.current = JSON.stringify({
            available: initialCode,
            selected: [],
        });
        await reiniciarEstadoJuegoApi(claveAcceso, juegoId);

        Swal.fire({
            title: 'Tablero reiniciado',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
        });
    };

    return {
        available,
        selected,
        setAvailable,
        setSelected,
        cargando,
        guardando,
        guardado,
        guardarEstadoActual,
        reiniciarTablero,
    };
}
