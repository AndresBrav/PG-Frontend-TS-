import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import EjercicioP2Laptop from "./DesignLaptop/EjercicioP2Laptop";
import EjercicioP2Phone from "./DesignPhone/EjercicioP2Phone";

const EjercicioP2 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP2Phone /> : <EjercicioP2Laptop />;
};

export default EjercicioP2;
