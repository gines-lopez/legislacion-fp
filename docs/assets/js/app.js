/* ==========================================================================
   legislacion-fp · portada y ficha

   Todo se pinta desde docs/data/normas.json, que es la fuente de verdad única
   (D3): ni una norma escrita en el HTML. El estado de la vista vive entero en
   la URL, así que cualquier consulta —una búsqueda, un filtro, una ficha— es
   un enlace que se puede pegar en un correo.

   Rutas siempre relativas: en producción el sitio cuelga de /legislacion-fp/.
   ========================================================================== */

'use strict';

/* Se sube a mano en cada publicación. No es adorno: GitHub Pages sirve los
   assets con cache-control de diez minutos, así que un navegador puede estar
   ejecutando el script anterior contra el HTML nuevo, y eso se parece mucho a
   un fallo del sitio. El diagnóstico compara esta versión con la del fichero
   servido y avisa. */
const VERSION = '0.8';
window.legislacionFP = { version: VERSION };

/* ----------------------------------------------------------- vocabulario --- */

/* El identificador de una norma es una cita: se escribe como se cita. */
const TIPO = {
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

/* Dentro de cada sección las normas se ordenan por rango, que es el orden en
   que se razona: primero lo que ampara, después lo que lo desarrolla. A igual
   rango, la más reciente primero. */
const RANGO = ['ley-organica', 'real-decreto', 'decreto', 'orden', 'resolucion',
  'instrucciones', 'calendario', 'anexo', 'guia'];

/* Las secciones son las de la fuente y en su orden: ordenan la portada. */
const SECCIONES = [
  ['ordenacion-academica', 'Ordenación académica'],
  ['curso-actual', 'Curso actual'],
  ['desdobles', 'Desdobles'],
  ['anexos', 'Anexos'],
  ['optatividad', 'Optatividad'],
  ['cursos-anteriores', 'Cursos anteriores'],
];

const AMBITOS = [['autonomico', 'Autonómico'], ['estatal', 'Estatal']];
const ESTADOS = [['vigente', 'Vigente'], ['modificada', 'Modificada'], ['derogada', 'Derogada']];

const EJES = [
  ['seccion', 'Sección', SECCIONES, 'Todas'],
  ['ambito', 'Ámbito', AMBITOS, 'Los dos'],
  ['estado', 'Estado', ESTADOS, 'Cualquiera'],
];

const CLAVES = ['q', 'seccion', 'ambito', 'estado', 'etiqueta'];

/* Un distintivo de estado a solas informa de menos de lo que aparenta: dice
   QUE una norma cambió, nunca HASTA DÓNDE, y aquí el alcance casi nunca es
   total. Estas notas lo advierten y remiten al resumen, que es donde vive ese
   matiz. Ver «Lo que el modelo no captura» en MODELO-DATOS.md. */
const NOTA_ESTADO = {
  vigente: 'Nada de lo recogido en este sitio la deroga ni la modifica.',
  modificada: 'Sigue siendo aplicable. Qué se modificó y hasta dónde está en el resumen y en las normas que la reforman.',
  derogada: 'Ya no está en vigor. Se conserva porque se sigue citando y porque una derogación no borra los efectos ya producidos a su amparo. El alcance está en el resumen.',
};

/* El diario se deriva del dominio del primer enlace, no de la etiqueta: las
   etiquetas varían («DOGV», «PDF del DOGV») y el dominio no. Ver D10. */
const DIARIO = { 'www.boe.es': 'BOE', 'dogv.gva.es': 'DOGV', 'ceice.gva.es': 'CEICE' };

/* Los anexos y las guías no se citan por número ni por fecha, sino por su
   nombre. En esos casos el nombre es el identificador y no se repite debajo. */
const SIN_CITA_PROPIA = new Set(['anexo', 'guia', 'calendario']);

/* Los temas agrupan las preguntas frecuentes de una norma. El orden es el de
   lectura: de la matrícula al profesorado, como el propio articulado. */
const TEMAS = [
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

const TEMA_NOMBRE = Object.fromEntries(TEMAS);

const AMBITO_NOMBRE = Object.fromEntries(AMBITOS);
const SECCION_NOMBRE = Object.fromEntries(SECCIONES);
const ESTADO_NOMBRE = Object.fromEntries(ESTADOS);

/* ------------------------------------------------------------- utilidades --- */

const $ = (selector, raiz = document) => raiz.querySelector(selector);

const escapar = (texto) => String(texto).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fechaLarga = (iso) => {
  const [anno, mes, dia] = iso.split('-').map(Number);
  return new Date(anno, mes - 1, dia)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

/* Quita tildes y baja a minúsculas conservando la longitud de la cadena. La
   longitud importa: sobre la cadena aplanada se buscan las coincidencias y
   luego se marcan por posición sobre el texto original, con sus tildes. */
const aplanar = (texto) => {
  let salida = '';
  for (const caracter of String(texto).normalize('NFC')) {
    const base = caracter.normalize('NFD').replace(/[\u0300-\u036f]/g, '') || caracter;
    salida += base.toLowerCase();
  }
  return salida;
};

const terminosDe = (consulta) => aplanar(consulta).split(/\s+/).filter(Boolean);

/* Marca las coincidencias sobre el texto original. Si aplanar no ha podido
   conservar la alineación, se renuncia al resaltado antes que a la fidelidad
   del texto: aquí el texto es lo que importa. */
/* Marcar «a» o «la» no señala nada: en un texto legal están en todas las
   líneas, y buscar «atención a la diversidad» dejaba el articulado entero
   subrayado —3.623 marcas en la Orden 8/2025—. Se marca lo que distingue; las
   palabras de una o dos letras solo si la búsqueda entera es así, que entonces
   sí es lo que se ha ido a buscar. */
const terminosVisibles = (terminos) => {
  const largos = terminos.filter((termino) => termino.length > 2);
  return largos.length ? largos : terminos;
};

const resaltar = (texto, terminosPedidos) => {
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

const procedencia = (norma) => {
  const anfitrion = new URL(norma.enlaces[0].url).hostname;
  const diario = DIARIO[anfitrion];
  return diario ? `${AMBITO_NOMBRE[norma.ambito]} · ${diario}` : AMBITO_NOMBRE[norma.ambito];
};

const identificador = (norma) => {
  const tipo = TIPO[norma.tipo] ?? norma.tipo;
  if (norma.numero) return `${tipo} ${norma.numero}`;
  if (SIN_CITA_PROPIA.has(norma.tipo)) return norma.titulo;
  return `${tipo} de ${fechaLarga(norma.fecha)}`;
};

const idEsTitulo = (norma) => !norma.numero && SIN_CITA_PROPIA.has(norma.tipo);

/* Un anexo se titula «Anexo I de la Resolución de …: solicitud de anulación de
   matrícula». Dentro de la ficha de esa misma resolución, la primera mitad
   sobra: ya se sabe de quién es. */
const nombreCorto = (norma) => {
  const corte = norma.titulo.indexOf(': ');
  return corte === -1 ? norma.titulo : norma.titulo.slice(corte + 2);
};

/* «…durante el curso 2026-2027 en la Comunitat Valenciana» → «2026-2027». */
const cursoDe = (norma) => {
  const encontrado = norma.titulo.match(/\b(20\d{2})\s*[-–/]\s*(20\d{2}|\d{2})\b/);
  if (encontrado) return encontrado[0].replace(/\s*[-–/]\s*/, '-');
  return `de ${fechaLarga(norma.fecha)}`;
};

const rotuloPartes = (hijos) => {
  const tipos = new Set(hijos.map((h) => h.tipo));
  if (tipos.size === 1 && tipos.has('anexo')) return hijos.length === 1 ? 'Anexo' : 'Anexos';
  return 'Documentos que la acompañan';
};

/* La cita que se copia. Sin número de diario, que no está en los datos: título
   oficial completo, diario, enlace y fecha de consulta, que es lo que se pide
   al citar una fuente en línea. */
const citaDe = (norma) => {
  const enlace = norma.enlaces[0];
  const anfitrion = new URL(enlace.url).hostname;
  const diario = DIARIO[anfitrion] ?? anfitrion;
  const hoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${norma.titulo}. ${diario}. ${enlace.url} (consultado el ${hoy})`;
};

const enlaceExterno = (url, texto, nota) => `
  <a href="${escapar(url)}" target="_blank" rel="noopener noreferrer">${escapar(texto)}<span class="externo" aria-hidden="true"></span><span class="oculto"> (se abre en una ventana nueva)</span></a>${nota ? `<span class="enlaces__nota">${escapar(nota)}</span>` : ''}`;

/* ------------------------------------------------------------------ datos --- */

const datos = {
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

const cargar = async (ruta) => {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se ha podido leer ${ruta} (HTTP ${respuesta.status}).`);
  return respuesta.json();
};

/* ------------------------------------------------------- articulado ------- */

/* Las mismas dos funciones que compone norma.js para sus anclas y sus rótulos.
   Están escritas dos veces porque no hay módulos ni build (D1) y el ancla tiene
   que coincidir carácter a carácter con la que pinta la otra página: si se
   cambia una, hay que cambiar la otra. */
const anclaDePieza = (pieza) => (pieza.tipo === 'articulo'
  ? `articulo-${pieza.numero}`
  : `disposicion-${(pieza.grupo ?? '').toLowerCase().replace(/[^a-z]+/g, '-')}-${pieza.numero.toLowerCase()}`);

const rotuloDePieza = (pieza) => (pieza.tipo === 'articulo'
  ? `Artículo ${pieza.numero}`
  : `${pieza.grupo}${pieza.numero ? ` · ${pieza.numero}` : ''}`);

/* Un artículo es la unidad que se cita, así que es la unidad que se encuentra:
   se indexa pieza a pieza y no la norma entera. El identificador de la norma se
   queda fuera del índice a propósito —si entrara, buscar «orden» devolvería los
   veintiséis artículos de la Orden 8/2025 y ninguno por su contenido—. */
const indiceDePieza = (pieza) => aplanar([
  rotuloDePieza(pieza),
  pieza.titulo ?? '',
  pieza.parrafos.join(' · '),
].join(' · '));

/* Un artículo puede tener veintidós párrafos y en el resultado caben dos
   líneas: se muestra el párrafo donde caen más términos, recortado alrededor de
   la primera coincidencia y cortando por espacios, que no se parten palabras.
   El recorte conserva la alineación que «resaltar» necesita. */
const VENTANA = 200;

const fragmento = (parrafos, terminos) => {
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

/* ------------------------------------------------------------------ filtro --- */

const leerURL = () => {
  const parametros = new URLSearchParams(location.search);
  const filtros = { n: parametros.get('n') ?? '', p: parametros.get('p') ?? '' };
  for (const clave of CLAVES) filtros[clave] = parametros.get(clave) ?? '';
  return filtros;
};

const urlListado = (filtros) => {
  const parametros = new URLSearchParams();
  for (const clave of CLAVES) if (filtros[clave]) parametros.set(clave, filtros[clave]);
  const consulta = parametros.toString();
  return location.pathname + (consulta ? `?${consulta}` : '');
};

/* La ficha se comparte, así que su URL va limpia: solo la norma. Los filtros
   desde los que se llegó se recuerdan aquí, no en la barra de direcciones. */
const urlFicha = (id, pregunta) => `${location.pathname}?n=${encodeURIComponent(id)}`
  + (pregunta ? `&p=${encodeURIComponent(pregunta)}` : '');

/* La pieza se abre en la página del articulado, en su ancla, y se lleva consigo
   lo que se buscó: al caer en un artículo de veintidós párrafos hace falta ver
   dónde está la coincidencia, y allí se resalta con lo que viaja en «q». */
const urlTexto = (norma, consulta) => `norma/${encodeURIComponent(norma.id)}.html`
  + (consulta ? `?q=${encodeURIComponent(consulta)}` : '');

const urlPieza = (norma, pieza, consulta) =>
  `${urlTexto(norma, consulta)}#${anclaDePieza(pieza)}`;

const coincide = (norma, filtros, terminos) => {
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
const piezasCoincidentes = (terminos) => {
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
const recuentos = (filtros, terminos, eje) => {
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

const porRango = (a, b) => {
  const rangoA = RANGO.indexOf(a.tipo);
  const rangoB = RANGO.indexOf(b.tipo);
  const normalizar = (r) => (r < 0 ? RANGO.length : r);
  if (rangoA !== rangoB) return normalizar(rangoA) - normalizar(rangoB);
  if (a.fecha !== b.fecha) return a.fecha < b.fecha ? 1 : -1;
  return a.titulo.localeCompare(b.titulo, 'es');
};

/* ----------------------------------------------------------------- pintado --- */

const trazo = (estado) => `<span class="trazo" data-estado="${escapar(estado)}" aria-hidden="true"></span>`;

const pintarFiltros = (filtros, terminos) => {
  const partes = EJES.map(([eje, rotulo, opciones, todas]) => {
    const { cuenta, total } = recuentos(filtros, terminos, eje);
    const chips = [['', todas, total, !filtros[eje]]]
      .concat(opciones.map(([valor, nombre]) => [valor, nombre, cuenta.get(valor) ?? 0, filtros[eje] === valor]))
      .map(([valor, nombre, numero, activo]) => `
        <button type="button" class="chip" data-eje="${eje}" data-valor="${escapar(valor)}"
                aria-pressed="${activo}"${numero === 0 && !activo ? ' disabled' : ''}>
          ${eje === 'estado' && valor ? trazo(valor) : ''}
          <span class="chip__texto">${escapar(nombre)}</span>
          <span class="chip__n">${numero}</span>
        </button>`).join('');

    return `
      <div class="filtro" data-eje="${eje}">
        <p class="filtro__rotulo" id="filtro-${eje}">${escapar(rotulo)}</p>
        <div class="filtro__chips" role="group" aria-labelledby="filtro-${eje}">${chips}</div>
      </div>`;
  });

  if (filtros.etiqueta) {
    partes.push(`
      <p class="filtro__materia">
        Materia <span class="materia">${escapar(filtros.etiqueta)}</span>
        <a class="filtro__quitar" href="${escapar(urlListado({ ...filtros, etiqueta: '' }))}">Quitar</a>
      </p>`);
  }

  $('#filtros').innerHTML = partes.join('');
};

const relacionesBreves = (norma, terminos) => {
  const traer = (ids) => ids.map((id) => datos.porId.get(id)).filter(Boolean);
  const madre = norma.parteDe ? datos.porId.get(norma.parteDe) : null;
  const grupos = [
    ['Parte de', madre ? [madre] : []],
    ['Derogada por', datos.derogadaPor.get(norma.id) ?? []],
    ['Modificada por', traer(norma.modificadaPor)],
    ['Deroga', traer(norma.deroga)],
    ['Modifica', traer(norma.modifica)],
    ['Remite a', traer(norma.remiteA ?? [])],
  ];

  const filas = grupos
    .filter(([, otras]) => otras.length)
    .map(([verbo, otras]) => `
      <p class="norma__relacion">${verbo} ${otras
        .map((otra) => `<a href="${escapar(urlFicha(otra.id))}">${resaltar(identificador(otra), terminos)}</a>`)
        .join(', ')}</p>`);

  /* En la madre basta con avisar de que los lleva: la lista entera está en su
     ficha, que es donde se consultan. */
  const hijos = datos.partes.get(norma.id) ?? [];
  if (hijos.length) {
    filas.unshift(`<p class="norma__relacion">Incluye ${hijos.length} ${rotuloPartes(hijos).toLowerCase()}</p>`);
  }

  return filas.join('');
};

/* Las materias solo se muestran en la ficha, pero alimentan el buscador. Sin
   esta línea, buscar «fct» devuelve una norma en la que la palabra no aparece
   por ningún lado y no hay forma de saber por qué ha salido. */
const materiasCoincidentes = (norma, terminos) => {
  if (!terminos.length) return '';
  const tocadas = (norma.etiquetas ?? [])
    .filter((etiqueta) => terminos.some((termino) => aplanar(etiqueta).includes(termino)));
  if (!tocadas.length) return '';
  return `<p class="norma__coincidencia">Coincide en ${tocadas
    .map((etiqueta) => `<span class="materia">${resaltar(etiqueta, terminos)}</span>`)
    .join(' ')}</p>`;
};

const pintarNorma = (norma, terminos) => `
  <li class="norma" data-estado="${escapar(norma.estado)}" data-ambito="${escapar(norma.ambito)}" data-id="${escapar(norma.id)}">
    <p class="norma__procedencia">${resaltar(procedencia(norma), terminos)}</p>
    <h3 class="norma__id${idEsTitulo(norma) ? ' norma__id--nombre' : ''}">
      <a href="${escapar(urlFicha(norma.id))}">${resaltar(identificador(norma), terminos)}</a>
    </h3>
    <p class="norma__meta">
      <span class="norma__estado">${resaltar(ESTADO_NOMBRE[norma.estado] ?? norma.estado, terminos)}</span>
      <time datetime="${escapar(norma.fecha)}">${escapar(fechaLarga(norma.fecha))}</time>
    </p>
    ${idEsTitulo(norma) ? '' : `<p class="norma__titulo">${resaltar(norma.titulo, terminos)}</p>`}
    <p class="norma__resumen">${resaltar(norma.resumen, terminos)}</p>
    ${norma.texto ? `
      <p class="norma__transcrito">
        <a href="norma/${encodeURIComponent(norma.id)}.html">Leer el texto completo aquí</a>
      </p>` : ''}
    ${norma.esquema ? `
      <p class="norma__transcrito">
        <a href="esquema/${encodeURIComponent(norma.id)}.html">Ver cómo está construida esta ley</a>
      </p>` : ''}
    ${materiasCoincidentes(norma, terminos)}
    ${relacionesBreves(norma, terminos)}
  </li>`;

const pintarListado = (filtros) => {
  const terminos = terminosDe(filtros.q);
  const visibles = datos.normas.filter((norma) => coincide(norma, filtros, terminos));

  /* El buscador alcanza también las preguntas frecuentes: se busca «renuncia de
     convocatoria» y sale la respuesta, no solo la norma que la contiene. Se
     calculan aquí porque el aviso de «no hay resultados» tiene que contarlas:
     que no haya normas no significa que no se haya encontrado nada. */
  const encontradas = terminos.length
    ? [...datos.consultas.entries()].flatMap(([id, consulta]) => consulta.preguntas
        .filter((p) => terminos.every((t) => p.indice.includes(t)))
        .map((p) => ({ norma: datos.porId.get(id), pregunta: p })))
    : [];

  /* Y alcanza el articulado transcrito, que es la letra de la norma: buscar
     «promoción» encuentra la norma que la regula, la pregunta que la explica y
     el artículo que la dice. El articulado se carga después del primer pintado,
     así que hasta que llega esta lista está vacía y no se afirma nada de ella:
     no se dice «no hay artículos», se dice solo lo que ya se sabe. */
  const piezas = piezasCoincidentes(terminos);

  pintarFiltros(filtros, terminos);

  const plural = datos.normas.length === 1 ? 'norma' : 'normas';
  $('#recuento').textContent = visibles.length === datos.normas.length
    ? `${datos.normas.length} ${plural}`
    : `${visibles.length} de ${datos.normas.length} ${plural}`;

  const bloques = SECCIONES
    .map(([clave, nombre]) => [clave, nombre, visibles.filter((n) => n.seccion === clave).sort(porRango)])
    .filter(([, , normas]) => normas.length)
    .map(([clave, nombre, normas]) => `
      <section class="bloque" data-seccion="${escapar(clave)}">
        <h2 class="bloque__rotulo">${escapar(nombre)}<span class="bloque__n">${normas.length}</span></h2>
        <ol class="bloque__normas">${normas.map((n) => pintarNorma(n, terminos)).join('')}</ol>
      </section>`)
    .join('');

  $('#listado').innerHTML = bloques;

  const vacio = $('#vacio');
  vacio.hidden = visibles.length > 0;
  if (!visibles.length) {
    const sugerencias = [['114/2025', 'un número'], ['resolución', 'un tipo'], ['fct', 'una materia']]
      .map(([texto, que]) => `<a href="${escapar(location.pathname)}?q=${encodeURIComponent(texto)}">${escapar(texto)}</a> <span class="vacio__que">(${que})</span>`)
      .join(' · ');
    /* Que no haya normas no significa que no se haya encontrado nada: si la
       palabra está en una respuesta o en un artículo, el aviso lo dice en vez
       de fingir que la búsqueda ha sido en balde. */
    const otros = [
      encontradas.length && `${encontradas.length === 1 ? 'una pregunta' : `${encontradas.length} preguntas`} de las instrucciones del curso`,
      piezas.length && `${piezas.length === 1 ? 'un artículo' : `${piezas.length} piezas`} del articulado transcrito`,
    ].filter(Boolean);
    vacio.innerHTML = `
      <p class="vacio__titulo">Ninguna norma coincide${filtros.q ? ` con «${escapar(filtros.q)}»` : ''}${otros.length ? `, pero sí ${otros.join(' y ')}` : ''}.</p>
      <p class="vacio__pista">Se busca en el identificador, el título, el resumen y las materias${datos.articuladoListo ? ', y dentro del articulado que está transcrito' : ''}. Prueba con ${sugerencias}${filtros.seccion || filtros.ambito || filtros.estado || filtros.etiqueta ? `, o <a href="${escapar(location.pathname)}${filtros.q ? `?q=${encodeURIComponent(filtros.q)}` : ''}">quita los filtros</a>` : ''}.</p>`;
  }

  const respuestas = $('#respuestas');
  respuestas.hidden = encontradas.length === 0;
  if (encontradas.length) {
    const MUESTRA = 6;
    const norma = encontradas[0].norma;
    respuestas.innerHTML = `
      <h2 class="apartado__rotulo">Respuestas<span class="apartado__n">${encontradas.length}</span></h2>
      <p class="respuestas__nota">De las preguntas frecuentes de ${escapar(identificador(norma))}.</p>
      <ol class="respuestas__lista">${encontradas.slice(0, MUESTRA).map(({ norma: n, pregunta }) => `
        <li class="respuesta">
          <p class="respuesta__pregunta"><a href="${escapar(urlFicha(n.id, pregunta.id))}">${resaltar(pregunta.pregunta, terminos)}</a></p>
          <p class="respuesta__texto">${resaltar(pregunta.respuesta, terminos)}</p>
          <p class="respuesta__epigrafe">Epígrafe ${escapar(pregunta.epigrafe)} · ${escapar(pregunta.epigrafeTitulo)}</p>
        </li>`).join('')}
      </ol>
      ${encontradas.length > MUESTRA ? `<p class="respuestas__resto"><a href="${escapar(urlFicha(norma.id))}">Ver las ${encontradas.length} respuestas en la ficha de la norma</a></p>` : ''}`;
  }

  /* El articulado va después de las respuestas y no antes: se lee de lo llano a
     lo literal, que es el mismo orden en que cada respuesta lleva debajo la
     frase de la norma en que se apoya. */
  const MUESTRA_PIEZAS = 4;
  const bloquePiezas = $('#piezas');
  bloquePiezas.hidden = piezas.length === 0;
  if (piezas.length) {
    const restantes = piezas.slice(MUESTRA_PIEZAS);
    const normasRestantes = [...new Set(restantes.map(({ norma }) => norma.id))]
      .map((id) => datos.porId.get(id));
    bloquePiezas.innerHTML = `
      <h2 class="apartado__rotulo">Articulado<span class="apartado__n">${piezas.length}</span></h2>
      <p class="piezas__nota">Del texto transcrito. Es la letra de la norma, no un resumen de ella.</p>
      <ol class="piezas__lista">${piezas.slice(0, MUESTRA_PIEZAS).map(({ norma, pieza }) => `
        <li class="pieza"${pieza.modificadoPor ? ' data-modificado="si"' : ''}>
          <p class="pieza__norma">${resaltar(identificador(norma), terminos)}</p>
          <p class="pieza__rotulo">
            <a href="${escapar(urlPieza(norma, pieza, filtros.q))}">
              <span class="pieza__numero">${resaltar(rotuloDePieza(pieza), terminos)}</span>
              ${pieza.titulo ? `<span class="pieza__titulo">${resaltar(pieza.titulo, terminos)}</span>` : ''}
            </a>
          </p>
          <p class="pieza__fragmento">${resaltar(fragmento(pieza.parrafos, terminos), terminos)}</p>
          ${pieza.modificadoPor ? `
            <p class="pieza__nota">Esta es la redacción vigente: la cambió la ${escapar(pieza.modificadoPor.identificador)}, desde el ${escapar(fechaLarga(pieza.modificadoPor.desde))}.</p>` : ''}
        </li>`).join('')}
      </ol>
      ${restantes.length ? `<p class="piezas__resto">Y ${restantes.length === 1 ? 'una pieza más' : `${restantes.length} piezas más`}, en el texto de ${normasRestantes
        .map((n) => `<a href="${escapar(urlTexto(n, filtros.q))}">${escapar(identificador(n))}</a>`)
        .join(' y ')}.</p>` : ''}`;
  }

  const recursos = $('#recursos');
  const mostrarRecursos = datos.recursos.length > 0 && !filtros.q && !filtros.seccion
    && !filtros.ambito && !filtros.estado && !filtros.etiqueta;
  recursos.hidden = !mostrarRecursos;
  if (mostrarRecursos) {
    $('.recursos__lista', recursos).innerHTML = datos.recursos.map((recurso) => `
      <li class="recurso">
        <p class="recurso__fuente">${escapar(recurso.fuente)}</p>
        <p class="recurso__titulo">${enlaceExterno(recurso.url, recurso.titulo)}</p>
        <p class="recurso__resumen">${escapar(recurso.resumen)}</p>
      </li>`).join('');
  }
};

const pintarRelacion = (norma) => `
  <li class="relacion" data-estado="${escapar(norma.estado)}">
    <p class="relacion__id"><a href="${escapar(urlFicha(norma.id))}">${escapar(identificador(norma))}</a></p>
    <p class="relacion__meta">
      <span class="relacion__estado">${escapar(ESTADO_NOMBRE[norma.estado] ?? norma.estado)}</span>
      <time datetime="${escapar(norma.fecha)}">${escapar(fechaLarga(norma.fecha))}</time>
    </p>
    ${idEsTitulo(norma) ? '' : `<p class="relacion__titulo">${escapar(norma.titulo)}</p>`}
    <p class="relacion__resumen">${escapar(norma.resumen)}</p>
  </li>`;

/* Una parte no se presenta como norma independiente: dentro de su madre basta
   el número del anexo, su nombre y para qué sirve. La cita completa y el
   enlace están en su propia ficha, a un clic. */
const pintarParte = (hijo) => `
  <li class="parte">
    <p class="parte__id"><a href="${escapar(urlFicha(hijo.id))}">${escapar(identificador(hijo))}</a></p>
    <p class="parte__nombre">${escapar(nombreCorto(hijo))}</p>
    <p class="parte__resumen">${escapar(hijo.resumen)}</p>
  </li>`;

const pintarPregunta = (pregunta, abierta) => `
  <details class="pregunta" id="p-${escapar(pregunta.id)}" data-tema="${escapar(pregunta.tema)}"${abierta ? ' open' : ''}>
    <summary class="pregunta__enunciado">${escapar(pregunta.pregunta)}</summary>
    <div class="pregunta__cuerpo">
      <p class="pregunta__respuesta">${escapar(pregunta.respuesta)}</p>
      <p class="pregunta__epigrafe">Epígrafe ${escapar(pregunta.epigrafe)} · ${escapar(pregunta.epigrafeTitulo)}</p>
      <blockquote class="pregunta__cita">${escapar(pregunta.cita)}</blockquote>
      ${pregunta.veTambien ? `
        <p class="pregunta__vertambien">
          <a href="norma/${encodeURIComponent(pregunta.veTambien.norma)}.html${pregunta.veTambien.articulo ? `#articulo-${encodeURIComponent(pregunta.veTambien.articulo)}` : ''}">${escapar(pregunta.veTambien.etiqueta)}</a>
        </p>` : ''}
    </div>
  </details>`;

const pintarConsulta = (consulta, abierta) => {
  const grupos = TEMAS
    .map(([clave, nombre]) => [clave, nombre, consulta.preguntas.filter((p) => p.tema === clave)])
    .filter(([, , preguntas]) => preguntas.length);

  const indice = grupos.map(([clave, nombre, preguntas]) =>
    `<a class="chip" href="#tema-${escapar(clave)}"><span class="chip__texto">${escapar(nombre)}</span><span class="chip__n">${preguntas.length}</span></a>`).join('');

  const bloques = grupos.map(([clave, nombre, preguntas]) => `
      <section class="tema" id="tema-${escapar(clave)}">
        <h3 class="tema__rotulo">${escapar(nombre)}<span class="apartado__n">${preguntas.length}</span></h3>
        ${preguntas.map((p) => pintarPregunta(p, p.id === abierta)).join('')}
      </section>`).join('');

  return `
    <section class="apartado consulta">
      <h2 class="apartado__rotulo">Preguntas frecuentes<span class="apartado__n">${consulta.preguntas.length}</span></h2>
      <p class="consulta__aviso">${escapar(consulta.aviso ?? '')}</p>
      <nav class="consulta__indice" aria-label="Temas">${indice}</nav>
      ${bloques}
    </section>`;
};

const pintarFicha = (norma, volverA, abierta) => {
  const traer = (ids) => ids.map((id) => datos.porId.get(id)).filter(Boolean);

  /* «Remite a» es una relación más floja que las otras cuatro y por eso lleva
     nota: quien vea una norma debajo de otra da por hecho que la reformó, y
     aquí no es eso. Las instrucciones de curso no tocan la orden de
     evaluación: se apoyan en ella y mandan aplicarla. */
  const grupos = [
    ['Derogada por', datos.derogadaPor.get(norma.id) ?? [], ''],
    ['Modificada por', traer(norma.modificadaPor), ''],
    ['Deroga', traer(norma.deroga), ''],
    ['Modifica', traer(norma.modifica), ''],
    ['Remite a', traer(norma.remiteA ?? []),
      'Ni la modifica ni la deroga: se apoya en ella y manda aplicarla, así que hay que leerlas juntas. Hasta dónde llega cada remisión está en el articulado y en las preguntas frecuentes.'],
    ['Remiten a esta norma', datos.citadaPor.get(norma.id) ?? [],
      'La citan y la aplican, sin cambiarla. Lo que aquí se regula se ejecuta a través de ellas.'],
  ].filter(([, otras]) => otras.length);

  const relaciones = grupos.map(([verbo, otras, nota]) => `
    <section class="apartado">
      <h2 class="apartado__rotulo">${verbo}</h2>
      ${nota ? `<p class="relaciones__nota">${escapar(nota)}</p>` : ''}
      <ol class="relaciones">${otras.map(pintarRelacion).join('')}</ol>
    </section>`).join('');

  const hijos = datos.partes.get(norma.id) ?? [];
  const partes = hijos.length ? `
    <section class="apartado">
      <h2 class="apartado__rotulo">${escapar(rotuloPartes(hijos))}<span class="apartado__n">${hijos.length}</span></h2>
      <p class="partes__nota">Se publican dentro de esta norma y se renuevan con ella. Están en el mismo PDF.</p>
      <ol class="partes">${hijos.map(pintarParte).join('')}</ol>
    </section>` : '';

  const madre = norma.parteDe ? datos.porId.get(norma.parteDe) : null;
  const pertenencia = madre ? `
    <p class="ficha__madre">Forma parte de
      <a href="${escapar(urlFicha(madre.id))}">${escapar(identificador(madre))}</a>
      y se publica dentro de su mismo texto. No se cita por separado.</p>` : '';

  const materias = (norma.etiquetas ?? []).length ? `
    <section class="apartado">
      <h2 class="apartado__rotulo">Materias</h2>
      <p class="materias">${norma.etiquetas
        .map((etiqueta) => `<a class="materia" href="${escapar(location.pathname)}?etiqueta=${encodeURIComponent(etiqueta)}">${escapar(etiqueta)}</a>`)
        .join('')}</p>
    </section>` : '';

  return `
    <p class="volver"><a href="${escapar(volverA)}">Volver al listado</a></p>

    <div class="ficha__cuerpo">
      <div class="ficha__principal">

        <header class="ficha__cabecera" data-estado="${escapar(norma.estado)}">
          <p class="ficha__procedencia">${escapar(procedencia(norma))}</p>
          <h1 class="ficha__id${idEsTitulo(norma) ? ' ficha__id--nombre' : ''}" id="ficha-titulo" tabindex="-1">${escapar(identificador(norma))}</h1>
          <p class="ficha__meta">
            ${trazo(norma.estado)}
            <span class="ficha__estado">${escapar(ESTADO_NOMBRE[norma.estado] ?? norma.estado)}</span>
            <time datetime="${escapar(norma.fecha)}">${escapar(fechaLarga(norma.fecha))}</time>
          </p>
          <p class="ficha__nota-estado">${escapar(NOTA_ESTADO[norma.estado] ?? '')}</p>
        </header>

        ${pertenencia}
        ${idEsTitulo(norma) ? '' : `<p class="ficha__titulo">${escapar(norma.titulo)}</p>`}
        <p class="ficha__resumen">${escapar(norma.resumen)}</p>

        ${norma.texto ? `
          <p class="ficha__transcripcion">
            <a href="norma/${encodeURIComponent(norma.id)}.html">Leer el articulado completo aquí</a>
            <span class="ficha__transcripcion-nota">Transcripción para consultarla, no texto auténtico</span>
          </p>` : ''}

        ${norma.esquema ? `
          <p class="ficha__transcripcion">
            <a href="esquema/${encodeURIComponent(norma.id)}.html">Ver cómo está construida esta ley</a>
            <span class="ficha__transcripcion-nota">Esquema con sus grados, sus catálogos y el mapa de su articulado</span>
          </p>` : ''}

        ${partes}
        ${relaciones}

        <section class="apartado">
          <h2 class="apartado__rotulo">Cita</h2>
          <p class="cita" id="cita">${escapar(citaDe(norma))}</p>
          <p class="cita__acciones">
            <button type="button" class="boton" id="copiar" data-cita="${escapar(citaDe(norma))}">Copiar cita</button>
            <span class="cita__aviso" id="cita-aviso" role="status"></span>
          </p>
        </section>

      </div>

      <aside class="ficha__lateral">

        <section class="apartado">
          <h2 class="apartado__rotulo">Texto oficial</h2>
          <ul class="enlaces">${norma.enlaces.map((enlace) => `
            <li>${enlaceExterno(enlace.url, enlace.etiqueta, enlace.formato === 'pdf' ? 'PDF' : '')}</li>`).join('')}
          </ul>
          <p class="enlaces__aviso">El texto auténtico es el del diario oficial. Lo de esta página es una adaptación para consultarla.</p>
        </section>

        ${materias}

        <section class="apartado">
          <h2 class="apartado__rotulo">Dónde aparece</h2>
          <p class="ficha__seccion"><a href="${escapar(location.pathname)}?seccion=${encodeURIComponent(norma.seccion)}">${escapar(SECCION_NOMBRE[norma.seccion] ?? norma.seccion)}</a></p>
        </section>

      </aside>
    </div>

    ${datos.consultas.has(norma.id) ? pintarConsulta(datos.consultas.get(norma.id), abierta) : ''}`;
};

/* El h1 es el asunto de la vista, y la vista cambia sin recargar: en el listado
   lo es el título del sitio, y en una ficha lo es la norma. Si el título del
   sitio siguiera siendo h1 en la ficha habría dos, y quien navegue saltando por
   encabezados encontraría dos títulos de página. Al salir del listado baja a
   párrafo —sigue siendo la marca, deja de ser el encabezado. */
const nivelDelTitulo = (etiqueta) => {
  const actual = $('.cabecera__titulo');
  if (!actual || actual.tagName.toLowerCase() === etiqueta) return;
  const nuevo = document.createElement(etiqueta);
  nuevo.className = actual.className;
  nuevo.innerHTML = actual.innerHTML;
  actual.replaceWith(nuevo);
};

/* ---------------------------------------------------------------- enrutado --- */

let ultimoListado = null;   // a dónde vuelve la ficha
let ultimaFicha = null;     // qué norma se realza al volver
let scrollListado = 0;
let primerPintado = true;

const pintar = () => {
  const filtros = leerURL();
  const vistaListado = $('#vista-listado');
  const vistaFicha = $('#vista-ficha');
  const norma = filtros.n ? datos.porId.get(filtros.n) : null;

  if (filtros.n && !norma) {
    nivelDelTitulo('p');
    vistaListado.hidden = true;
    vistaFicha.hidden = false;
    vistaFicha.innerHTML = `
      <p class="volver"><a href="${escapar(ultimoListado ?? location.pathname)}">Volver al listado</a></p>
      <h1 class="ficha__id" id="ficha-titulo" tabindex="-1">Esa norma no está</h1>
      <p class="ficha__resumen">No hay ninguna norma con el identificador <span class="cita">${escapar(filtros.n)}</span>. Puede que el enlace esté mal copiado, o que la norma se haya retirado del listado.</p>`;
    document.title = 'Norma no encontrada · Legislación FP';
    if (!primerPintado) $('#ficha-titulo').focus();
    return;
  }

  if (norma) {
    nivelDelTitulo('p');
    if (!vistaListado.hidden) scrollListado = window.scrollY;
    vistaListado.hidden = true;
    vistaFicha.hidden = false;
    vistaFicha.innerHTML = pintarFicha(norma, ultimoListado ?? location.pathname, filtros.p);
    document.title = `${identificador(norma)} · Legislación FP`;
    ultimaFicha = norma.id;

    /* Si la URL trae una pregunta, se abre y se lleva a la vista; si no, la
       ficha empieza por arriba. */
    const abierta = filtros.p && $(`#p-${CSS.escape(filtros.p)}`);

    /* Si se llega con un ancla —«…#tema-convocatorias»— hay que saltar a mano:
       cuando el navegador lo intentó, la ficha todavía no estaba pintada. */
    const anclada = !abierta && location.hash.length > 1
      && document.getElementById(decodeURIComponent(location.hash.slice(1)));

    if (abierta) {
      abierta.scrollIntoView({ block: 'center' });
      if (!primerPintado) abierta.querySelector('summary').focus({ preventScroll: true });
    } else if (anclada) {
      anclada.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
      if (!primerPintado) $('#ficha-titulo').focus({ preventScroll: true });
    }
    return;
  }

  nivelDelTitulo('h1');
  const volviendo = !vistaFicha.hidden;
  vistaFicha.hidden = true;
  vistaFicha.innerHTML = '';
  vistaListado.hidden = false;
  ultimoListado = urlListado(filtros);
  pintarListado(filtros);

  const campo = $('#q');
  if (campo.value !== filtros.q) campo.value = filtros.q;

  document.title = 'Legislación FP · Normativa de ciclos formativos';

  if (volviendo) {
    const fila = ultimaFicha && $(`.norma[data-id="${CSS.escape(ultimaFicha)}"]`);
    window.scrollTo(0, scrollListado);
    if (fila) {
      fila.classList.add('norma--vuelta');
      setTimeout(() => fila.classList.remove('norma--vuelta'), 1400);
    }
  }
};

const ir = (destino, { reemplazar = false } = {}) => {
  const url = new URL(destino, location.href);
  if (reemplazar) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  pintar();
};

/* ------------------------------------------------------------------ arranque --- */

(async () => {
  try {
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
    /* Las preguntas frecuentes de una norma viven en su propio fichero. La
       norma declara que las tiene; la ruta se deriva de su identificador, así
       que no hay una ruta escrita dos veces. */
    const conConsulta = normas.filter((n) => n.consulta);
    const consultas = await Promise.all(conConsulta.map((n) =>
      cargar(`data/consulta/${n.id}.json`).catch(() => null)));
    conConsulta.forEach((n, i) => {
      if (consultas[i]?.preguntas?.length) datos.consultas.set(n.id, consultas[i]);
    });

    for (const consulta of datos.consultas.values()) {
      for (const pregunta of consulta.preguntas) {
        pregunta.indice = aplanar([pregunta.pregunta, pregunta.respuesta,
          pregunta.epigrafe, pregunta.epigrafeTitulo, pregunta.cita,
          TEMA_NOMBRE[pregunta.tema] ?? pregunta.tema].join(' · '));
      }
    }

    datos.instrucciones = normas
      .filter((n) => n.seccion === 'curso-actual'
        && n.estado !== 'derogada'
        && (n.etiquetas ?? []).includes('instrucciones-curso'))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0] ?? null;
  } catch (error) {
    $('#cargando').innerHTML = `
      <strong>No se ha podido cargar el listado.</strong> ${escapar(error.message)}
      El <a href="diagnostico.html">diagnóstico de despliegue</a> dice qué capa ha fallado.`;
    $('#cargando').classList.add('cargando--fallo');
    return;
  }

  $('#cargando').remove();

  if (datos.instrucciones) {
    const norma = datos.instrucciones;
    $('#atajo').hidden = false;
    $('#atajo').innerHTML = `
      <a class="boton boton--atajo" href="${escapar(urlFicha(norma.id))}">
        Instrucciones del curso ${escapar(cursoDe(norma))}
      </a>
      <span class="atajo__nota">${escapar(identificador(norma))}</span>`;
  }

  if (datos.meta) {
    $('#cabecera-datos').textContent =
      ` · ${datos.normas.length} normas · revisado el ${fechaLarga(datos.meta.revisado)}`;
    if (datos.meta.fuente) {
      $('#pie-fuente').innerHTML =
        `Adapta ${enlaceExterno(datos.meta.fuente.url, datos.meta.fuente.titulo)}, de la ${escapar(datos.meta.fuente.organismo)}.`;
    }
  }

  pintar();
  primerPintado = false;

  /* El articulado se carga después de pintar, y no antes como las preguntas.
     Es el único conjunto de datos que crece sin techo —cada norma transcrita
     son decenas de miles de palabras— y la portada no puede quedarse esperando
     a un texto que solo hace falta si se busca algo. Cuando llega, si hay una
     búsqueda en marcha, se repinta el listado para incorporarlo. */
  const conTexto = datos.normas.filter((n) => n.texto);
  if (conTexto.length) {
    Promise.all(conTexto.map((n) => cargar(`data/texto/${n.id}.json`).catch(() => null)))
      .then((textos) => {
        conTexto.forEach((n, i) => {
          if (textos[i]?.articulado?.length) datos.textos.set(n.id, textos[i]);
        });
        for (const texto of datos.textos.values()) {
          for (const pieza of texto.articulado) pieza.indice = indiceDePieza(pieza);
        }
        datos.articuladoListo = true;
        const filtros = leerURL();
        if (!filtros.n && terminosDe(filtros.q).length) pintarListado(filtros);
      });
  }

  /* Saltos dentro de la página —el índice de temas, el enlace de saltar al
     contenido—. Se resuelven aquí y no por el comportamiento nativo del ancla:
     así el hash se escribe con replaceState y pulsar seis temas seguidos no
     deja seis entradas en el historial que al volver atrás repinten la ficha
     entera. Va antes que el enrutador para que este lo vea ya atendido. */
  document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const ancla = evento.target.closest('a[href^="#"]');
    if (!ancla) return;
    const destino = document.getElementById(decodeURIComponent(ancla.hash.slice(1)));
    if (!destino) return;

    evento.preventDefault();
    /* El foco acompaña al salto: si no, quien navega con teclado o con lector
       de pantalla se queda donde estaba mientras la página se mueve. */
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    destino.scrollIntoView();
    history.replaceState(null, '', ancla.hash);
  });

  /* Navegación interna sin recargar. Solo se intercepta lo que apunta a esta
     misma página: los enlaces al DOGV y al BOE llevan target y se van fuera. */
  document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const enlace = evento.target.closest('a[href]');
    if (!enlace || enlace.target === '_blank') return;
    const url = new URL(enlace.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;

    /* Un ancla dentro de la vista que ya se está viendo no es navegación: la
       resuelve el navegador saltando al elemento. Interceptarla repintaría la
       ficha entera y el salto no llegaría a ocurrir. */
    if (url.hash && url.search === location.search) return;

    evento.preventDefault();
    ir(url.href);
  });

  window.addEventListener('popstate', pintar);

  /* Buscar mientras se escribe. El estado va a la URL con replaceState: cada
     tecla no merece una entrada en el historial, pero la búsqueda tiene que
     poder compartirse tal cual está. */
  let esperando;
  $('#q').addEventListener('input', (evento) => {
    clearTimeout(esperando);
    const consulta = evento.target.value;
    esperando = setTimeout(() => {
      ir(urlListado({ ...leerURL(), n: '', q: consulta }), { reemplazar: true });
    }, 140);
  });

  /* Los chips alternan: pulsar el que ya está activo no lo apaga (para eso
     está «todas»), pero pulsar otro sustituye el valor del eje. */
  $('#filtros').addEventListener('click', (evento) => {
    const chip = evento.target.closest('.chip');
    if (!chip) return;
    const filtros = { ...leerURL(), n: '' };
    filtros[chip.dataset.eje] = chip.dataset.valor;
    ir(urlListado(filtros), { reemplazar: true });
  });

  document.addEventListener('click', async (evento) => {
    const boton = evento.target.closest('#copiar');
    if (!boton) return;
    const aviso = $('#cita-aviso');
    try {
      await navigator.clipboard.writeText(boton.dataset.cita);
      aviso.textContent = 'Cita copiada';
      setTimeout(() => { aviso.textContent = ''; }, 3000);
    } catch {
      const rango = document.createRange();
      rango.selectNodeContents($('#cita'));
      const seleccion = getSelection();
      seleccion.removeAllRanges();
      seleccion.addRange(rango);
      aviso.textContent = 'Seleccionada: cópiala con Ctrl+C';
    }
  });
})();
