import { createContext } from 'react';
import type { PerfilUsuario } from '../types/dominio';

export interface UsuarioContextType {
    usuario: PerfilUsuario | null;
    cargando: boolean;
    error: string | null;
    refrescarPerfil: () => Promise<void>;
}

export const UsuarioContext = createContext<UsuarioContextType>({
    usuario: null,
    cargando: false,
    error: null,
    refrescarPerfil: () => Promise.resolve(),
});
