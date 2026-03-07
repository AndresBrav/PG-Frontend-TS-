import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import EjercicioP4Laptop from "./DesignLaptop/EjercicioP4Laptop";
import EjercicioP4Phone from "./DesignPhone/EjercicioP4Phone";

const EjercicioP4 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP4Phone /> : <EjercicioP4Laptop />;
};

export default EjercicioP4;