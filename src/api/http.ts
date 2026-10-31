import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

interface RespuestaError {
    message?: string;
    msg?: string;
}

export const api = axios.create({
    baseURL: API,
    headers: {
        'ngrok-skip-browser-warning': 'true',
    },
});

/** Cabeceras que espera el backend: el token va tal cual, sin "Bearer". */
export const configConToken = (clave: string) => ({
    headers: {
        Authorization: clave,
    },
});

const extraerMensaje = (data: unknown): string | null => {
    if (typeof data === 'string' && data.trim()) {
        return data;
    }

    if (data && typeof data === 'object') {
        const respuesta = data as RespuestaError;
        return respuesta.message ?? respuesta.msg ?? null;
    }

    return null;
};

export const obtenerMensajeError = (
    error: unknown,
    mensajePorDefecto: string,
): string => {
    if (axios.isAxiosError(error)) {
        const mensaje = extraerMensaje(error.response?.data);
        return mensaje ?? error.message ?? mensajePorDefecto;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return mensajePorDefecto;
};

/**
 * El backend responde 403 si falta el token, 400 si es inválido y 401 desde
 * cargarUsuarioActual. Cualquiera de esos casos obliga a volver al login.
 */
export const esErrorDeSesion = (error: unknown): boolean => {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    const estado = error.response?.status;
    return estado === 400 || estado === 401 || estado === 403;
};
