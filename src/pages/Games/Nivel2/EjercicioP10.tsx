import useTamañoPantallaCelular from '../../../hooks/useVerificarTamañoPantalla';
import EjercicioP10Laptop from './DesignLaptop/EjercicioP10Laptop';
import EjercicioP10Phone from './DesignPhone/EjercicioP10Phone';

const EjercicioP10 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP10Phone /> : <EjercicioP10Laptop />;
};

export default EjercicioP10;
