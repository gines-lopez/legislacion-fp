/* ==========================================================================
   legislacion-fp · página de articulado

   Pinta el texto de una norma desde data/texto/<id>.json. La norma se deduce
   del nombre del fichero, así que este script sirve para cualquier articulado
   que se transcriba después sin tocar una línea.

   Los datos de la norma —título, estado, enlaces— salen de normas.json, que
   sigue siendo la fuente de verdad única (D3): aquí no se escribe ninguno.

   Rutas relativas y un nivel por debajo: la página vive en docs/norma/.
   ========================================================================== */

'use strict';

const VERSION = '0.6';
window.legislacionFP = { version: VERSION };

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

const AMBITO_NOMBRE = { estatal: 'Estatal', autonomico: 'Autonómico' };
const ESTADO_NOMBRE = { vigente: 'Vigente', modificada: 'Modificada', derogada: 'Derogada' };
const DIARIO = { 'www.boe.es': 'BOE', 'dogv.gva.es': 'DOGV', 'ceice.gva.es': 'CEICE' };

const $ = (selector, raiz = document) => raiz.querySelector(selector);

const escapar = (texto) => String(texto).replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const fechaLarga = (iso) => {
  const [anno, mes, dia] = iso.split('-').map(Number);
  return new Date(anno, mes - 1, dia)
    .toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
};

const identificador = (norma) => {
  const tipo = TIPO[norma.tipo] ?? norma.tipo;
  if (norma.numero) return `${tipo} ${norma.numero}`;
  return `${tipo} de ${fechaLarga(norma.fecha)}`;
};

const enlaceExterno = (url, texto) => `
  <a href="${escapar(url)}" target="_blank" rel="noopener noreferrer">${escapar(texto)}<span class="externo" aria-hidden="true"></span><span class="oculto"> (se abre en una ventana nueva)</span></a>`;

const cargar = async (ruta) => {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`No se ha podido leer ${ruta} (HTTP ${respuesta.status}).`);
  return respuesta.json();
};

/* --------------------------------------------------------------- pintado --- */

/* El sangrado sale de cómo empieza el párrafo en el original: un guion es una
   enumeración, una letra entre paréntesis es una letra del apartado. No se
   reescribe el texto para clasificarlo: se lee lo que ya trae. */
const claseParrafo = (parrafo) => {
  if (parrafo.startsWith('– ') || parrafo.startsWith('- ')) return 'articulo__parrafo articulo__parrafo--guion';
  if (/^[a-z]\)\s/.test(parrafo)) return 'articulo__parrafo articulo__parrafo--letra';
  if (/^\d+\.\s/.test(parrafo)) return 'articulo__parrafo articulo__parrafo--apartado';
  return 'articulo__parrafo';
};

const anclaDe = (pieza) => pieza.tipo === 'articulo'
  ? `articulo-${pieza.numero}`
  : `disposicion-${(pieza.grupo ?? '').toLowerCase().replace(/[^a-z]+/g, '-')}-${pieza.numero.toLowerCase()}`;

const rotuloDe = (pieza) => pieza.tipo === 'articulo'
  ? `Artículo ${pieza.numero}`
  : `${pieza.grupo}${pieza.numero ? ` · ${pieza.numero}` : ''}`;

const pintarPieza = (pieza) => `
  <article class="articulo" id="${escapar(anclaDe(pieza))}"${pieza.modificadoPor ? ' data-modificado="si"' : ''}>
    <h2 class="articulo__rotulo">
      <span class="articulo__numero">${escapar(rotuloDe(pieza))}</span>
      ${pieza.titulo ? `<span class="articulo__titulo">${escapar(pieza.titulo)}</span>` : ''}
    </h2>
    ${pieza.modificadoPor ? `
      <p class="articulo__nota">${escapar(pieza.modificadoPor.detalle)}
        Lo modificó la ${escapar(pieza.modificadoPor.identificador)}, en vigor desde el
        ${escapar(fechaLarga(pieza.modificadoPor.desde))}.</p>` : ''}
    ${pieza.parrafos.map((p) => `<p class="${claseParrafo(p)}">${escapar(p)}</p>`).join('')}
  </article>`;

const pintarIndice = (articulado) => {
  const articulos = articulado.filter((p) => p.tipo === 'articulo');
  const disposiciones = articulado.filter((p) => p.tipo === 'disposicion');
  const fila = (pieza) => `
    <li><a href="#${escapar(anclaDe(pieza))}">
      <span class="indice__numero">${escapar(pieza.tipo === 'articulo' ? pieza.numero : pieza.numero || '—')}</span>
      <span class="indice__titulo">${escapar(pieza.titulo || pieza.grupo)}</span>
    </a></li>`;

  /* Plegable: en una pantalla estrecha, veintiséis líneas de índice antes del
     artículo 1 son un muro. En una ancha se abre y se queda fijo en el lateral. */
  return `
    <details class="indice__caja" id="indice-caja">
      <summary class="apartado__rotulo indice__resumen">Índice<span class="apartado__n">${articulado.length}</span></summary>
      <ol class="indice">${articulos.map(fila).join('')}</ol>
      <p class="indice__grupo">Disposiciones</p>
      <ol class="indice indice--disposiciones">${disposiciones.map(fila).join('')}</ol>
    </details>`;
};

/* -------------------------------------------------------------- arranque --- */

(async () => {
  /* La norma es el nombre del fichero: norma/orden-8-2025.html → orden-8-2025. */
  const id = location.pathname.split('/').pop().replace(/\.html$/, '');

  let norma;
  let texto;
  try {
    const [normas, contenido] = await Promise.all([
      cargar('../data/normas.json'),
      cargar(`../data/texto/${id}.json`),
    ]);
    norma = normas.find((n) => n.id === id);
    texto = contenido;
    if (!norma) throw new Error(`No hay ninguna norma con el identificador ${id}.`);
  } catch (error) {
    $('#cargando').innerHTML = `<strong>No se ha podido cargar el texto.</strong> ${escapar(error.message)}
      El <a href="../diagnostico.html">diagnóstico de despliegue</a> dice qué capa ha fallado.`;
    return;
  }

  document.title = `${identificador(norma)} · Texto · Legislación FP`;

  const anfitrion = new URL(norma.enlaces[0].url).hostname;
  const procedencia = DIARIO[anfitrion]
    ? `${AMBITO_NOMBRE[norma.ambito]} · ${DIARIO[anfitrion]}`
    : AMBITO_NOMBRE[norma.ambito];

  $('#cabecera').innerHTML = `
    <p class="ficha__procedencia">${escapar(procedencia)}</p>
    <h1 class="ficha__id" id="titulo" tabindex="-1">${escapar(identificador(norma))}</h1>
    <p class="ficha__meta">
      <span class="trazo" data-estado="${escapar(norma.estado)}" aria-hidden="true"></span>
      <span class="ficha__estado">${escapar(ESTADO_NOMBRE[norma.estado] ?? norma.estado)}</span>
      <time datetime="${escapar(norma.fecha)}">${escapar(fechaLarga(norma.fecha))}</time>
    </p>
    <p class="ficha__titulo">${escapar(norma.titulo)}</p>`;

  $('#volver').innerHTML =
    `<a href="../?n=${encodeURIComponent(norma.id)}">Volver a la ficha de la norma</a>`;

  if (texto.consolidacion?.propia) {
    const aplicadas = (texto.consolidacion.aplicadas ?? [])
      .map((a) => escapar(a.identificador)).join(', ');
    $('#consolidacion').hidden = false;
    $('#consolidacion').innerHTML = `
      <strong>Consolidación propia.</strong> ${escapar(texto.consolidacion.aviso)}
      ${aplicadas ? `<span class="aviso__detalle">Cambios aplicados: ${aplicadas}.</span>` : ''}`;
  }

  $('#indice').innerHTML = pintarIndice(texto.articulado);
  $('#articulado').innerHTML = texto.articulado.map(pintarPieza).join('');

  $('#oficial').innerHTML = `
    <h2 class="apartado__rotulo">Texto oficial</h2>
    <ul class="enlaces">${norma.enlaces.map((e) => `<li>${enlaceExterno(e.url, e.etiqueta)}</li>`).join('')}</ul>
    <p class="enlaces__aviso">El texto auténtico es el del diario oficial. Esto es una transcripción para consultarla, con fecha de revisión de ${escapar(fechaLarga(texto.revisado))}.</p>`;

  $('#cargando').remove();

  const ancha = window.matchMedia('(min-width: 60rem)');
  const ajustarIndice = () => { $('#indice-caja').open = ancha.matches; };
  ajustarIndice();
  ancha.addEventListener('change', ajustarIndice);

  /* Los saltos del índice se resuelven aquí para llevar también el foco: el
     comportamiento nativo mueve la vista y deja el foco donde estaba. */
  document.addEventListener('click', (evento) => {
    if (evento.defaultPrevented || evento.button !== 0) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
    const ancla = evento.target.closest('a[href^="#"]');
    if (!ancla) return;
    const destino = document.getElementById(decodeURIComponent(ancla.hash.slice(1)));
    if (!destino) return;
    evento.preventDefault();
    if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
    destino.focus({ preventScroll: true });
    destino.scrollIntoView();
    history.replaceState(null, '', ancla.hash);
  });

  /* Si se llega con un ancla, hay que saltar a mano: cuando el navegador lo
     intentó, el articulado todavía no estaba pintado. */
  if (location.hash.length > 1) {
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  }
})();
