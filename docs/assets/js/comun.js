/* ==========================================================================
   legislacion-fp · lo que comparten las páginas

   Aquí vive lo que usan dos o más páginas: el vocabulario con el que se cita
   una norma, las utilidades de texto y las dos funciones que componen el ancla
   y el rótulo de una pieza de articulado. Esas dos son la razón de que este
   fichero exista: el buscador de la portada compone el enlace y la página del
   texto compone el destino, y tienen que coincidir carácter a carácter. Antes
   estaban escritas dos veces (D30).

   Lo que solo usa una página se queda en la suya.
   ========================================================================== */

/* Se sube a mano en cada publicación, y desde la fase 5 en un solo sitio: las
   cuatro páginas importan este módulo, así que las cuatro exponen la misma
   versión. GitHub Pages sirve los assets con cache-control de diez minutos, de
   modo que un navegador puede estar ejecutando el código anterior contra el
   HTML nuevo, y eso se parece mucho a un fallo del sitio. El diagnóstico
   compara esta versión con la del fichero servido, y además comprueba fichero
   a fichero si el navegador guarda una copia anterior (D31). */
export const VERSION = '0.9';
window.legislacionFP = { version: VERSION };

/* ----------------------------------------------------------- vocabulario --- */

/* El identificador de una norma es una cita: se escribe como se cita. */
export const TIPO = {
  'ley-organica': 'Ley Orgánica',
  'real-decreto': 'Real Decreto',
  'decreto': 'Decreto',
  'orden': 'Orden',
  'resolucion': 'Resolución',
  'instrucciones': 'Instrucciones',
  'guia': 'Guía',
  'anexo': 'Anexo',
  'calendario': 'Calendario',
};

/* Los dos ejes que la portada filtra y las tres páginas rotulan. */
export const AMBITOS = [['autonomico', 'Autonómico'], ['estatal', 'Estatal']];
export const ESTADOS = [['vigente', 'Vigente'], ['modificada', 'Modificada'], ['derogada', 'Derogada']];

export const AMBITO_NOMBRE = Object.fromEntries(AMBITOS);
export const ESTADO_NOMBRE = Object.fromEntries(ESTADOS);

/* El diario se deriva del dominio del primer enlace, no de la etiqueta: las
   etiquetas varían («DOGV», «PDF del DOGV») y el dominio no. Ver D10. */
export const DIARIO = { 'www.boe.es': 'BOE', 'dogv.gva.es': 'DOGV', 'ceice.gva.es': 'CEICE' };

/* Los anexos y las guías no se citan por número ni por fecha, sino por su
   nombre. En esos casos el nombre es el identificador y no se repite debajo. */
export const SIN_CITA_PROPIA = new Set(['anexo', 'guia', 'calendario']);

/* ------------------------------------------------------------- utilidades --- */

export const $ = (selector, raiz = document) => raiz.querySelector(selector);

export const escapar = (texto) => String(texto).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const fechaLarga = (iso) => {
  const [anno, mes, dia] = iso.split('-').map(Number);
  return new Date(anno, mes - 1, dia)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

/* Quita tildes y baja a minúsculas conservando la longitud de la cadena. La
   longitud importa: sobre la cadena aplanada se buscan las coincidencias y
   luego se marcan por posición sobre el texto original, con sus tildes.

   Solo se toca lo que no es ASCII. Normalizar carácter a carácter, como se
   hacía, cuesta trece veces más y se nota en cuanto hay articulado que indexar:
   65 ms con veinte normas transcritas frente a 5. La salida es idéntica,
   comprobada línea a línea sobre todo docs/data/. */
const NO_ASCII = /[^\x00-\x7F]/g;

export const aplanar = (texto) => String(texto).normalize('NFC')
  .replace(NO_ASCII, (caracter) => {
    const base = caracter.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    /* Si la base no es un solo carácter se deja el original: antes que marcar
       desplazado, no marcar. */
    return base.length === 1 ? base : caracter;
  })
  .toLowerCase();

export const terminosDe = (consulta) => aplanar(consulta).split(/\s+/).filter(Boolean);

/* Marca las coincidencias sobre el texto original. Si aplanar no ha podido
   conservar la alineación, se renuncia al resaltado antes que a la fidelidad
   del texto: aquí el texto es lo que importa. */
/* Marcar «a» o «la» no señala nada: en un texto legal están en todas las
   líneas, y buscar «atención a la diversidad» dejaba el articulado entero
   subrayado —3.623 marcas en la Orden 8/2025—. Se marca lo que distingue; las
   palabras de una o dos letras solo si la búsqueda entera es así, que entonces
   sí es lo que se ha ido a buscar. */
export const terminosVisibles = (terminos) => {
  const largos = terminos.filter((termino) => termino.length > 2);
  return largos.length ? largos : terminos;
};

export const resaltar = (texto, terminosPedidos) => {
  const terminos = terminosVisibles(terminosPedidos);
  const original = String(texto).normalize('NFC');
  const plano = aplanar(original);
  if (!terminos.length || plano.length !== original.length) return escapar(original);

  const tramos = [];
  for (const termino of terminos) {
    let desde = 0;
    let encontrado;
    while ((encontrado = plano.indexOf(termino, desde)) !== -1) {
      tramos.push([encontrado, encontrado + termino.length]);
      desde = encontrado + termino.length;
    }
  }
  if (!tramos.length) return escapar(original);

  tramos.sort((a, b) => a[0] - b[0]);
  const unidos = [tramos[0]];
  for (const [inicio, fin] of tramos.slice(1)) {
    const ultimo = unidos[unidos.length - 1];
    if (inicio <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], fin);
    else unidos.push([inicio, fin]);
  }

  let salida = '';
  let cursor = 0;
  for (const [inicio, fin] of unidos) {
    salida += escapar(original.slice(cursor, inicio));
    salida += `<mark>${escapar(original.slice(inicio, fin))}</mark>`;
    cursor = fin;
  }
  return salida + escapar(original.slice(cursor));
};

export const procedencia = (norma) => {
  const anfitrion = new URL(norma.enlaces[0].url).hostname;
  const diario = DIARIO[anfitrion];
  return diario ? `${AMBITO_NOMBRE[norma.ambito]} · ${diario}` : AMBITO_NOMBRE[norma.ambito];
};

export const identificador = (norma) => {
  const tipo = TIPO[norma.tipo] ?? norma.tipo;
  if (norma.numero) return `${tipo} ${norma.numero}`;
  if (SIN_CITA_PROPIA.has(norma.tipo)) return norma.titulo;
  return `${tipo} de ${fechaLarga(norma.fecha)}`;
};

export const enlaceExterno = (url, texto, nota) => `
  <a href="${escapar(url)}" target="_blank" rel="noopener noreferrer">${escapar(texto)}<span class="externo" aria-hidden="true"></span><span class="oculto"> (se abre en una ventana nueva)</span></a>${nota ? `<span class="enlaces__nota">${escapar(nota)}</span>` : ''}`;

export const cargar = async (ruta) => {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se ha podido leer ${ruta} (HTTP ${respuesta.status}).`);
  return respuesta.json();
};

/* ------------------------------------------------------- articulado ------- */

/* El ancla de una pieza y su rótulo. Los compone el buscador de la portada para
   enlazar y la página del texto para pintar el destino: si no coincidieran
   carácter a carácter, los enlaces del buscador caerían en el vacío. Por eso
   están aquí y no en cada una. */
export const anclaDePieza = (pieza) => (pieza.tipo === 'articulo'
  ? `articulo-${pieza.numero}`
  : `disposicion-${(pieza.grupo ?? '').toLowerCase().replace(/[^a-z]+/g, '-')}-${pieza.numero.toLowerCase()}`);

export const rotuloDePieza = (pieza) => (pieza.tipo === 'articulo'
  ? `Artículo ${pieza.numero}`
  : `${pieza.grupo}${pieza.numero ? ` · ${pieza.numero}` : ''}`);
