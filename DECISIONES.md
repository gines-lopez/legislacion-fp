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

## D8 · La sección de anexos recoge los impresos vigentes, no los enlaces de la fuente

Los cuatro «Anexos más frecuentes» que enlaza la web del CEICE (VII, IX, X y XIII) responden 301 hacia `webinterna2.gva.es`, un servidor interno: no son accesibles desde fuera de la red de la Generalitat. Además son PDF sueltos sin norma ni fecha identificable, y `fecha` es obligatorio.

La sección `anexos` recoge, en su lugar, los anexos I a IV de la Resolución de instrucciones del curso en vigor: son los impresos que el centro debe usar realmente, tienen fecha y su enlace funciona.

**Consecuencia:** se pierden los modelos de exención de FCT y de aplazamiento de calificación de FCT, que no tienen equivalente en las instrucciones actuales. Y como los anexos se republican con las instrucciones cada curso, sus `id` no llevan año (`anexo-anulacion-matricula`, no `anexo-anulacion-matricula-2026`): al cambiar de curso se actualizan `fecha` y `enlaces`, igual que en `curso-actual`.

**Se reabre si:** la Generalitat arregla los enlaces de la carpeta original, o publica los impresos en una ubicación estable e independiente de las instrucciones anuales.

## D9 · Dos enlaces por norma del DOGV: ficha y PDF

La ficha por signatura (`resultat-dogv?signatura=…`) es estable y ofrece el documento en ambas lenguas; el PDF de `dogv.gva.es/datos/…` abre directamente. Se ponen los dos. Del BOE se enlaza la versión consolidada (`/con`), que es la que refleja las modificaciones.

**Cuidado al verificar:** ninguno de los dos diarios devuelve 404 cuando el documento no existe. La ficha del DOGV es una aplicación de JavaScript que sirve siempre su armazón con estado 200, y el BOE sirve su página de error con estado 200. Comprobar el código de respuesta no vale: hay que descargar el PDF y comprobar que su cabecera CVE coincide con la signatura, o leer el `<title>` de la página del BOE.
