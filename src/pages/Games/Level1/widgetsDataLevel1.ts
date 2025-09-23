import type { Widget } from "./typesLevel1";

//Ejercicio 1
export const initialWidgets: Widget[] = [
    { id: 1, content: "https://i.imgur.com/yxr4QMR.png" } /* desicion si no */,
    { id: 2, content: "https://i.imgur.com/2n11hJn.png" } /* son iguales */,
    { id: 3, content: "https://i.imgur.com/DtUtPZK.png" } /* leer n1,n2 */,
    { id: 4, content: "https://i.imgur.com/YmsczfQ.png" } /* inicio */,
    { id: 5, content: "https://i.imgur.com/hgPQ06G.png" } /* linea doblada */,
    { id: 6, content: "https://i.imgur.com/oRp6iv2.png" } /* no son iguales */,
    { id: 7, content: "https://i.imgur.com/BUGBEOc.png" } /* linea abajo  */,
    { id: 8, content: "https://i.imgur.com/hNUaZS0.jpeg" } /* linea */,
    { id: 9, content: "https://i.imgur.com/hNUaZS0.jpeg" } /* linea */,
    { id: 10, content: "https://i.imgur.com/hNUaZS0.jpeg" } /* linea */,
    { id: 11, content: "https://i.imgur.com/Now9q9e.png" } /* linea derecha */,
    {
        id: 12,
        content: "https://i.imgur.com/iuyJU46.png",
    } /* linea izquierda */,
    { id: 13, content: "https://i.imgur.com/9as8FXr.png" } /* fin */,
    { id: 14, content: "https://i.imgur.com/BUGBEOc.png" } /* linea abajo */,
    { id: 15, content: "https://i.imgur.com/BUGBEOc.png" } /* linea abajo */,
    { id: 16, content: "https://i.imgur.com/BUGBEOc.png" } /* linea abajo */,
];

// Ejercicio 2
export const initialWidgetsEjercicio2: Widget[] = [
    { id: 1, content: "https://i.imgur.com/8wCxpum.png" }, //primer descicion
    { id: 2, content: "https://i.imgur.com/mt4Z8y1.png" }, //fin
    { id: 3, content: "https://i.imgur.com/oC9J3TN.png" }, //flecha abajo 1
    { id: 4, content: "https://i.imgur.com/3MzUgfA.png" }, //inicio
    { id: 5, content: "https://i.imgur.com/r8r7BIt.png" }, //introdusca n1,n2
    { id: 6, content: "https://i.imgur.com/v8uvFLP.png" }, //leer n1,n2
    { id: 7, content: "https://i.imgur.com/L8yntMk.png" }, //descicion 2
    { id: 8, content: "https://i.imgur.com/Od4jxIE.png" }, //esquina derecha 1
    { id: 9, content: "https://i.imgur.com/MSjy0TA.png" }, //esquina derecha 2
    { id: 10, content: "https://i.imgur.com/Y7okYCi.png" }, //esquina derecha 3
    { id: 11, content: "https://i.imgur.com/42u2BvY.png" }, //esquina derecha 4
    { id: 12, content: "https://i.imgur.com/cJqYyTX.png" }, //esquina izquierda 1
    { id: 13, content: "https://i.imgur.com/jnKoRnc.png" }, //esquina izquierda 2
    { id: 14, content: "https://i.imgur.com/L2Z7DVd.jpeg" }, //linea 1
    { id: 15, content: "https://i.imgur.com/L2Z7DVd.jpeg" }, //linea 2
    { id: 16, content: "https://i.imgur.com/L2Z7DVd.jpeg" }, //linea 3
    { id: 17, content: "https://i.imgur.com/goRKMj3.png" }, //n1 es mayor
    { id: 18, content: "https://i.imgur.com/sFAFzl4.png" }, //n2 es mayor
    { id: 19, content: "https://i.imgur.com/oC9J3TN.png" }, //flecha abajo 2
    { id: 20, content: "https://i.imgur.com/oC9J3TN.png" }, //flecha abajo 3
    { id: 21, content: "https://i.imgur.com/oC9J3TN.png" }, //flecha abajo 4
];

export const initialWidgetsEjercicio3: Widget[] =[
    {id:1, content:"https://i.imgur.com/x7IcPAY.png"}, //inicio
    {id:2, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo1
    {id:3, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo2
    {id:4, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo3
    {id:5, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo4
    {id:6, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo5
    {id:7, content:"https://i.imgur.com/L0MV75y.png"}, //flecha abajo6
    {id:8, content:"https://i.imgur.com/RYGH9tV.png"}, // suma =0
    {id:9, content:"https://i.imgur.com/A1aTCPU.png"}, // contador =1
    {id:10, content:"https://i.imgur.com/FZLtIRu.png"}, // descicion
    {id:11, content:"https://i.imgur.com/AGMK3q1.png"}, // mostrar suma
    {id:12, content:"https://i.imgur.com/2JpAMKr.png"}, // fin
    {id:13, content:"https://i.imgur.com/UvuCO4L.png"}, // leer numero
    {id:14, content:"https://i.imgur.com/KC2On76.png"}, // suma = suma + numero
    {id:15, content:"https://i.imgur.com/qgZYFaK.png"}, // contador = contador + 1
    {id:16, content:"https://i.imgur.com/U57Uh8j.png"}, // izquierda arriba doblada
    {id:17, content:"https://i.imgur.com/MTL5zju.jpeg"}, // linea 1
    {id:18, content:"https://i.imgur.com/MTL5zju.jpeg"}, // linea 2
    {id:19, content:"https://i.imgur.com/MTL5zju.jpeg"}, // linea 3
    {id:20, content:"https://i.imgur.com/jNXzpFf.png"}, // flecha arriba
    {id:21, content:"https://i.imgur.com/TMDvptF.png"}, // esquina derecha
    {id:22, content:"https://i.imgur.com/ICyFXrP.png"}, // esquina izquierda

]


export const initialWidgetsEjercicio4: Widget[] =[
    {id:1, content:"https://i.imgur.com/8Oalgpj.png"}, //inicio
    {id:2, content:"https://i.imgur.com/RESU9Wb.png"}, //fin
    {id:3, content:"https://i.imgur.com/I9rPg9Q.png"}, //Mostrar area
    {id:4, content:"https://i.imgur.com/hUCWk5Q.png"}, //inicio de variables
    {id:5, content:"https://i.imgur.com/duXzF5m.png"}, //calcular area
    {id:6, content:"https://i.imgur.com/nigQnxc.png"}, //leer base y altura
    {id:7, content:"https://i.imgur.com/G9A6r4u.png"}, //flecha 1
    {id:8, content:"https://i.imgur.com/G9A6r4u.png"}, //flecha 2
    {id:9, content:"https://i.imgur.com/G9A6r4u.png"}, //flecha 3
    {id:10, content:"https://i.imgur.com/G9A6r4u.png"}, //flecha 4
    {id:11, content:"https://i.imgur.com/G9A6r4u.png"}, //flecha 5
    

]