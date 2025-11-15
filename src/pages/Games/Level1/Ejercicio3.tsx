import Ejercicio3Laptop from "./DesignLaptop/Ejercicio3Laptop";
import Ejercicio3Phone from "./DesignPhone/Ejercicio3Phone";
import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";

const Ejercicio3 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Ejercicio3Phone /> : <Ejercicio3Laptop />;
};

export default Ejercicio3;
