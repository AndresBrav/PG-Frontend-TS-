import { useContext, useEffect } from 'react';
import AppShell from '../../components/layout/AppShell';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import SeccionAdmin from './SeccionAdmin';
import SeccionEstudiante from './SeccionEstudiante';
import SeccionProfesor from './SeccionProfesor';

const DashboardInicio = () => {
    const { claveAcceso } = useContext(TokenContext);
    const { usuario, refrescarPerfil } = useContext(UsuarioContext);

    useEffect(() => {
        if (claveAcceso) {
            void refrescarPerfil();
        }
    }, [claveAcceso, refrescarPerfil]);

    if (!usuario || !claveAcceso) return null;

    return (
        <AppShell>
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
                {usuario.rol === 'estudiante' && (
                    <SeccionEstudiante
                        claveAcceso={claveAcceso}
                        usuario={usuario}
                    />
                )}
                {usuario.rol === 'profesor' && (
                    <SeccionProfesor
                        claveAcceso={claveAcceso}
                        usuario={usuario}
                    />
                )}
                {usuario.rol === 'admin' && (
                    <SeccionAdmin
                        claveAcceso={claveAcceso}
                        usuario={usuario}
                    />
                )}
            </main>
        </AppShell>
    );
};

export default DashboardInicio;
