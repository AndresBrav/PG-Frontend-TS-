import { useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { UsuarioContext } from '../../Context/UsuarioContext';
import type { Rol } from '../../types/dominio';
import PantallaCargando from '../ui/PantallaCargando';

interface RutaPorRolProps {
    roles: Rol[];
    children?: ReactNode;
}

const RutaPorRol = ({ roles, children }: RutaPorRolProps) => {
    const { usuario, cargando } = useContext(UsuarioContext);

    if (cargando) {
        return <PantallaCargando mensaje="Verificando permisos..." />;
    }

    if (!usuario) {
        return <Navigate to="/" replace />;
    }

    if (!roles.includes(usuario.rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children ?? <Outlet />}</>;
};

export default RutaPorRol;
