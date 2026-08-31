/* ==========================================================================
   legislacion-fp · los datos de la portada

   El almacén, la carga y todo lo que se pregunta sobre las normas: qué
   coincide con una búsqueda, cuántas quedarían al pulsar un chip y en qué
   orden van. Nada de aquí toca el DOM.

   La carga va en tres tiempos y en ese orden importa el porqué (D31):
   el corpus hace falta para pintar, las preguntas frecuentes y el articulado
   no, y el articulado es además el único conjunto que crece sin techo.
   ========================================================================== */

import {
  AMBITOS, ESTADOS, AMBITO_NOMBRE, ESTADO_NOMBRE, TIPO,
  aplanar, cargar, identificador, rotuloDePieza,
} from './comun.js';

/* ----------------------------------------------------------- vocabulario --- */

/* Dentro de cada sección las normas se ordenan por rango, que es el orden en
   que se razona: primero lo que ampara, después lo que lo desarrolla. A igual
   rango, la más reciente primero. */
export const RANGO = ['ley-organica', 'real-decreto', 'decreto', 'orden', 'resolucion',
  'instrucciones', 'calendario', 'anexo', 'guia'];

/* Las secciones son las de la fuente y en su orden: ordenan la portada. */
export const SECCIONES = [
  ['ordenacion-academica', 'Ordenación académica'],
  ['curso-actual', 'Curso actual'],
  ['desdobles', 'Desdobles'],
  ['anexos', 'Anexos'],
  ['optatividad', 'Optatividad'],
  ['cursos-anteriores', 'Cursos anteriores'],
];

export const EJES = [
  ['seccion', 'Sección', SECCIONES, 'Todas'],
  ['ambito', 'Ámbito', AMBITOS, 'Los dos'],
  ['estado', 'Estado', ESTADOS, 'Cualquiera'],
];

/* Los temas agrupan las preguntas frecuentes de una norma. El orden es el de
   lectura: de la matrícula al profesorado, como el propio articulado. */
export const TEMAS = [
  ['matricula', 'Matrícula, anulación y faltas'],
  ['evaluacion', 'Evaluación, promoción y calificaciones'],
  ['convocatorias', 'Convocatorias'],
  ['titulacion', 'Titulación'],
  ['convalidaciones', 'Convalidaciones'],
  ['formacion-empresa', 'Formación en empresa'],
  ['profesorado', 'Profesorado'],
  ['alumnado', 'Alumnado'],
  ['organizacion', 'Organización del centro'],
];

export const TEMA_NOMBRE = Object.fromEntries(TEMAS);

export const SECCION_NOMBRE = Object.fromEntries(SECCIONES);

/* ------------------------------------------------------------------ almacén --- */

export const datos = {
  normas: [],
  porId: new Map(),
  indices: new Map(),
  derogadaPor: new Map(),
  citadaPor: new Map(),
  partes: new Map(),
  consultas: new Map(),
  textos: new Map(),
  articuladoListo: false,
  recursos: [],
  meta: null,
};

/* Lo que se busca de cada norma. Incluye la sección, el ámbito y el estado
   traducidos, para que «derogada» o «estatal» encuentren en el buscador lo
   mismo que encuentra el chip correspondiente. */
const construirIndice = (norma) => aplanar([
  identificador(norma),
  norma.id,
  TIPO[norma.tipo] ?? norma.tipo,
  norma.numero ?? '',
  norma.titulo,
  norma.resumen,
  (norma.etiquetas ?? []).join(' '),
  AMBITO_NOMBRE[norma.ambito],
  SECCION_NOMBRE[norma.seccion],
  ESTADO_NOMBRE[norma.estado],
].join(' · '));

/* Un artículo es la unidad que se cita, así que es la unidad que se encuentra:
   se indexa pieza a pieza y no la norma entera. El identificador de la norma se
   queda fuera del índice a propósito —si entrara, buscar «orden» devolvería los
   veintiséis artículos de la Orden 8/2025 y ninguno por su contenido—. */
const indiceDePieza = (pieza) => aplanar([
  rotuloDePieza(pieza),
  pieza.titulo ?? '',
  pieza.parrafos.join(' · '),
].join(' · '));

/* -------------------------------------------------------------------- carga --- */

/* El corpus: las normas y lo que se deriva de ellas. Es lo único que hace
   falta para pintar el listado, así que es lo único que el arranque espera. */
export const cargarCorpus = async () => {
  const [normas, recursos, meta] = await Promise.all([
    cargar('data/normas.json'),
    cargar('data/recursos.json').catch(() => []),
    cargar('data/meta.json').catch(() => null),
  ]);

  datos.normas = normas;
  datos.porId = new Map(normas.map((norma) => [norma.id, norma]));
  datos.indices = new Map(normas.map((norma) => [norma.id, construirIndice(norma)]));
  datos.recursos = recursos;
  datos.meta = meta;

  /* No hay campo «derogadaPor»: se deriva del «deroga» del otro lado, que el
     invariante 3 obliga a declarar. */
  for (const norma of normas) {
    for (const id of norma.deroga) {
      if (!datos.derogadaPor.has(id)) datos.derogadaPor.set(id, []);
      datos.derogadaPor.get(id).push(norma);
    }
    /* «Remite a» tampoco tiene reverso escrito: se declara en un solo sitio,
       el de la norma que remite, y el otro lado se deriva. Declararlo dos
       veces sería una ocasión más de que las dos puntas dejen de coincidir. */
    for (const id of (norma.remiteA ?? [])) {
      if (!datos.citadaPor.has(id)) datos.citadaPor.set(id, []);
      datos.citadaPor.get(id).push(norma);
    }
    /* Los anexos son parte del documento que los publica, no normas sueltas:
       se declaran con «parteDe» y aquí se agrupan bajo su norma madre. */
    if (norma.parteDe) {
      if (!datos.partes.has(norma.parteDe)) datos.partes.set(norma.parteDe, []);
      datos.partes.get(norma.parteDe).push(norma);
    }
  }

  for (const hijos of datos.partes.values()) hijos.sort(porRango);

  /* Las instrucciones del curso en vigor son lo que más se consulta, así que
     la portada lleva un atajo. Se deduce de los datos —sección «curso
     actual», etiqueta «instrucciones-curso», la más reciente— para que al
     rotar de curso el atajo siga solo, sin tocar el HTML. */
  datos.instrucciones = normas
    .filter((n) => n.seccion === 'curso-actual'
      && n.estado !== 'derogada'
      && (n.etiquetas ?? []).includes('instrucciones-curso'))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0] ?? null;
};

/* Las preguntas frecuentes de una norma viven en su propio fichero. La norma
   declara que las tiene; la ruta se deriva de su identificador, así que no hay
   una ruta escrita dos veces.

   No se esperan para pintar. Antes sí, y eso ponía un viaje entero y cuarenta
   kilobytes por delante de un listado que no los necesita: la portada tarda lo
   que tarde el fichero más lento de una norma que a lo mejor no se abre. La
   única excepción la decide el arranque, que sí espera a la de la ficha que se
   haya pedido por la URL.

   Devuelve los identificadores realmente cargados, que es lo que dice a quien
   llama si hay algo nuevo que pintar. */
export const cargarConsultas = async (normas = datos.normas) => {
  const pendientes = normas.filter((n) => n.consulta && !datos.consultas.has(n.id));
  if (!pendientes.length) return [];

  const ficheros = await Promise.all(pendientes.map((n) =>
    cargar(`data/consulta/${n.id}.json`).catch(() => null)));

  const cargadas = [];
  pendientes.forEach((n, i) => {
    if (!ficheros[i]?.preguntas?.length) return;
    for (const pregunta of ficheros[i].preguntas) {
      pregunta.indice = aplanar([pregunta.pregunta, pregunta.respuesta,
        pregunta.epigrafe, pregunta.epigrafeTitulo, pregunta.cita,
        TEMA_NOMBRE[pregunta.tema] ?? pregunta.tema].join(' · '));
    }
    datos.consultas.set(n.id, ficheros[i]);
    cargadas.push(n.id);
  });
  return cargadas;
};

/* El articulado transcrito, que es el único conjunto de datos que crece sin
   techo: cada norma son decenas de miles de palabras y solo hace falta si se
   busca algo. Se carga siempre después del primer pintado, y mientras no ha
   llegado la interfaz no afirma nada sobre él. */
export const cargarArticulado = async () => {
  const conTexto = datos.normas.filter((n) => n.texto);
  if (!conTexto.length) { datos.articuladoListo = true; return false; }

  const ficheros = await Promise.all(conTexto.map((n) =>
    cargar(`data/texto/${n.id}.json`).catch(() => null)));

  conTexto.forEach((n, i) => {
    if (!ficheros[i]?.articulado?.length) return;
    for (const pieza of ficheros[i].articulado) pieza.indice = indiceDePieza(pieza);
    datos.textos.set(n.id, ficheros[i]);
  });
  datos.articuladoListo = true;
  return datos.textos.size > 0;
};

/* ---------------------------------------------------------------- búsqueda --- */

/* Un artículo puede tener veintidós párrafos y en el resultado caben dos
   líneas: se muestra el párrafo donde caen más términos, recortado alrededor de
   la primera coincidencia y cortando por espacios, que no se parten palabras.
   El recorte conserva la alineación que «resaltar» necesita. */
const VENTANA = 200;

export const fragmento = (parrafos, terminos) => {
  /* Se puntúa por letras encontradas y no por términos: en «atención a la
     diversidad», «a» y «la» están en casi todos los párrafos y «diversidad»
     solo en uno. Contar términos empataría; sumar longitudes no. Y la ventana
     se centra en el término más largo, que es el que se ha ido a buscar: si se
     centrara en el primero, el recorte empezaría en la primera «a». */
  const porLongitud = [...terminos].sort((a, b) => b.length - a.length);
  let mejor = null;
  for (const parrafo of parrafos) {
    const plano = aplanar(parrafo);
    if (plano.length !== parrafo.length) continue;
    const encontrados = porLongitud
      .map((termino) => [termino, plano.indexOf(termino)])
      .filter(([, donde]) => donde !== -1);
    if (!encontrados.length) continue;
    const peso = encontrados.reduce((suma, [termino]) => suma + termino.length, 0);
    if (!mejor || peso > mejor.peso) mejor = { parrafo, peso, desde: encontrados[0][1] };
  }

  const parrafo = mejor ? mejor.parrafo : parrafos[0];
  if (parrafo.length <= VENTANA) return parrafo;

  let inicio = Math.max(0, (mejor ? mejor.desde : 0) - Math.floor(VENTANA / 3));
  if (inicio > 0) {
    const espacio = parrafo.indexOf(' ', inicio);
    inicio = espacio === -1 ? inicio : espacio + 1;
  }
  let fin = Math.min(parrafo.length, inicio + VENTANA);
  if (fin < parrafo.length) {
    const espacio = parrafo.lastIndexOf(' ', fin);
    if (espacio > inicio) fin = espacio;
  }
  return `${inicio > 0 ? '…' : ''}${parrafo.slice(inicio, fin).trim()}${fin < parrafo.length ? '…' : ''}`;
};

export const coincide = (norma, filtros, terminos) => {
  if (filtros.seccion && norma.seccion !== filtros.seccion) return false;
  if (filtros.ambito && norma.ambito !== filtros.ambito) return false;
  if (filtros.estado && norma.estado !== filtros.estado) return false;
  if (filtros.etiqueta && !(norma.etiquetas ?? []).includes(filtros.etiqueta)) return false;
  const indice = datos.indices.get(norma.id);
  return terminos.every((termino) => indice.includes(termino));
};

/* Las piezas de articulado en que caen todos los términos. La conjunción es
   dentro de una misma pieza, igual que en una norma o en una pregunta: dos
   palabras repartidas entre el artículo 3 y el 14 no son una coincidencia. Los
   filtros de sección, ámbito y estado no se aplican aquí: filtran normas, y lo
   que se está buscando es un artículo. */
export const piezasCoincidentes = (terminos) => {
  if (!terminos.length) return [];
  const encontradas = [];
  for (const [id, texto] of datos.textos) {
    const norma = datos.porId.get(id);
    if (!norma) continue;
    for (const pieza of texto.articulado) {
      if (terminos.every((termino) => pieza.indice.includes(termino))) encontradas.push({ norma, pieza });
    }
  }
  return encontradas;
};

/* Cuántas normas quedarían al pulsar cada opción de un eje, contando con lo
   que ya está filtrado en los demás ejes. Es lo que hace útil el recuento:
   avisa de los callejones sin salida antes de entrar en ellos. */
export const recuentos = (filtros, terminos, eje) => {
  const sinEsteEje = { ...filtros, [eje]: '' };
  const cuenta = new Map();
  let total = 0;
  for (const norma of datos.normas) {
    if (!coincide(norma, sinEsteEje, terminos)) continue;
    total += 1;
    cuenta.set(norma[eje], (cuenta.get(norma[eje]) ?? 0) + 1);
  }
  return { cuenta, total };
};

export const porRango = (a, b) => {
  const rangoA = RANGO.indexOf(a.tipo);
  const rangoB = RANGO.indexOf(b.tipo);
  const normalizar = (r) => (r < 0 ? RANGO.length : r);
  if (rangoA !== rangoB) return normalizar(rangoA) - normalizar(rangoB);
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  return a.titulo.localeCompare(b.titulo, 'es');
};
