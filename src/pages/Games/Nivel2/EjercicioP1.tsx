import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import EjercicioP1Laptop from "./DesignLaptop/EjercicioP1Laptop";
import EjercicioP1Phone from "./DesignPhone/EjercicioP1Phone";

EjercicioP1Laptop;
const EjercicioP1 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <EjercicioP1Phone /> : <EjercicioP1Laptop />;
};

export default EjercicioP1;
