import Ejercicio3Laptop from "./DesignLaptop/Ejercicio3Laptop";
import Ejercicio3Phone from "./DesignPhone/Ejercicio3Phone";

const Ejercicio3 = () => {
    if (window.innerWidth <= 480) {
        // Si la pantalla es pequeña, redirige a la versión con celdas pequeñas
        return <Ejercicio3Phone />;
    } else {
        return <Ejercicio3Laptop />;
    }
};

export default Ejercicio3;
