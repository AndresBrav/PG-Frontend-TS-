import useTamañoPantallaCelular from '../../../hooks/useVerificarTamañoPantalla';
import EjercicioP6Laptop from './DesignLaptop/EjercicioP6Laptop';
import EjercicioP6Phone from './DesignPhone/EjercicioP6Phone';

const EjercicioP6 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP6Phone /> : <EjercicioP6Laptop />;
};

export default EjercicioP6;
