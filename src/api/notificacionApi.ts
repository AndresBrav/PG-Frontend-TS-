import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

interface Notificacion {
    id: number;
    descripcion: string;
    fecha: string;
}

interface RespuestaNotificaciones {
    msg: string;
    arreglonoti: Notificacion[];
}

export const traerNotificaciones = async (
    clave: string
): Promise<RespuestaNotificaciones | null> => {
    try {
        const response = await axios.get<RespuestaNotificaciones>(
            `${API}/notificaciones/consultar`,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        if (!response.data) return null;
        const { msg, arreglonoti } = response.data;
        return { msg, arreglonoti };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

export const enviarIdNotificacion = async (id: number, claveAcceso: string) => {
    try {
        await axios.put(
            `${API}/notificaciones/actualizar/${id}`,
            {},
            {
                headers: {
                    Authorization: claveAcceso,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );
    } catch (error: any) {
        console.error(
            'error fetching data:',
            error.response?.status,
            error.response?.data
        );
    }
};

export interface PuntuacionUsuario {
    username: string;
    puntuacionTotal: number;
}

export const traerTableroPuntuacion = async (
    clave: string,
    tipo?: 'fijos' | 'ia' | 'total'
): Promise<PuntuacionUsuario[] | null> => {
    try {
        const query = tipo ? `?tipo=${tipo}` : '';
        const response = await axios.get<PuntuacionUsuario[]>(
            `${API}/notificaciones/puntuacion${query}`,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching score board:', error);
        return null;
    }
};
