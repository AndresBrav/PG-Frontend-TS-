import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import Ejercicio1Laptop from "./DesignLaptop/Ejercicio1Laptop";
import Ejercicio1Phone from "./DesignPhone/Ejercicio1Phone";

const Ejercicio1 = () => {
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Ejercicio1Phone /> : <Ejercicio1Laptop />;
};

export default Ejercicio1;
