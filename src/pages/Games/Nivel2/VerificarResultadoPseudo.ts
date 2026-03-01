export const verificarResultadoPseudocodigo1 = (ids: string[]): boolean[] => {
    let boolean1: boolean = false;
    let boolean2: boolean = false;
    let boolean3: boolean = false;
    let boolean4: boolean = false;
    let boolean5: boolean = false;
    let boolean6: boolean = false;
    let boolean7: boolean = false;

    if (ids[0] === "1") boolean1 = true;
    if (ids[1] === "2") boolean2 = true;
    if (ids[2] === "3") boolean3 = true;
    if (ids[3] === "4") boolean4 = true;
    if (ids[4] === "5") boolean5 = true;
    if (ids[5] === "6") boolean6 = true;
    if (ids[6] === "7") boolean7 = true;

    return [
        boolean1,
        boolean2,
        boolean3,
        boolean4,
        boolean5,
        boolean6,
        boolean7,
    ];
};
