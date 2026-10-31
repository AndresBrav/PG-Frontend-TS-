import { useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import useCerrarSesion from '../../hooks/useCerrarSesion';
import PantallaCargando from '../ui/PantallaCargando';
import PantallaErrorSesion from '../ui/PantallaErrorSesion';

interface RutaProtegidaProps {
    children?: ReactNode;
}

const RutaProtegida = ({ children }: RutaProtegidaProps) => {
    const { claveAcceso } = useContext(TokenContext);
    const { usuario, cargando, error, refrescarPerfil } =
        useContext(UsuarioContext);
    const cerrarSesion = useCerrarSesion();

    if (!claveAcceso) {
        return <Navigate to="/" replace />;
    }

    if (cargando) {
        return <PantallaCargando mensaje="Cargando tu sesión..." />;
    }

    if (!usuario) {
        return (
            <PantallaErrorSesion
                mensaje={error ?? 'No se pudo cargar tu sesión'}
                onReintentar={refrescarPerfil}
                onSalir={cerrarSesion}
            />
        );
    }

    return <>{children ?? <Outlet />}</>;
};

export default RutaProtegida;
