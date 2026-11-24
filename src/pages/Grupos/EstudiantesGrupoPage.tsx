import { useContext, useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import AppShell from '../../components/layout/AppShell';
import PantallaCargando from '../../components/ui/PantallaCargando';
import { TokenContext } from '../../Context/TokenContext';
import { UsuarioContext } from '../../Context/UsuarioContext';
import { esErrorDeSesion, obtenerMensajeError } from '../../api/http';
import { obtenerRankingGrupo } from '../../api/gruposApi';
import {
    EstudiantesListado,
    EstudiantesListadoAdmin,
} from './GrupoDetalle';
import type { FilaRankingGrupo } from '../../types/dominio';

const EstudiantesGrupoPage = () => {
    const { id } = useParams<{ id: string }>();
    const { claveAcceso } = useContext(TokenContext);
    const { usuario } = useContext(UsuarioContext);
    const navigate = useNavigate();
    const [ranking, setRanking] = useState<FilaRankingGrupo[]>([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const cargar = async () => {
            if (!claveAcceso || !id || usuario?.rol !== 'profesor') return;

            try {
                const resultado = await obtenerRankingGrupo(claveAcceso, id);
                setRanking(resultado.ranking);
            } catch (error) {
                if (esErrorDeSesion(error)) return;
                await Swal.fire({
                    icon: 'error',
                    title: 'No se pudo cargar el grupo',
                    text: obtenerMensajeError(
                        error,
                        'No se pudo cargar el ranking del grupo',
                    ),
                });
                navigate('/grupos');
            } finally {
                setCargando(false);
            }
        };
        void cargar();
    }, [claveAcceso, id, navigate, usuario?.rol]);

    if (!usuario || !id) return null;

    if (usuario.rol === 'admin') {
        return <EstudiantesListadoAdmin grupoId={id} />;
    }

    if (usuario.rol !== 'profesor') {
        return <Navigate to={`/grupos/${id}`} replace />;
    }

    if (cargando) {
        return (
            <AppShell>
                <PantallaCargando mensaje="Cargando estudiantes del grupo..." />
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-5xl px-4 py-8">
                <div className="mb-6">
                    <Link
                        to={`/grupos/${id}`}
                        className="text-sm text-gray-400 hover:text-white"
                    >
                        ← Volver al grupo
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Estudiantes
                    </h1>
                </div>
                <EstudiantesListado grupoId={id} ranking={ranking} />
            </div>
        </AppShell>
    );
};

export default EstudiantesGrupoPage;
