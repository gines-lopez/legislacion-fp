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

const cargar = async (ruta) => {
  const respuesta = await fetch(ruta);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  return respuesta.json();
};

(async () => {
  // 1. El script se está ejecutando.
  marcar('js', true, 'en ejecución');

  // 2. La hoja de estilos ha cargado: leemos una variable que solo ella define.
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
  }

  marcar('invariantes', fallos.length === 0,
    fallos.length === 0 ? 'sin incoherencias' : `${fallos.length} incoherencias`);

  if (fallos.length) {
    const detalle = document.getElementById('fallos');
    detalle.hidden = false;
    detalle.querySelector('ul').innerHTML =
      fallos.map((f) => `<li>${f.replace(/[<>&]/g, '')}</li>`).join('');
  }
})();
