import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { TokenContext } from './TokenContext';
import { UsuarioContext } from './UsuarioContext';
import { obtenerMiPerfil } from '../api/perfilApi';
import { esErrorDeSesion, obtenerMensajeError } from '../api/http';
import type { PerfilUsuario } from '../types/dominio';

interface UsuarioProviderProps {
    children: ReactNode;
}

export function UsuarioProvider({ children }: UsuarioProviderProps) {
    const { claveAcceso, setClaveAcceso } = useContext(TokenContext);
    const [usuario, setUsuario] = useState<PerfilUsuario | null>(null);
    const [cargando, setCargando] = useState<boolean>(() =>
        Boolean(localStorage.getItem('token')),
    );
    const [error, setError] = useState<string | null>(null);
    const usuarioRef = useRef<PerfilUsuario | null>(null);

    useEffect(() => {
        usuarioRef.current = usuario;
    }, [usuario]);

    const cargarPerfil = useCallback(async () => {
        if (!claveAcceso) {
            setUsuario(null);
            setError(null);
            setCargando(false);
            return;
        }

        // Solo mostramos la pantalla completa en la primera carga. Las
        // recargas posteriores (por ejemplo, tras cambiar el avatar) deben
        // actualizar los datos sin desmontar la página actual.
        setCargando(!usuarioRef.current);
        setError(null);

        try {
            const perfil = await obtenerMiPerfil(claveAcceso);
            setUsuario(perfil);
        } catch (errorDesconocido) {
            if (esErrorDeSesion(errorDesconocido)) {
                setUsuario(null);
                setError(null);
                setClaveAcceso('');
                return;
            }

            setError(
                obtenerMensajeError(
                    errorDesconocido,
                    'No se pudo cargar tu perfil',
                ),
            );
        } finally {
            setCargando(false);
        }
    }, [claveAcceso, setClaveAcceso]);

    useEffect(() => {
        void cargarPerfil();
    }, [cargarPerfil]);

    return (
        <UsuarioContext.Provider
            value={{
                usuario,
                cargando,
                error,
                refrescarPerfil: cargarPerfil,
            }}
        >
            {children}
        </UsuarioContext.Provider>
    );
}
