import useTamañoPantallaCelular from '../../../hooks/useVerificarTamañoPantalla';
import EjercicioP7Laptop from './DesignLaptop/EjercicioP7Laptop';
import EjercicioP7Phone from './DesignPhone/EjercicioP7Phone';

const EjercicioP7 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP7Phone /> : <EjercicioP7Laptop />;
};

export default EjercicioP7;
