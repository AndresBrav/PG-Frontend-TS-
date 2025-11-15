
const useTamañoPantallaCelular = (): Boolean => {
    if (window.innerWidth <= 480) {
        return true;
    } else {
        return false;
    }
};

export default useTamañoPantallaCelular;
