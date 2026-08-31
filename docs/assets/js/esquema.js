/* ==========================================================================
   legislacion-fp · esquema de una norma

   Pinta el esquema de una ley desde data/esquema/<id>.json. La norma se deduce
   del nombre del fichero, así que este script sirve para cualquier esquema que
   se escriba después sin tocar una línea, igual que norma.js con el articulado
   (D23).

   Un esquema no es una transcripción: es una lectura. Por eso cada pieza dice
   de qué artículo sale y, cuando afirma una cifra o una regla, reproduce la
   frase literal de la ley en la que se apoya. Es la misma exigencia que D18
   impone a las preguntas frecuentes, y por la misma razón: lo que interpreta
   es lo que puede hacer daño.

   Rutas relativas y un nivel por debajo: la página vive en docs/esquema/.
   ========================================================================== */

'use strict';

const VERSION = '0.8';
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

/* --------------------------------------------------------------- piezas --- */

/* Un artículo se enlaza al BOE, que es el texto auténtico, y no a este sitio:
   de esta ley no hay transcripción propia. El identificador ELI del BOE admite
   el ancla del artículo. */
const ELI = 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-5139';

const enlaceArticulo = (numero) => `
  <a class="art" href="${ELI}#a${escapar(numero)}" target="_blank" rel="noopener noreferrer"
     title="Artículo ${escapar(numero)} en el BOE">${escapar(numero)}<span class="oculto"> (se abre en una ventana nueva)</span></a>`;

const listaArticulos = (numeros) => (numeros ?? []).length ? `
  <p class="pieza-articulos"><span class="pieza-articulos__rotulo">${numeros.length === 1 ? 'Artículo' : 'Artículos'}</span>
    ${numeros.map(enlaceArticulo).join('')}</p>` : '';

/* La frase de la ley en la que se apoya lo que se acaba de afirmar. Va debajo,
   entrecomillada y con el artículo del que sale: sin ella el esquema sería una
   opinión sobre la ley en vez de una lectura comprobable de ella. */
const apoyo = (cita, articulo) => cita ? `
  <p class="apoyo"><span class="apoyo__texto">${escapar(cita)}</span>
    <span class="apoyo__fuente">Artículo ${escapar(articulo)}</span></p>` : '';

const filas = (lista) => (lista ?? []).map((fila) => `
  <div class="dato">
    <dt class="dato__clave">${escapar(fila.clave)}</dt>
    <dd class="dato__valor">${escapar(fila.valor)}${apoyo(fila.cita, fila.citaArticulo)}</dd>
  </div>`).join('');

/* ------------------------------------------------------------- bloques --- */

/* La escalera de grados. Cada peldaño se sangra un poco más que el anterior y
   la regla de acumulación va ENTRE dos peldaños, no dentro de uno: es lo que
   convierte cinco fichas sueltas en una escalera. Sin color (D5): el peldaño
   que importa aquí —el D, donde trabaja el profesorado— se distingue por peso
   y por filete, no por tono. */
const pintarEscalera = (bloque) => `
  <section class="bloque-esquema" id="${escapar(bloque.id)}" tabindex="-1">
    <h2 class="bloque-esquema__rotulo">${escapar(bloque.rotulo)}</h2>
    <p class="bloque-esquema__entradilla">${escapar(bloque.entradilla)}</p>
    ${apoyo(bloque.cita, bloque.citaArticulo)}
    <ol class="escalera">
      ${bloque.pasos.map((paso, i) => `
        <li class="peldano" style="--nivel: ${i}"${paso.destacado ? ' data-destacado="si"' : ''}>
          <div class="peldano__cabeza">
            <span class="peldano__letra" aria-hidden="true">${escapar(paso.letra)}</span>
            <h3 class="peldano__nombre"><span class="oculto">Grado ${escapar(paso.letra)}. </span>${escapar(paso.nombre)}</h3>
          </div>
          <p class="peldano__que">${escapar(paso.que)}</p>
          <dl class="datos">${filas(paso.filas)}</dl>
          ${listaArticulos(paso.articulos)}
          ${paso.acumula ? `
            <p class="acumula">${escapar(paso.acumula)}${apoyo(paso.acumulaCita, paso.acumulaArticulo)}</p>` : ''}
        </li>`).join('')}
    </ol>
  </section>`;

/* La cadena de catálogos. Es un flujo, así que se pinta como flujo: eslabones
   numerados que se encadenan, y aparte lo que entra o sale por los lados. */
const pintarCadena = (bloque) => `
  <section class="bloque-esquema" id="${escapar(bloque.id)}" tabindex="-1">
    <h2 class="bloque-esquema__rotulo">${escapar(bloque.rotulo)}</h2>
    <p class="bloque-esquema__entradilla">${escapar(bloque.entradilla)}</p>
    <ol class="cadena">
      ${bloque.eslabones.map((eslabon) => `
        <li class="eslabon">
          <span class="eslabon__numero" aria-hidden="true">${escapar(eslabon.numero)}</span>
          <div class="eslabon__cuerpo">
            <h3 class="eslabon__nombre">${escapar(eslabon.nombre)}</h3>
            <p class="eslabon__que">${escapar(eslabon.que)}</p>
            ${apoyo(eslabon.cita, eslabon.citaArticulo)}
            ${listaArticulos(eslabon.articulos)}
          </div>
        </li>`).join('')}
    </ol>
    <div class="derivaciones">
      ${bloque.derivaciones.map((rama) => `
        <section class="derivacion">
          <h3 class="derivacion__nombre">${escapar(rama.nombre)}</h3>
          <p class="derivacion__que">${escapar(rama.que)}</p>
          ${apoyo(rama.cita, rama.citaArticulo)}
          ${listaArticulos(rama.articulos)}
        </section>`).join('')}
    </div>
  </section>`;

/* Los dos regímenes, criterio a criterio y no columna a columna. Enfrentados en
   dos columnas, cada una se quedaba en doscientos píxeles dentro de la columna
   de lectura y las filas no llegaban a alinearse, que es lo único que hace útil
   una comparación. Así los dos valores de un mismo criterio quedan pegados, y
   cada uno lleva escrito a qué régimen pertenece: se lee igual de bien en una
   pantalla ancha que en uno de móvil, sin dos estructuras distintas. */
const pintarComparacion = (bloque) => `
  <section class="bloque-esquema" id="${escapar(bloque.id)}" tabindex="-1">
    <h2 class="bloque-esquema__rotulo">${escapar(bloque.rotulo)}</h2>
    <p class="bloque-esquema__entradilla">${escapar(bloque.entradilla)}</p>
    ${apoyo(bloque.cita, bloque.citaArticulo)}

    <section class="comun">
      <h3 class="comun__rotulo">${escapar(bloque.comun.rotulo)}</h3>
      <ul class="comun__puntos">
        ${bloque.comun.puntos.map((punto) => `
          <li class="comun__punto">${escapar(punto.texto)}
            ${punto.cita ? apoyo(punto.cita, punto.citaArticulo)
              : `<span class="comun__fuente">Artículo ${escapar(punto.citaArticulo)}</span>`}</li>`).join('')}
      </ul>
    </section>

    <dl class="comparativa">
      ${bloque.columnas[0].filas.map((_, i) => `
        <div class="criterio">
          <dt class="criterio__clave">${escapar(bloque.columnas[0].filas[i].clave)}</dt>
          ${bloque.columnas.map((columna) => {
            const fila = columna.filas[i];
            return `
            <dd class="criterio__valor">
              <span class="criterio__regimen">${escapar(columna.nombre.replace(/^Régimen /, ''))}</span>
              <span class="criterio__texto">${escapar(fila.valor)}${apoyo(fila.cita, fila.citaArticulo)}</span>
            </dd>`;
          }).join('')}
        </div>`).join('')}
    </dl>
    <div class="columnas-articulos">
      ${bloque.columnas.map((columna) => `
        <div class="columna-articulos">
          <span class="criterio__regimen">${escapar(columna.nombre.replace(/^Régimen /, ''))}</span>
          ${listaArticulos(columna.articulos)}
        </div>`).join('')}
    </div>
  </section>`;

/* El mapa. Es el índice completo, pero cada título lleva delante qué resuelve:
   un índice dice cómo se llama cada parte, un mapa dice para qué sirve. */
const pintarMapa = (bloque) => {
  const articulos = (lista) => (lista ?? []).length ? `
    <ol class="mapa__articulos">
      ${lista.map((a) => `
        <li><a href="${ELI}#a${escapar(a.numero)}" target="_blank" rel="noopener noreferrer">
          <span class="mapa__numero">${escapar(a.numero)}</span>
          <span class="mapa__titulo">${escapar(a.titulo)}</span>
        </a></li>`).join('')}
    </ol>` : '';

  const secciones = (lista) => (lista ?? []).map((seccion) => `
    <div class="mapa__seccion">
      <h5 class="mapa__seccion-rotulo">${escapar(seccion.titulo)}</h5>
      ${articulos(seccion.articulos)}
    </div>`).join('');

  return `
  <section class="bloque-esquema" id="${escapar(bloque.id)}" tabindex="-1">
    <h2 class="bloque-esquema__rotulo">${escapar(bloque.rotulo)}</h2>
    <p class="bloque-esquema__entradilla">${escapar(bloque.entradilla)}</p>

    ${bloque.titulos.map((titulo) => `
      <details class="mapa__titulo-caja">
        <summary class="mapa__cabeza">
          <span class="mapa__romano">${escapar(titulo.num === 'PRELIMINAR' ? 'Prelim.' : titulo.num)}</span>
          <span class="mapa__nombre">${escapar(titulo.titulo)}</span>
        </summary>
        <p class="mapa__clave">${escapar(titulo.clave)}</p>
        ${articulos(titulo.articulos)}
        ${secciones(titulo.secciones)}
        ${(titulo.capitulos ?? []).map((capitulo) => `
          <div class="mapa__capitulo">
            <h4 class="mapa__capitulo-rotulo">
              <span class="mapa__capitulo-num">Capítulo ${escapar(capitulo.num)}</span>
              ${escapar(capitulo.titulo)}
            </h4>
            ${articulos(capitulo.articulos)}
            ${secciones(capitulo.secciones)}
          </div>`).join('')}
      </details>`).join('')}

    <div class="mapa__disposiciones">
      ${bloque.disposiciones.map((grupo) => `
        <div class="mapa__grupo">
          <h4 class="mapa__grupo-rotulo">${escapar(grupo.grupo)}<span class="apartado__n">${grupo.piezas.length}</span></h4>
          <ul class="mapa__lista">
            ${grupo.piezas.map((pieza) => `
              <li><span class="mapa__disp">${escapar(pieza.rotulo.replace('Disposición ', ''))}</span>
                ${pieza.titulo ? `<span class="mapa__titulo">${escapar(pieza.titulo)}</span>` : '<span class="mapa__titulo mapa__titulo--vacio">sin rúbrica en el BOE</span>'}</li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>
  </section>`;
};

/* Qué de este listado desarrolla la ley. No se escribe: se deduce de la
   etiqueta, así que al añadir una norma nueva aparece aquí sola (D3). */
const pintarCorpus = (bloque, normas, propia) => {
  const relacionadas = normas
    .filter((n) => n.id !== propia && (n.etiquetas ?? []).includes(bloque.etiqueta))
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  if (!relacionadas.length) return '';

  return `
  <section class="bloque-esquema" id="${escapar(bloque.id)}" tabindex="-1">
    <h2 class="bloque-esquema__rotulo">${escapar(bloque.rotulo)}<span class="apartado__n">${relacionadas.length}</span></h2>
    <p class="bloque-esquema__entradilla">${escapar(bloque.entradilla)}</p>
    <ol class="relaciones">
      ${relacionadas.map((norma) => `
        <li class="relacion" data-estado="${escapar(norma.estado)}">
          <p class="relacion__id"><a href="../?n=${encodeURIComponent(norma.id)}">${escapar(identificador(norma))}</a></p>
          <p class="relacion__meta">
            <span class="relacion__estado">${escapar(ESTADO_NOMBRE[norma.estado] ?? norma.estado)}</span>
            <time datetime="${escapar(norma.fecha)}">${escapar(fechaLarga(norma.fecha))}</time>
          </p>
          <p class="relacion__titulo">${escapar(norma.titulo)}</p>
          <p class="relacion__resumen">${escapar(norma.resumen)}</p>
        </li>`).join('')}
    </ol>
    <p class="bloque-esquema__nota">${escapar(bloque.nota)}</p>
  </section>`;
};

const PINTORES = {
  escalera: pintarEscalera,
  cadena: pintarCadena,
  comparacion: pintarComparacion,
  mapa: pintarMapa,
};

/* -------------------------------------------------------------- arranque --- */

(async () => {
  /* La norma es el nombre del fichero: esquema/lo-3-2022.html → lo-3-2022. */
  const id = location.pathname.split('/').pop().replace(/\.html$/, '');

  let norma;
  let esquema;
  let normas;
  try {
    const [listado, contenido] = await Promise.all([
      cargar('../data/normas.json'),
      cargar(`../data/esquema/${id}.json`),
    ]);
    normas = listado;
    norma = listado.find((n) => n.id === id);
    esquema = contenido;
    if (!norma) throw new Error(`No hay ninguna norma con el identificador ${id}.`);
  } catch (error) {
    $('#cargando').innerHTML = `<strong>No se ha podido cargar el esquema.</strong> ${escapar(error.message)}
      El <a href="../diagnostico.html">diagnóstico de despliegue</a> dice qué capa ha fallado.`;
    return;
  }

  document.title = `${identificador(norma)} · Esquema · Legislación FP`;

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

  $('#aviso').hidden = false;
  $('#aviso').innerHTML = `<strong>Esquema, no texto.</strong> ${escapar(esquema.aviso)}`;

  /* La tesis primero: qué hace esta ley, en un párrafo. Un esquema que empieza
     por el índice obliga a leerlo entero para saber de qué va. */
  $('#portada').innerHTML = `
    <p class="tesis">${escapar(esquema.tesis)}</p>
    <dl class="cifras">
      ${esquema.cifras.map((cifra) => `
        <div class="cifra">
          <dt class="cifra__dato"${cifra.mono ? ' data-mono="si"' : ''}>${escapar(cifra.dato)}</dt>
          <dd class="cifra__rotulo">${escapar(cifra.rotulo)}${cifra.nota ? `<span class="cifra__nota">${escapar(cifra.nota)}</span>` : ''}</dd>
        </div>`).join('')}
    </dl>`;

  $('#bloques').innerHTML = esquema.bloques
    .map((bloque) => (bloque.tipo === 'corpus'
      ? pintarCorpus(bloque, normas, norma.id)
      : (PINTORES[bloque.tipo] ?? (() => ''))(bloque)))
    .join('');

  $('#indice').innerHTML = `
    <details class="indice__caja" id="indice-caja">
      <summary class="apartado__rotulo indice__resumen">En esta página<span class="apartado__n">${esquema.bloques.length}</span></summary>
      <ol class="indice">
        ${esquema.bloques.map((bloque, i) => `
          <li><a href="#${escapar(bloque.id)}">
            <span class="indice__numero">${i + 1}</span>
            <span class="indice__titulo">${escapar(bloque.rotulo)}</span>
          </a></li>`).join('')}
      </ol>
    </details>`;

  $('#oficial').innerHTML = `
    <h2 class="apartado__rotulo">Texto oficial</h2>
    <ul class="enlaces">${norma.enlaces.map((e) => `<li>${enlaceExterno(e.url, e.etiqueta)}</li>`).join('')}</ul>
    <p class="enlaces__aviso">El texto auténtico es el del BOE. Esto es un esquema para entenderla, con fecha de revisión de ${escapar(fechaLarga(esquema.revisado))}.</p>`;

  $('#cargando').remove();

  const ancha = window.matchMedia('(min-width: 60rem)');
  const ajustarIndice = () => { $('#indice-caja').open = ancha.matches; };
  ajustarIndice();
  ancha.addEventListener('change', ajustarIndice);

  /* Los saltos del índice se resuelven aquí para llevar también el foco: el
     comportamiento nativo mueve la vista y deja el foco donde estaba (D20). */
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

  /* Si se llega con un ancla hay que saltar a mano: cuando el navegador lo
     intentó, los bloques todavía no estaban pintados. */
  if (location.hash.length > 1) {
    const destino = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (destino) destino.scrollIntoView();
  }
})();
