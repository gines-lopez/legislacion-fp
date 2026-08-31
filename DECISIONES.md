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

## D10 · El ámbito se muestra como procedencia, junto al diario que lo publica

Cada norma abre con una línea de procedencia sobre su identificador: `ESTATAL · BOE`, `AUTONÓMICO · DOGV` o `AUTONÓMICO · CEICE`.

**Por qué así y no una etiqueta suelta.** «Estatal» y «autonómico» a secas obligan a fiarse del sitio. Acompañarlo del diario lo vuelve comprobable de un vistazo, y es además el vocabulario del profesorado, que dice «salió en el DOGV», no «es autonómica». Los cuatro documentos que la conselleria difunde sin publicar en diario dicen `CEICE`, que es exactamente lo que son.

**Por qué no toca el filete.** El filete izquierdo ya codifica la vigencia, y meterle un segundo eje lo haría ilegible. El ámbito va en la monoespaciada tenue, a 11 px, por debajo del identificador: se lee al escanear, no compite. Coherente con D5, la distinción la hace la palabra, no el color ni el peso; ninguno de los dos ámbitos se presenta como superior al otro.

**El diario se deriva del dominio del primer enlace**, no de la etiqueta, porque las etiquetas varían (`DOGV`, `PDF del DOGV`, `DOGV · versión consolidada`) y el dominio no.

**Se reabre si:** aparece una norma autonómica publicada en un diario distinto del DOGV, o el sitio incorpora normativa de otra comunidad.

## D11 · La ficha vive en la misma página y la URL lleva la norma

Al pulsar una norma, el listado se sustituye por su ficha y la dirección pasa a ser `…/legislacion-fp/?n=decreto-114-2025`. Ni marco flotante ni despliegue: es una vista con su propia URL, su propio título de pestaña y el botón atrás del navegador funcionando.

**Por qué no páginas HTML por norma.** Generarlas duplicaría los datos fuera de `normas.json` y habría que regenerarlas a mano tras cada edición. Es exactamente la desincronización que D3 evita, y sin *build* (D1) nadie garantiza que se regeneren.

**Por qué la URL de la ficha va limpia.** `?n=<id>` y nada más: es lo que se pega en un correo o en un grupo del claustro. Los filtros desde los que se llegó se recuerdan en memoria para el botón «Volver al listado», no en la barra de direcciones. En el listado, en cambio, el estado entero sí va a la URL (`?q=`, `?seccion=`, `?ambito=`, `?estado=`, `?etiqueta=`), de modo que «todas las derogadas» también es un enlace.

**Consecuencia:** el `id` de una norma es una URL pública. MODELO-DATOS.md ya decía que no se renombra; a partir de ahora renombrarlo además rompe enlaces de terceros.

**Se reabre si:** el posicionamiento en buscadores pasa a importar, o la fase 4 acaba generando tantas páginas de articulado que ya haya un generador en marcha y salga gratis.

## D12 · El listado no enlaza al diario oficial; la ficha sí

En el listado, cada norma muestra procedencia, identificador, fecha, estado, título y resumen, pero ningún enlace al DOGV o al BOE. Para llegar al texto oficial hay que entrar en la ficha.

**Por qué.** Un clic de más a cambio de que nadie cite una norma sin haber visto antes qué la modifica o qué la deroga. El listado enseña *que* una norma fue reformada; la ficha enseña *hasta dónde*, con el resumen de cada norma relacionada delante. Saltar del listado al PDF se salta justamente lo que este sitio aporta.

**Cuando se llega al enlace, se abre en ventana nueva**, para no perder la consulta. Todos los enlaces externos llevan el signo `↗` y un texto oculto que lo advierte a los lectores de pantalla.

## D13 · El listado ocupa la pantalla; la ficha se queda en la medida de lectura

A partir de 60 rem, las normas fluyen en columnas de periódico (`columns: 23rem`) y ocupan todo el ancho disponible. La ficha no: se queda en la medida de 34 rem.

**Por qué.** Son dos tareas distintas. El listado se escanea, y ahí el ancho es capacidad: más normas a la vista, menos desplazamiento. La ficha se lee, y una línea de mil píxeles de prosa jurídica no se lee.

**Por qué columnas y no rejilla.** La regla de vigencia solo es continua si las normas se apilan sin hueco. En columnas cada una arrastra su propia regla; en una rejilla el filete se rompería en cada tarjeta y el código dejaría de leerse de un vistazo. Además el orden en columnas es hacia abajo y luego a la derecha, que es como se lee un sumario y respeta el orden por rango normativo.

## D14 · Los metadatos y los recursos no normativos van en ficheros propios

`docs/data/meta.json` guarda la fecha de última revisión y la referencia a la fuente. `docs/data/recursos.json` guarda lo que la conselleria publica junto a las normas pero no es norma.

**Por qué no dentro de `normas.json`.** Un recurso no tiene fecha de disposición, ni estado de vigencia, ni se cita: metido en el array rompería los invariantes 4 y 6 y obligaría a llenar campos con valores falsos. Y la fecha de revisión es del corpus entero, no de ninguna norma.

**Por qué no escritos en el HTML.** Son contenido, y D3 dice que el contenido no se escribe en el HTML. La fecha de revisión escrita a mano en `index.html` es la que se olvida de actualizar.

## D15 · El texto de una norma derogada no se atenúa

La versión provisional de la fase 1 pintaba las derogadas en tono tenue. Ya no: solo cambia el trazo del filete, y la palabra «Derogada» lo dice.

**Por qué.** Atenuar es decir «esto importa menos», y no es verdad. El RD 1147/2011 está derogado y los títulos expedidos a su amparo conservan su equivalencia; sus normas se siguen citando. La ficha de una derogada lo advierte explícitamente y remite al resumen, que es donde está el alcance.

**Coherente con D5:** dentro de la escala de grises, la señal más fuerte disponible es la inversión completa —tinta plena con texto en papel—, y ahí es donde se gasta: en el chip de filtro activo. No en degradar contenido.
