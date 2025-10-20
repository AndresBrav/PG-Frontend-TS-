import Ejercicio5Phone from "./DesignPhone/Ejercicio5Phone";
import Ejercicio5Laptop from "./DesignLaptop/Ejercicio5Laptop";

const Ejercicio5 = () => {
    if (window.innerWidth <= 480) {
        // Si la pantalla es pequeña, redirige a la versión con celdas pequeñas
        return <Ejercicio5Phone />;
    } else {
        return <Ejercicio5Laptop />;
    }
};

export default Ejercicio5;
