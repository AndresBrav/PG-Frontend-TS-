import useTamañoPantallaCelular from "../../../hooks/useVerificarTamañoPantalla";
import Exercise1Laptop from "./DesignLaptop/Exercise1Laptop";
import Exercise1Phone from "./DesignPhone/Exercise1Phone";

const Exercise1 = () => {
    
    const esPantallaCelular = useTamañoPantallaCelular(); //obtener si es pantalla de celular o no

    return esPantallaCelular ? <Exercise1Phone /> : <Exercise1Laptop />;
};

export default Exercise1;
