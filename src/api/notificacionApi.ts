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
        // Axios devuelve un objeto AxiosResponse, y el dato útil está en .data
        const response = await axios.get<RespuestaNotificaciones>(
            `${API}/notificaciones/consultar`,
            {
                headers: {
                    Authorization: clave,
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        // response.data ya es de tipo RespuestaNotificaciones
        if (!response.data) return null;
        console.log('el arreglo que se trae es ', response.data.arreglonoti);
        const { msg, arreglonoti } = response.data;
        return { msg, arreglonoti };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return null;
    }
};

export const enviarIdNotificacion = async (id: number, claveAcceso: string) => {
    console.log('la clave de acceso es ', claveAcceso);
    try {
        const response = await axios.put(
            `${API}/notificaciones/actualizar/${id}`, // ruta correcta
            {}, // body vacío
            {
                headers: {
                    Authorization: claveAcceso, // 🔑 agrega Bearer si tu backend lo espera
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        console.log('la respuesta del servidor es ', response.data);
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
    clave: string
): Promise<PuntuacionUsuario[] | null> => {
    try {
        const response = await axios.get<PuntuacionUsuario[]>(
            `${API}/notificaciones/puntuacion`,
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

