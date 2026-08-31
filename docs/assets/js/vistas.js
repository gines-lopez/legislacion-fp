/* ==========================================================================
   legislacion-fp · el pintado de la portada

   Compone el HTML del listado y de la ficha a partir de lo que hay en datos.js
   y lo mete en su sitio. No lee la URL ni la escribe —eso es rutas.js— ni
   decide cuándo se pinta —eso es app.js—: aquí solo se dibuja lo que se pide.
   ========================================================================== */

import {
  AMBITO_NOMBRE, DIARIO, ESTADO_NOMBRE, SIN_CITA_PROPIA, TIPO,
  $, aplanar, escapar, fechaLarga, identificador, enlaceExterno, procedencia,
  resaltar, rotuloDePieza, terminosDe,
} from './comun.js';
import {
  datos, EJES, SECCIONES, SECCION_NOMBRE, TEMAS, fragmento, coincide,
  piezasCoincidentes, recuentos, porRango,
} from './datos.js';
import { urlArticulo, urlEsquema, urlFicha, urlListado, urlPieza, urlTexto } from './rutas.js';

/* ----------------------------------------------------------- vocabulario --- */

/* Un distintivo de estado a solas informa de menos de lo que aparenta: dice
   QUE una norma cambió, nunca HASTA DÓNDE, y aquí el alcance casi nunca es
   total. Estas notas lo advierten y remiten al resumen, que es donde vive ese
   matiz. Ver «Lo que el modelo no captura» en MODELO-DATOS.md. */
export const NOTA_ESTADO = {
  vigente: 'Nada de lo recogido en este sitio la deroga ni la modifica.',
  modificada: 'Sigue siendo aplicable. Qué se modificó y hasta dónde está en el resumen y en las normas que la reforman.',
  derogada: 'Ya no está en vigor. Se conserva porque se sigue citando y porque una derogación no borra los efectos ya producidos a su amparo. El alcance está en el resumen.',
};

/* ------------------------------------------------------------- utilidades --- */

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

/* ----------------------------------------------------------------- pintado --- */

/* Una lista de normas escrita como se lee: «la Orden 8/2025 y la Resolución de
   16 de julio de 2026». Hace falta desde que un bloque de resultados puede
   venir de más de una norma. */
const listaDeNormas = (normas) => normas.map((n) => escapar(identificador(n)))
  .join(normas.length === 2 ? ' y ' : ', ')
  .replace(/, ([^,]*)$/, ' y $1');

const enlacesAFichas = (normas) => normas
  .map((n) => `<a href="${escapar(urlFicha(n.id))}">${escapar(identificador(n))}</a>`)
  .join(normas.length === 2 ? ' y ' : ', ')
  .replace(/, ([^,]*)$/, ' y $1');

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
        <a href="${escapar(urlTexto(norma.id))}">Leer el texto completo aquí</a>
      </p>` : ''}
    ${norma.esquema ? `
      <p class="norma__transcrito">
        <a href="${escapar(urlEsquema(norma.id))}">Ver cómo está construida esta ley</a>
      </p>` : ''}
    ${materiasCoincidentes(norma, terminos)}
    ${relacionesBreves(norma, terminos)}
  </li>`;

export const pintarListado = (filtros) => {
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
    /* Las respuestas pueden venir de más de una norma en cuanto haya una
       segunda FAQ, así que ni el rótulo ni el enlace del resto pueden darse por
       supuestos: se derivan de las normas que de verdad han aparecido. Con una
       sola, que es el caso de hoy, sale exactamente lo mismo que antes. */
    const suyas = [...new Set(encontradas.map(({ norma }) => norma.id))]
      .map((id) => datos.porId.get(id));
    const variasNormas = suyas.length > 1;
    respuestas.innerHTML = `
      <h2 class="apartado__rotulo">Respuestas<span class="apartado__n">${encontradas.length}</span></h2>
      <p class="respuestas__nota">De las preguntas frecuentes de ${listaDeNormas(suyas)}.</p>
      <ol class="respuestas__lista">${encontradas.slice(0, MUESTRA).map(({ norma: n, pregunta }) => `
        <li class="respuesta">
          ${variasNormas ? `<p class="respuesta__norma">${resaltar(identificador(n), terminos)}</p>` : ''}
          <p class="respuesta__pregunta"><a href="${escapar(urlFicha(n.id, pregunta.id))}">${resaltar(pregunta.pregunta, terminos)}</a></p>
          <p class="respuesta__texto">${resaltar(pregunta.respuesta, terminos)}</p>
          <p class="respuesta__epigrafe">Epígrafe ${escapar(pregunta.epigrafe)} · ${escapar(pregunta.epigrafeTitulo)}</p>
        </li>`).join('')}
      </ol>
      ${encontradas.length > MUESTRA ? `<p class="respuestas__resto">${variasNormas
        ? `Y ${encontradas.length - MUESTRA === 1 ? 'una respuesta más' : `${encontradas.length - MUESTRA} respuestas más`}, en la ficha de ${enlacesAFichas(suyas)}.`
        : `<a href="${escapar(urlFicha(suyas[0].id))}">Ver las ${encontradas.length} respuestas en la ficha de la norma</a>`}</p>` : ''}`;
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
            <a href="${escapar(urlPieza(norma.id, pieza, filtros.q))}">
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
        .map((n) => `<a href="${escapar(urlTexto(n.id, filtros.q))}">${escapar(identificador(n))}</a>`)
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
          <a href="${escapar(urlArticulo(pregunta.veTambien.norma, pregunta.veTambien.articulo))}">${escapar(pregunta.veTambien.etiqueta)}</a>
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

export const pintarFicha = (norma, volverA, abierta) => {
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
            <a href="${escapar(urlTexto(norma.id))}">Leer el articulado completo aquí</a>
            <span class="ficha__transcripcion-nota">Transcripción para consultarla, no texto auténtico</span>
          </p>` : ''}

        ${norma.esquema ? `
          <p class="ficha__transcripcion">
            <a href="${escapar(urlEsquema(norma.id))}">Ver cómo está construida esta ley</a>
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
export const nivelDelTitulo = (etiqueta) => {
  const actual = $('.cabecera__titulo');
  if (!actual || actual.tagName.toLowerCase() === etiqueta) return;
  const nuevo = document.createElement(etiqueta);
  nuevo.className = actual.className;
  nuevo.innerHTML = actual.innerHTML;
  actual.replaceWith(nuevo);
};

/* El atajo a las instrucciones del curso en vigor y los datos de la cabecera:
   los pinta el arranque una sola vez, cuando el corpus ya está. */
export const pintarAtajo = (norma) => {
  $('#atajo').hidden = false;
  $('#atajo').innerHTML = `
    <a class="boton boton--atajo" href="${escapar(urlFicha(norma.id))}">
      Instrucciones del curso ${escapar(cursoDe(norma))}
    </a>
    <span class="atajo__nota">${escapar(identificador(norma))}</span>`;
};

export const pintarMeta = (meta) => {
  $('#cabecera-datos').textContent =
    ` · ${datos.normas.length} normas · revisado el ${fechaLarga(meta.revisado)}`;
  if (meta.fuente) {
    $('#pie-fuente').innerHTML =
      `Adapta ${enlaceExterno(meta.fuente.url, meta.fuente.titulo)}, de la ${escapar(meta.fuente.organismo)}.`;
  }
};
