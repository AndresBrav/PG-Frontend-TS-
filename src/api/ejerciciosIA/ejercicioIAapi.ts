import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export const traerJuegosIA = async (clave: string): Promise<any> => {
    try {
        // Axios devuelve un objeto AxiosResponse, y el dato util esta en .data
        const response = await axios.get(`${API}/juegos/traerJuegosConIA`, {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        });

        //
        if (!response.data) return null;
        console.log(
            'el arreglo que se trae es .................. ',
            response.data.juegosIA
        );
        const { juegosIA, msg } = response.data;
        return { juegosIA, msg };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

export const traerJuegosIAPseudo = async (clave: string): Promise<any> => {
    try {
        // Axios devuelve un objeto AxiosResponse, y el dato util esta
        //  en .data
        const response = await axios.get(
            `${API}/juegos/traerJuegosConIAPseudo`,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        //
        if (!response.data) return null;
        console.log(
            'el arreglo que se trae es .................. ',
            response.data.juegosIA
        );
        const { juegosIA, msg } = response.data;
        return { juegosIA, msg };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

interface DatosJuegoIA {
    descripcion: string;
    tipo_juego: string;
    completado: boolean;
    puntos: number;
    temario_id?: number;
}

export interface CuotaGeneracionIA {
    limite: number;
    usados: number;
    restantes: number;
    fecha: string;
}

export interface CuotaRevisionIA {
    limite: number;
    usados: number;
    restantes: number;
    fecha: string;
}

interface RespuestaGeneracionIA {
    ejercicio: string;
    cuota: CuotaGeneracionIA | null;
}

interface RespuestaRevisionIA {
    resultado: string;
    cuota: CuotaRevisionIA;
}

export const obtenerCuotaRevisionIA = async (
    clave: string,
    juegoId: number
): Promise<CuotaRevisionIA> => {
    const response = await axios.get(
        `${API}/juegos/ia/${juegoId}/cuota-revision`,
        {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        }
    );

    return response.data.cuota;
};

export const revisarDiagramaIA = async (
    clave: string,
    juegoId: number,
    diagrama: unknown
): Promise<RespuestaRevisionIA> => {
    const response = await axios.post<RespuestaRevisionIA>(
        `${API}/juegos/ia/${juegoId}/revisar-diagrama`,
        { diagrama },
        {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        }
    );

    return response.data;
};

export const revisarPseudocodigoIA = async (
    clave: string,
    juegoId: number,
    pseudocodigo: string
): Promise<RespuestaRevisionIA> => {
    const response = await axios.post<RespuestaRevisionIA>(
        `${API}/juegos/ia/${juegoId}/revisar-pseudocodigo`,
        { pseudocodigo },
        {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        }
    );

    return response.data;
};

export const obtenerCuotaGeneracionIA = async (
    clave: string
): Promise<CuotaGeneracionIA | null> => {
    const response = await axios.get(`${API}/juegos/cuota-generacion-ia`, {
        headers: {
            Authorization: clave,
            'ngrok-skip-browser-warning': 'true',
        },
    });

    return response.data?.cuota ?? null;
};

export const generarEjercicioIA = async (
    clave: string,
    tipoJuego: 'ia' | 'iapseudo',
    temarioId?: number
): Promise<RespuestaGeneracionIA> => {
    const response = await axios.post<RespuestaGeneracionIA>(
        `${API}/juegos/generar-ejercicio-ia`,
        {
            tipo_juego: tipoJuego,
            ...(temarioId !== undefined ? { temario_id: temarioId } : {}),
        },
        {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        }
    );

    return response.data;
};

/** Temarios globales de IA (clasificación de ejercicios de pseudocódigo). */
export const traerTemariosIA = async (clave: string): Promise<any> => {
    try {
        const response = await axios.get(`${API}/juegos/temarios`, {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        });
        return response.data?.temarios ?? [];
    } catch (error) {
        console.error('Error al traer temarios IA:', error);
        return [];
    }
};

export const guardarJuegoIA = async (
    clave: string,
    datos: DatosJuegoIA
): Promise<any> => {
    try {
        const response = await axios.post(
            `${API}/juegos/guardarjuegoIA`,
            datos,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        if (!response.data) return null;
        console.log('Juego guardado exitosamente:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error guardando juego:', error);
        return null;
    }
};

export const obtenerJuegoIAPorId = async (
    clave: string,
    juegoId: number
): Promise<any> => {
    try {
        const response = await axios.get(`${API}/juegos/ia/${juegoId}`, {
            headers: {
                Authorization: clave,
                'ngrok-skip-browser-warning': 'true',
            },
        });
        return response.data?.juego ?? null;
    } catch (error) {
        console.error('Error obteniendo juego IA:', error);
        return null;
    }
};

export const guardarEstadoTablero = async (
    clave: string,
    juegoId: number,
    estadoTablero: object | string
): Promise<any> => {
    try {
        const payload =
            typeof estadoTablero === 'object'
                ? JSON.stringify(estadoTablero)
                : estadoTablero;

        const response = await axios.put(
            `${API}/juegos/guardarTablero/${juegoId}`,
            { estado_tablero: payload },
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error guardando estado del tablero:', error);
        return null;
    }
};

export const reiniciarEstadoTableroApi = async (
    clave: string,
    juegoId: number
): Promise<boolean> => {
    try {
        await axios.put(
            `${API}/juegos/reiniciarTablero/${juegoId}`,
            {},
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );
        return true;
    } catch (error) {
        console.error('Error al reiniciar estado del tablero IA:', error);
        return false;
    }
};
