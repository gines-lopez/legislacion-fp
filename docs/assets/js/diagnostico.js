/* Diagnóstico de despliegue.
   Comprueba, desde el propio navegador, las capas que pueden romperse al
   publicar en GitHub Pages bajo el subpath /legislacion-fp/. Vive en una
   página aparte para poder ejecutarlo tras cualquier publicación sin ocupar
   la portada. El fallo típico es una ruta absoluta: funciona sirviendo docs/
   en la raíz y revienta en producción, así que la comprobación tiene que
   hacerse contra el sitio publicado. */

const marcar = (prueba, ok, detalle) => {
  const fila = document.querySelector(`[data-prueba="${prueba}"]`);
  if (!fila) return;
  fila.dataset.resultado = ok ? 'ok' : 'fallo';
  fila.querySelector('.comprobacion__resultado').textContent = detalle;
};

/* La portada vive en otra página, así que su versión no está aquí: se carga el
   script en un iframe oculto del mismo origen y se le pregunta. Si algo falla,
   se devuelve null y la comprobación se limita a decir qué versión se sirve. */
const versionEnUso = () => new Promise((resolver) => {
  const marco = document.createElement('iframe');
  marco.hidden = true;
  marco.src = './';
  marco.addEventListener('load', () => {
    let version = null;
    try { version = marco.contentWindow.legislacionFP?.version ?? null; } catch { /* otro origen */ }
    marco.remove();
    resolver(version);
  });
  marco.addEventListener('error', () => { marco.remove(); resolver(null); });
  document.body.appendChild(marco);
  setTimeout(() => { marco.remove(); resolver(null); }, 4000);
});

const cargar = async (ruta) => {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
};

(async () => {
  // 1. El script se está ejecutando.
  marcar('js', true, 'en ejecución');

  /* 2. El navegador puede estar ejecutando un script viejo servido desde su
        propia caché: GitHub Pages manda cache-control de diez minutos, así que
        tras publicar hay una ventana en la que el HTML es nuevo y el script no.
        Se compara la versión que se está ejecutando con la del fichero que el
        servidor entrega ahora mismo, pedido sin caché. */
  try {
    const respuesta = await fetch('assets/js/app.js', { cache: 'no-store' });
    const servido = (await respuesta.text()).match(/const VERSION = '([^']+)'/)?.[1] ?? null;
    const cacheado = await versionEnUso();
    if (!servido) marcar('version', false, 'sin marca de versión');
    else if (!cacheado) marcar('version', true, `${servido} servida`);
    else if (cacheado === servido) marcar('version', true, `${servido} en uso`);
    else marcar('version', false, `usando ${cacheado}, publicada ${servido}`);
  } catch (error) {
    marcar('version', false, error.message);
  }

  // 3. La hoja de estilos ha cargado: leemos una variable que solo ella define.
  const cargada = getComputedStyle(document.documentElement)
    .getPropertyValue('--hoja-cargada').trim() === '1';
  marcar('css', cargada, cargada ? 'cargada' : 'no encontrada');

  // 3. Las rutas relativas resuelven bajo el subpath del proyecto. Si alguna
  //    fuera absoluta, el destino colgaría de la raíz del dominio y no de aquí.
  const destino = new URL('data/normas.json', location.href);
  const base = location.pathname.replace(/[^/]*$/, '');
  marcar('rutas', destino.pathname.startsWith(base), destino.pathname);

  // 4, 5 y 6. Los tres ficheros de datos se sirven y son JSON válido.
  const ficheros = [
    ['normas', 'data/normas.json', (d) => `${d.length} ${d.length === 1 ? 'norma' : 'normas'}`],
    ['recursos', 'data/recursos.json', (d) => `${d.length} ${d.length === 1 ? 'recurso' : 'recursos'}`],
    ['meta', 'data/meta.json', (d) => `revisado el ${d.revisado}`],
  ];

  const datos = {};
  for (const [prueba, ruta, describir] of ficheros) {
    try {
      datos[prueba] = await cargar(ruta);
      marcar(prueba, true, describir(datos[prueba]));
    } catch (error) {
      marcar(prueba, false, error.message);
    }
  }

  // 7. Los invariantes de relación entre normas: toda relación declarada por
  //    un lado tiene que estarlo por el otro. Ver MODELO-DATOS.md.
  if (!datos.normas) {
    marcar('invariantes', false, 'sin datos');
    return;
  }

  const porId = new Map(datos.normas.map((n) => [n.id, n]));
  const fallos = [];

  for (const norma of datos.normas) {
    const citados = [
      ...norma.modificadaPor.map((id) => ['modificadaPor', id]),
      ...norma.modifica.map((id) => ['modifica', id]),
      ...norma.deroga.map((id) => ['deroga', id]),
    ];

    for (const [campo, id] of citados) {
      const otra = porId.get(id);
      if (!otra) { fallos.push(`${norma.id}: ${campo} → ${id} no existe`); continue; }
      const reciproco = { modificadaPor: 'modifica', modifica: 'modificadaPor', deroga: null }[campo];
      if (reciproco && !otra[reciproco].includes(norma.id)) {
        fallos.push(`${norma.id} ↔ ${id}: falta ${reciproco}`);
      }
    }

    if (norma.estado === 'modificada' && norma.modificadaPor.length === 0) {
      fallos.push(`${norma.id}: modificada sin modificadaPor`);
    }
    if (norma.estado === 'derogada'
        && !datos.normas.some((otra) => otra.deroga.includes(norma.id))) {
      fallos.push(`${norma.id}: derogada y nadie la deroga`);
    }

    /* Un anexo cuelga de la norma que lo publica; si esa norma no existe, la
       ficha de la madre no lo mostrará y el anexo quedará suelto. */
    if (norma.parteDe && !porId.has(norma.parteDe)) {
      fallos.push(`${norma.id}: parteDe → ${norma.parteDe} no existe`);
    }
  }

  marcar('invariantes', fallos.length === 0,
    fallos.length === 0 ? 'sin incoherencias' : `${fallos.length} incoherencias`);

  /* 8. Las preguntas frecuentes: que el fichero de cada norma que dice tenerlas
        exista, y que ninguna respuesta se quede sin epígrafe ni sin la cita en
        que se apoya. Una respuesta sin respaldo es justo lo que este sitio no
        puede permitirse. */
  const conConsulta = datos.normas.filter((n) => n.consulta);
  const problemas = [];
  let totalPreguntas = 0;

  for (const norma of conConsulta) {
    let consulta;
    try {
      consulta = await cargar(`data/consulta/${norma.id}.json`);
    } catch (error) {
      problemas.push(`${norma.id}: no se puede leer su fichero de consulta`);
      continue;
    }
    const preguntas = consulta.preguntas ?? [];
    totalPreguntas += preguntas.length;
    const identificadores = new Set();
    for (const pregunta of preguntas) {
      if (identificadores.has(pregunta.id)) problemas.push(`${norma.id}: pregunta repetida ${pregunta.id}`);
      identificadores.add(pregunta.id);
      for (const campo of ['pregunta', 'respuesta', 'epigrafe', 'cita']) {
        if (!pregunta[campo]) problemas.push(`${norma.id}/${pregunta.id ?? '?'}: falta ${campo}`);
      }
    }
  }

  marcar('consulta', problemas.length === 0,
    problemas.length === 0
      ? `${totalPreguntas} ${totalPreguntas === 1 ? 'pregunta' : 'preguntas'}`
      : `${problemas.length} problemas`);

  fallos.push(...problemas);

  if (fallos.length) {
    const detalle = document.getElementById('fallos');
    detalle.hidden = false;
    detalle.querySelector('ul').innerHTML =
      fallos.map((f) => `<li>${f.replace(/[<>&]/g, '')}</li>`).join('');
  }
})();
