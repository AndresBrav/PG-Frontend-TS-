import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import EjercicioP3Laptop from "./DesignLaptop/EjercicioP3Laptop";
import EjercicioP3Phone from "./DesignPhone/EjercicioP3Phone";

const EjercicioP3 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP3Phone /> : <EjercicioP3Laptop />;
};

export default EjercicioP3;