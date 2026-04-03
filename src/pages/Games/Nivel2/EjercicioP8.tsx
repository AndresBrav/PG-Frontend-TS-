import useTamañoPantallaCelular from '../../../hooks/useVerificarTamañoPantalla';
import EjercicioP8Laptop from './DesignLaptop/EjercicioP8Laptop';
import EjercicioP8Phone from './DesignPhone/EjercicioP8Phone';

const EjercicioP8 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP8Phone /> : <EjercicioP8Laptop />;
};

export default EjercicioP8;
