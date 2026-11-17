import { useParams } from 'react-router-dom';
import DesignBoard from '../../Games/GeneradosPorIA/DesignBoard';
import EditingBoard from '../../Games/GeneradosPorIA/EditingBoard/EditingBoard';

/**
 * /grupos/:id/ejercicios/:ejercicioId/:tipo — Tablero de resolución de
 * un ejercicio de grupo. Renderiza el tablero IA correspondiente al
 * tipo; los propios tableros detectan el modo grupo por los params de
 * la ruta (id, ejercicioId) y la query (revisarEstudiante para la
 * revisión en solo lectura del profesor).
 */
const TableroGrupo = () => {
    const { tipo } = useParams<{ tipo?: string }>();

    if (tipo === 'diagrama') {
        return <DesignBoard />;
    }

    return <EditingBoard />;
};

export default TableroGrupo;
