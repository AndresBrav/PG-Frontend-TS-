import Ejercicio4Laptop from "./DesignLaptop/Ejercicio4Laptop";
import Ejercicio4Phone from "./DesignPhone/Ejercicio4Phone";

const Ejercicio4 = () => {
    if (window.innerWidth <= 480) {
        // Si la pantalla es pequeña, redirige a la versión con celdas pequeñas
        return <Ejercicio4Phone />;
    } else {
        return <Ejercicio4Laptop />;
    }
};

export default Ejercicio4;
