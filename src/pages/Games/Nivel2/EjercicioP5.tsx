import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import EjercicioP5Laptop from "./DesignLaptop/EjercicioP5Laptop";
import EjercicioP5Phone from "./DesignPhone/EjercicioP5Phone";

const EjercicioP5 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP5Phone /> : <EjercicioP5Laptop />;
};

export default EjercicioP5;