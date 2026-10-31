import { useContext } from 'react';
import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';

interface RutaPublicaProps {
    children: ReactNode;
}

const RutaPublica = ({ children }: RutaPublicaProps) => {
    const { claveAcceso } = useContext(TokenContext);

    if (claveAcceso) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default RutaPublica;
