import Ejercicio2Laptop from "./DesignLaptop/Ejercicio2Laptop";
import Ejercicio2Phone from "./DesignPhone/Ejercicio2Phone";
import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";

const Ejercicio2 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Ejercicio2Phone /> : <Ejercicio2Laptop />;
};

export default Ejercicio2;
