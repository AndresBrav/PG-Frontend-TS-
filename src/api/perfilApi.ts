import { api, configConToken } from './http';
import type { PerfilUsuario } from '../types/dominio';

export const obtenerMiPerfil = async (
    clave: string,
): Promise<PerfilUsuario> => {
    const { data } = await api.get<PerfilUsuario>(
        '/usuarios/me',
        configConToken(clave),
    );
    return data;
};

export const actualizarAvatar = async (
    clave: string,
    idAvatar: number,
): Promise<void> => {
    await api.put(
        `/usuarios/actualizarPefilFoto/${idAvatar}`,
        {},
        configConToken(clave),
    );
};
