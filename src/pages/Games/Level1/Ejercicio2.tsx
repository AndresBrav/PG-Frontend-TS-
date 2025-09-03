import Ejercicio2Laptop from "./DesignLaptop/Ejercicio2Laptop";
import Ejercicio2Phone from "./DesignPhone/Ejercicio2Phone";

const Ejercicio2 = () => {
    if (window.innerWidth <= 480) {
        // Si la pantalla es pequeña, redirige a la versión con celdas pequeñas
        return <Ejercicio2Phone />;
    } else {
        return <Ejercicio2Laptop />;
    }
};

export default Ejercicio2;
