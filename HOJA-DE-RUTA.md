# Hoja de ruta

Estado a 31 de agosto de 2026.

## Fase 0 · Documentación — hecha

CLAUDE.md, [DECISIONES.md](DECISIONES.md), [MODELO-DATOS.md](MODELO-DATOS.md) y este fichero. `.gitignore` protegiendo `docs/`.

## Fase 1 · Esqueleto y despliegue — hecha en local, falta publicar

`docs/` con `index.html`, `.nojekyll`, `assets/css/base.css`, `assets/js/app.js` y dos normas semilla en `data/normas.json`.

La portada provisional es un **diagnóstico de despliegue**: comprueba en el propio navegador que cargan la hoja de estilos, el script y los datos, y muestra la ruta con la que ha resuelto el JSON. Si algo falla al publicar, se ve en la página en vez de en la consola. Se sustituye por el buscador en la fase 3.

Verificado en local sirviendo bajo un subpath, que es la única forma de detectar el fallo de rutas absolutas: las cuatro comprobaciones en verde, contraste AA en claro (mínimo 5,07:1) y oscuro (mínimo 5,6:1), y sin desbordamiento horizontal a 375 px.

Pendiente, y es acción manual del mantenedor: Settings → Pages → Source «Deploy from a branch» → `main` / carpeta `/docs`.

## Fase 2 · Datos — pendiente, es lo siguiente

Volcar las normas de las seis secciones de la web del CEICE a `docs/data/normas.json`, siguiendo [MODELO-DATOS.md](MODELO-DATOS.md).

**Ojo:** `normas.json` ya contiene dos normas semilla, `decreto-114-2025` y `decreto-95-2026`, revisadas a mano y con enlaces verificados. No duplicarlas.

### Cómo extraer

La página está renderizada en servidor: no hace falta navegador, basta descargarla. Sí hace falta enviar un *user agent*, porque sin él la petición no devuelve el contenido.

```bash
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" \
  "https://ceice.gva.es/es/web/formacion-profesional/normativa-sobre-ordenacion-y-organizacion-academica-de-los-ciclos-formativos" \
  -o gva.html
```

Comprobación rápida de que la descarga es buena: unos 130 KB, 225 elementos `<a>` y 129 enlaces a PDF, repartidos entre `ceice.gva.es`, `dogv.gva.es` y `boe.es`.

El dato clave es que **el texto del enlace contiene el identificador de la norma** («DECRETO 114/2025, de 29 de julio»), así que basta recorrer los pares enlace-texto:

```python
import re, html
raw = open('gva.html', encoding='utf-8', errors='replace').read()
for m in re.finditer(r'<a\b[^>]*href="([^"]+)"[^>]*>(.*?)</a>', raw, re.S | re.I):
    href, txt = m.group(1), re.sub(r'<[^>]+>', ' ', m.group(2))
    txt = html.unescape(re.sub(r'\s+', ' ', txt)).strip()
```

Normalizar siempre las URL obtenidas, porque la página original es inconsistente:

- Algunos enlaces al DOGV apuntan a la versión valenciana (`/va/resultat-dogv`). Cambiar a `/es/`; la signatura es la misma.
- Varios van en `http://`. Forzar `https://`.
- Conviven dos formas de enlazar el DOGV: PDF directo (`dogv.gva.es/datos/…/pdf/…`) y ficha por signatura (`resultat-dogv?signatura=…`). La ficha es preferible: es estable y ofrece el documento en ambas lenguas.

### Qué NO da el scraper

Esto es lo importante, y es trabajo humano:

- **`estado` y las relaciones.** Las modificaciones están redactadas en prosa dentro del texto del enlace o en la línea siguiente («modificado por el DECRETO 95/2026»). No hay marca estructural que las identifique: hay que leerlas. Es la razón de ser del sitio, así que es donde no se puede correr.
- **`fecha`.** La de la norma, no la de publicación en el diario, que suele ser posterior y es la que aparece en la URL del PDF.
- **`resumen`.** Se redacta, no se copia del preámbulo.
- **Correcciones de errores.** Aparecen como enlaces sueltos junto a la norma que corrigen; van dentro de `enlaces` de esa norma, no como norma aparte. El Decreto 95/2026 tiene una.

Al terminar, repasar los seis invariantes de [MODELO-DATOS.md](MODELO-DATOS.md), en especial la simetría de relaciones.

### Fuera de alcance

El apéndice de 45+ familias profesionales con las equivalencias LOGSE→LOE. Tiene estructura propia, de tabla de correspondencias, y entra como sección aparte más adelante.

## Fase 3 · Interfaz — pendiente

Portada con buscador instantáneo y filtros por sección, ámbito y estado. Ficha de norma mostrando sus relaciones. Aviso legal en el pie con fecha de última revisión.

## Fase 4 · Páginas de consulta — pendiente, a demanda

Articulado navegable en HTML para no tener que abrir el PDF. Se irán pidiendo norma a norma. Ver el matiz de D7 en [DECISIONES.md](DECISIONES.md): son ayuda a la lectura, no texto auténtico.
