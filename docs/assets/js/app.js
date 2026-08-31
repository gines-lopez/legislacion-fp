/* Diagnóstico de despliegue. Provisional: en la fase 3 lo sustituye el
   buscador. Comprueba las cuatro capas que pueden romperse al publicar en
   GitHub Pages bajo el subpath /legislacion-fp/. */

const marcar = (prueba, ok, detalle) => {
  const fila = document.querySelector(`[data-prueba="${prueba}"]`);
  if (!fila) return;
  fila.dataset.resultado = ok ? 'ok' : 'fallo';
  fila.querySelector('.comprobacion__resultado').textContent = detalle;
};

const fechaLarga = (iso) => {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-ES',
    { day: 'numeric', month: 'long', year: 'numeric' });
};

const pintarNorma = (norma, porId) => {
  const el = document.createElement('article');
  el.className = 'norma';
  el.dataset.estado = norma.estado;

  const etiqueta = norma.numero
    ? `${norma.tipo.replace('-', ' ')} ${norma.numero}`.toUpperCase()
    : `${norma.tipo} de ${fechaLarga(norma.fecha)}`.toUpperCase();

  const relaciones = norma.modificadaPor
    .map((id) => porId.get(id))
    .filter(Boolean)
    .map((otra) => `<p class="norma__relacion">Modificada por ${otra.tipo.toUpperCase()} ${otra.numero}</p>`)
    .join('');

  el.innerHTML = `
    <p class="norma__id">${etiqueta}<span class="norma__estado">${norma.estado}</span></p>
    <p class="norma__fecha">${fechaLarga(norma.fecha)}</p>
    <h3 class="norma__titulo">${norma.titulo}</h3>
    <p class="norma__resumen">${norma.resumen}</p>
    ${relaciones}`;
  return el;
};

(async () => {
  // 1. El script se está ejecutando.
  marcar('js', true, 'en ejecución');

  // 2. La hoja de estilos ha cargado: leemos una variable que solo ella define.
  const cargada = getComputedStyle(document.documentElement)
    .getPropertyValue('--hoja-cargada').trim() === '1';
  marcar('css', cargada, cargada ? 'cargada' : 'no encontrada');

  // 3. Las rutas relativas resuelven bajo el subpath del proyecto.
  const destino = new URL('data/normas.json', location.href);
  const mismaBase = destino.pathname.startsWith(
    location.pathname.replace(/[^/]*$/, ''));
  marcar('rutas', mismaBase, destino.pathname);

  // 4. Los datos se sirven y son JSON válido.
  try {
    const respuesta = await fetch('data/normas.json');
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    const normas = await respuesta.json();
    marcar('datos', true, `${normas.length} normas`);

    const porId = new Map(normas.map((n) => [n.id, n]));
    const muestra = document.getElementById('muestra');
    normas.forEach((n) => muestra.appendChild(pintarNorma(n, porId)));
  } catch (error) {
    marcar('datos', false, error.message);
  }
})();
