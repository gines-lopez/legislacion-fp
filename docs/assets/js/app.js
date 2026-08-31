/* ==========================================================================
   legislacion-fp · portada y ficha

   Este módulo decide: lee la URL, elige qué vista toca y arranca la carga. El
   vocabulario y las utilidades están en comun.js, los datos en datos.js, las
   URL en rutas.js y el pintado en vistas.js.

   Todo se pinta desde docs/data/normas.json, que es la fuente de verdad única
   (D3): ni una norma escrita en el HTML. El estado de la vista vive entero en
   la URL, así que cualquier consulta —una búsqueda, un filtro, una ficha— es
   un enlace que se puede pegar en un correo.

   Rutas siempre relativas: en producción el sitio cuelga de /legislacion-fp/.
   ========================================================================== */

import { $, escapar, identificador, terminosDe } from './comun.js';
import {
  datos, cargarCorpus, cargarConsultas, cargarArticulado,
} from './datos.js';
import { leerURL, urlListado } from './rutas.js';
import {
  nivelDelTitulo, pintarAtajo, pintarFicha, pintarListado, pintarMeta,
} from './vistas.js';

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

/* Repintar el cuerpo de la ficha sin tocar el desplazamiento ni el foco: quien
   está leyendo no ha pedido ir a ninguna parte. */
const repintarFicha = (filtros) => {
  const norma = datos.porId.get(filtros.n);
  if (norma) $('#vista-ficha').innerHTML = pintarFicha(norma, ultimoListado ?? location.pathname, filtros.p);
};

const ir = (destino, { reemplazar = false } = {}) => {
  const url = new URL(destino, location.href);
  if (reemplazar) history.replaceState(null, '', url);
  else history.pushState(null, '', url);
  pintar();
};

/* ------------------------------------------------------------------ arranque --- */

/* Solo el corpus se espera antes de pintar. Las preguntas frecuentes y el
   articulado llegan después, porque el listado no los necesita y hacerle
   esperar por ellos es cobrarle a quien entra un viaje que no ha pedido. */
(async () => {
  try {
    await cargarCorpus();
  } catch (error) {
    $('#cargando').innerHTML = `
      <strong>No se ha podido cargar el listado.</strong> ${escapar(error.message)}
      El <a href="diagnostico.html">diagnóstico de despliegue</a> dice qué capa ha fallado.`;
    $('#cargando').classList.add('cargando--fallo');
    return;
  }

  /* La excepción: si la URL pide la ficha de una norma que tiene preguntas, se
     espera a las suyas y solo a las suyas. Pintar la ficha sin ellas y
     repintarla al llegar sería un salto en mitad de la lectura. */
  const pedida = datos.porId.get(leerURL().n);
  if (pedida?.consulta) await cargarConsultas([pedida]);

  $('#cargando').remove();

  if (datos.instrucciones) pintarAtajo(datos.instrucciones);
  if (datos.meta) pintarMeta(datos.meta);

  pintar();
  primerPintado = false;

  /* Y ahora lo demás. Cuando llega, se repinta solo si cambia algo de lo que se
     está viendo: el listado si hay una búsqueda en marcha, y la ficha solo si
     es justamente la de la norma cuyas preguntas acaban de llegar —lo que ya no
     puede pasar salvo que se haya navegado a ella mientras cargaban—. */
  cargarConsultas().then((cargadas) => {
    if (!cargadas.length) return;
    const filtros = leerURL();
    if (filtros.n) {
      if (cargadas.includes(filtros.n)) repintarFicha(filtros);
    } else if (terminosDe(filtros.q).length) pintarListado(filtros);
  });

  cargarArticulado().then((hay) => {
    if (!hay) return;
    const filtros = leerURL();
    if (!filtros.n && terminosDe(filtros.q).length) pintarListado(filtros);
  });

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
