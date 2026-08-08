import { ejecutarPseudocodigo } from './pseintCompiler.ts';

const casos = [
    {
        n: 'matriz2d',
        code: `Algoritmo Matriz
    Dimension m[2,2]
    m[1,1] <- 1
    m[1,2] <- 2
    m[2,1] <- 3
    m[2,2] <- 4
    Escribir m[1,1] + m[2,2]
FinAlgoritmo`,
        in: [],
        esp: ['5'],
    },
    {
        n: 'leer-indexado',
        code: `Algoritmo Vec
    Dimension v[2]
    Leer v[1]
    Leer v[2]
    Escribir v[1] + v[2]
FinAlgoritmo`,
        in: ['10', '5'],
        esp: ['15'],
    },
    {
        n: 'asignacion-simple',
        code: `Algoritmo Simple
    Definir x Como Entero
    x <- 1 + 2
    Escribir x
FinAlgoritmo`,
        in: [],
        esp: ['3'],
    },
];

let fallos = 0;
for (const c of casos) {
    let k = 0;
    const r = await ejecutarPseudocodigo(c.code, {
        imprimir: (t) => console.log('   OUT:', t),
        pedirEntrada: async () => c.in[k++] ?? '0',
    });
    if (r.error) {
        console.log(c.n, '-> ERROR:', r.error);
        fallos++;
    } else {
        const ok = JSON.stringify(r.salida) === JSON.stringify(c.esp);
        console.log(c.n, ok ? 'OK' : 'MISMATCH', JSON.stringify(r.salida));
        if (!ok) fallos++;
    }
}
console.log(fallos === 0 ? 'TODOS OK' : fallos + ' fallos');