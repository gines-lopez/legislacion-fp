# Hoja de ruta

Estado a 31 de agosto de 2026.

## Fase 0 · Documentación — hecha

CLAUDE.md, [DECISIONES.md](DECISIONES.md), [MODELO-DATOS.md](MODELO-DATOS.md) y este fichero. `.gitignore` protegiendo `docs/`.

## Fase 1 · Esqueleto y despliegue — hecha en local, falta publicar

`docs/` con `index.html`, `.nojekyll`, `assets/css/base.css`, `assets/js/app.js` y dos normas semilla en `data/normas.json`.

La portada provisional es un **diagnóstico de despliegue**: comprueba en el propio navegador que cargan la hoja de estilos, el script y los datos, y muestra la ruta con la que ha resuelto el JSON. Si algo falla al publicar, se ve en la página en vez de en la consola. Se sustituye por el buscador en la fase 3.

Verificado en local sirviendo bajo un subpath, que es la única forma de detectar el fallo de rutas absolutas: las cuatro comprobaciones en verde, contraste AA en claro (mínimo 5,07:1) y oscuro (mínimo 5,6:1), y sin desbordamiento horizontal a 375 px.

Pendiente, y es acción manual del mantenedor: Settings → Pages → Source «Deploy from a branch» → `main` / carpeta `/docs`.

## Fase 2 · Datos — pendiente

Extraer las normas de las seis secciones de la web del CEICE a `docs/data/normas.json`. La página está renderizada en servidor y sus enlaces se extraen con un script de un solo uso (129 PDF a DOGV, BOE y CEICE).

Lo que un scraper acierta: URL, y títulos en bruto. Lo que hay que revisar a mano: `fecha`, `estado`, las relaciones entre normas y los `resumen`, que se redactan. Reservar tiempo para esta revisión: es donde está el rigor del sitio.

Fuera de alcance por ahora: el apéndice de 45+ familias profesionales con las equivalencias LOGSE→LOE. Tiene estructura propia, de tabla de correspondencias, y entra como sección aparte más adelante.

## Fase 3 · Interfaz — pendiente

Portada con buscador instantáneo y filtros por sección, ámbito y estado. Ficha de norma mostrando sus relaciones. Aviso legal en el pie con fecha de última revisión.

## Fase 4 · Páginas de consulta — pendiente, a demanda

Articulado navegable en HTML para no tener que abrir el PDF. Se irán pidiendo norma a norma. Ver el matiz de D7 en [DECISIONES.md](DECISIONES.md): son ayuda a la lectura, no texto auténtico.
