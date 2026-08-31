# Decisiones

Decisiones cerradas, con su porqué y qué las reabriría. Si una propuesta contradice algo de aquí, hay que discutirlo antes, no cambiarlo por el camino.

## D1 · Sitio estático sin build

HTML, CSS y JS servidos tal cual; los datos, en un JSON.

**Por qué:** el mantenedor es una persona sola que actualizará normativa de forma esporádica. Un `npm install` que se pudre entre actualizaciones cuesta más que el HTML que ahorra. Sin build no hay nada que se rompa por no tocarlo en seis meses.

**Se reabre si:** hay que transcribir el articulado completo de muchas normas (fase 4) y el HTML a mano deja de ser sostenible, o si el posicionamiento en buscadores pasa a importar. Entonces toca un generador estático, Astro o Eleventy, con GitHub Actions.

## D2 · Publicación desde `main` + `/docs`

**Por qué:** GitHub Pages solo sirve desde la raíz o desde `/docs`. Elegida `/docs` para no mezclar el sitio con los ficheros del repo, y sin Actions porque no hay build que ejecutar. Se configura una vez en Settings → Pages y no se vuelve a tocar.

**Consecuencia:** el `.gitignore` ignora todo salvo `docs/` y los `.md` de la raíz. Los scripts auxiliares no se versionan a propósito: son de un solo uso, porque después los datos se mantienen a mano.

## D3 · `normas.json` como fuente de verdad única

Ninguna norma se escribe directamente en el HTML.

**Por qué:** el contenido se consulta de varias maneras a la vez (por sección, buscando, por estado, desde la ficha de otra norma que la modifica). Duplicar los datos en cada vista garantiza que se desincronicen. Además permite validar las relaciones entre normas de forma automática, cosa que en HTML suelto es imposible.

Ver [MODELO-DATOS.md](MODELO-DATOS.md).

## D4 · Estado y relaciones como dato de primera clase

Cada norma lleva `estado` y las relaciones `modificadaPor`, `modifica` y `deroga`.

**Por qué:** es la aportación real frente a la web original. Allí las modificaciones se mencionan en prosa dentro del título del enlace, de modo que no se pueden filtrar, ni avisar, ni detectar incoherencias. Aquí una norma modificada se marca sola en todas las vistas donde aparezca.

## D5 · Escala de grises estricta

Sin color de acento. Estados diferenciados por tipografía, peso y filetes.

**Por qué:** es la sobriedad que pidió el mantenedor, y de paso resuelve la accesibilidad: la información no se pierde para quien no distingue colores, ni al imprimir en blanco y negro, que en un centro educativo pasa a menudo.

## D6 · Solo castellano

**Por qué:** la mitad de trabajo y de mantenimiento. El modelo de datos no impide añadir valenciano después, pero traducir desde el primer día duplicaría el coste de cada actualización sin que nadie lo haya pedido todavía.

## D7 · Se enlaza a los PDF oficiales, no se copian

**Por qué:** el DOGV y el BOE son la fuente auténtica y sus URL son estables. Alojar copias crearía versiones fantasma que quedarían desactualizadas en silencio tras una modificación, que es justo el problema que el sitio pretende resolver.

**Matiz:** la fase 4 transcribirá articulado a HTML para poder consultarlo sin abrir el PDF. Esas páginas son *ayuda a la lectura*, no texto auténtico: cada una debe enlazar de forma visible al PDF oficial y llevar fecha de última revisión.
