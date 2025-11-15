import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import Ejercicio4Laptop from "./DesignLaptop/Ejercicio4Laptop";
import Ejercicio4Phone from "./DesignPhone/Ejercicio4Phone";

const Ejercicio4 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Ejercicio4Phone /> : <Ejercicio4Laptop />;
};

export default Ejercicio4;
