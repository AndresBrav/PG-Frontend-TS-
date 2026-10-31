import { api, obtenerMensajeError } from '../api/http';
import type { RolDeRegistro } from '../types/dominio';

export interface LoginResponse {
    token: string;
}

export interface DatosRegistro {
    codigo: string;
    username: string;
    edad: number;
    password: string;
    rol: RolDeRegistro;
}

interface RespuestaAuth {
    token?: string;
    msg?: string;
}

export const loginuser = async (
    identificador: string,
    password: string,
): Promise<LoginResponse> => {
    try {
        const { data } = await api.post<RespuestaAuth>(
            '/usuarios/login/iniciar',
            {
                username: identificador.trim(),
                password,
            },
        );

        if (!data.token) {
            throw new Error(data.msg ?? 'No se pudo iniciar sesión');
        }

        return { token: data.token };
    } catch (error) {
        throw new Error(
            obtenerMensajeError(error, 'No se pudo iniciar sesión'),
        );
    }
};

export const registerUser = async (
    datos: DatosRegistro,
): Promise<LoginResponse> => {
    try {
        const { data } = await api.post<RespuestaAuth>(
            '/usuarios/login/registrar',
            datos,
        );

        if (!data.token) {
            throw new Error(data.msg ?? 'No se pudo completar el registro');
        }

        return { token: data.token };
    } catch (error) {
        throw new Error(
            obtenerMensajeError(error, 'No se pudo completar el registro'),
        );
    }
};
