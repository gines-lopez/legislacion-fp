/* ==========================================================================
   legislacion-fp · las URL de la portada

   El estado de la vista vive entero en la URL —qué se buscó, qué filtros hay
   puestos, qué ficha está abierta—, así que cualquier consulta es un enlace que
   se puede pegar en un correo. Aquí se lee y se compone; quién pinta con ello
   está en vistas.js y quién decide cuándo, en app.js.
   ========================================================================== */

import { anclaDePieza } from './comun.js';

export const CLAVES = ['q', 'seccion', 'ambito', 'estado', 'etiqueta'];

export const leerURL = () => {
  const parametros = new URLSearchParams(location.search);
  const filtros = { n: parametros.get('n') ?? '', p: parametros.get('p') ?? '' };
  for (const clave of CLAVES) filtros[clave] = parametros.get(clave) ?? '';
  return filtros;
};

export const urlListado = (filtros) => {
  const parametros = new URLSearchParams();
  for (const clave of CLAVES) if (filtros[clave]) parametros.set(clave, filtros[clave]);
  const consulta = parametros.toString();
  return location.pathname + (consulta ? `?${consulta}` : '');
};

/* La ficha se comparte, así que su URL va limpia: solo la norma. Los filtros
   desde los que se llegó se recuerdan aquí, no en la barra de direcciones. */
export const urlFicha = (id, pregunta) => `${location.pathname}?n=${encodeURIComponent(id)}`
  + (pregunta ? `&p=${encodeURIComponent(pregunta)}` : '');

/* La pieza se abre en la página del articulado, en su ancla, y se lleva consigo
   lo que se buscó: al caer en un artículo de veintidós párrafos hace falta ver
   dónde está la coincidencia, y allí se resalta con lo que viaja en «q». */
export const urlTexto = (id, consulta) => `norma/${encodeURIComponent(id)}.html`
  + (consulta ? `?q=${encodeURIComponent(consulta)}` : '');

export const urlPieza = (id, pieza, consulta) =>
  `${urlTexto(id, consulta)}#${anclaDePieza(pieza)}`;

/* Un artículo concreto por su número, que es como lo citan las preguntas
   frecuentes al remitir al articulado. El ancla la compone la misma función que
   pinta el destino, no una plantilla escrita aquí. */
export const urlArticulo = (id, numero) => urlTexto(id)
  + (numero ? `#${anclaDePieza({ tipo: 'articulo', numero })}` : '');

/* La página de esquema, que dibuja la norma en vez de reproducirla (D29). */
export const urlEsquema = (id) => `esquema/${encodeURIComponent(id)}.html`;
