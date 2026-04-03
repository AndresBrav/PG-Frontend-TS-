import useTamañoPantallaCelular from '../../../hooks/useVerificarTamañoPantalla';
import EjercicioP9Laptop from './DesignLaptop/EjercicioP9Laptop';
import EjercicioP9Phone from './DesignPhone/EjercicioP9Phone';

const EjercicioP9 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP9Phone /> : <EjercicioP9Laptop />;
};

export default EjercicioP9;
