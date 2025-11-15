import Ejercicio5Phone from "./DesignPhone/Ejercicio5Phone";
import Ejercicio5Laptop from "./DesignLaptop/Ejercicio5Laptop";
import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";

const Ejercicio5 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Ejercicio5Phone /> : <Ejercicio5Laptop />;
};

export default Ejercicio5;
