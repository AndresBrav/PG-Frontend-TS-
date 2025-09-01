import Exercise1Laptop from "./DesignLaptop/Exercise1Laptop";
import Exercise1Phone from "./DesignPhone/Exercise1Phone";

const Exercise1 = () => {
    if (window.innerWidth <= 480) {
        // Si la pantalla es pequeña, redirige a la versión con celdas pequeñas
        return <Exercise1Phone />;
    } else {
        return <Exercise1Laptop />;
    }
};

export default Exercise1;
