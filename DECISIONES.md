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

## D16 · Los anexos son parte de la norma que los publica, no normas sueltas

Los cuatro anexos de la Resolución de instrucciones de curso llevan `parteDe: "resolucion-2026-07-16"`. La ficha de la resolución los lista con su nombre y su resumen; la ficha de cada anexo declara de quién es parte y advierte de que no se cita por separado.

**Por qué.** Los cuatro apuntan literalmente al mismo PDF que su resolución: no son documentos distintos, son apartados de uno solo. Presentarlos como normas independientes invita a citar «el Anexo III» sin decir de qué norma, que es una cita inútil, y a no enterarse de que se renuevan enteros cada curso con las instrucciones (ver D8).

**Siguen apareciendo en el listado**, en la sección `anexos`, porque el profesorado los busca por lo que hacen —«el impreso de renuncia de convocatorias»— y no por la norma que los contiene. Lo que cambia es que ahí se lee «Parte de RESOLUCIÓN DE 16 DE JULIO DE 2026», y en la madre, «Incluye 4 anexos».

**Se reabre si:** aparece un anexo con vida propia, publicado y modificado por separado de la norma que lo aprobó. Entonces deja de ser parte y pasa a ser norma con relaciones.

## D17 · Verde y rojo, solo en la página de diagnóstico

`--ok` y `--fallo` son los dos únicos colores del proyecto y solo se usan en `diagnostico.html`.

**Por qué no contradice D5.** D5 protege la consulta de normativa: el estado de vigencia de una norma no puede depender del color, porque se imprime en blanco y negro y porque hay quien no lo distingue. El diagnóstico no es normativa: es una herramienta de mantenimiento que se mira en pantalla, donde verde y rojo son el vocabulario que todo el mundo lee sin pensar.

**Y aun ahí no depende del color:** cada línea lleva delante su ✓ o su ✗, y el fallo va además en negrita. Los cuatro tonos superan 6,7:1 sobre su fondo en los dos temas.

## D18 · Las preguntas frecuentes son datos, y ninguna respuesta va sin la cita que la sostiene

La consulta de una norma vive en `docs/data/consulta/<id>.json` y la ficha la pinta. Cada pregunta lleva cuatro cosas: el enunciado tal y como lo formularía quien consulta, una respuesta en lenguaje llano, el epígrafe del que sale y **la frase literal de la norma** en que se apoya.

**Por qué la cita es obligatoria y no opcional.** El resto del sitio enlaza y no interpreta; una FAQ sí interpreta, y esa es exactamente la parte que puede hacer daño. Poner la frase original debajo convierte cada respuesta en algo comprobable en un vistazo: quien tenga que defenderla ante la inspección, ante la dirección o ante una familia tiene el texto delante, y quien crea que la respuesta está mal puede demostrarlo sin abrir el PDF.

**Por qué en JSON y no en HTML.** Es contenido, y D3 dice que el contenido no se escribe en el HTML. Además así el buscador de la portada las alcanza: se busca «renuncia de convocatoria» y sale la respuesta, no solo la norma que la contiene.

**La literalidad se verifica, no se supone.** Las 50 preguntas de la Resolución de 16 de julio de 2026 se redactaron contra el texto extraído del PDF oficial y las 50 citas se comprobaron una a una contra él antes de guardar el fichero. El procedimiento está en [MODELO-DATOS.md](MODELO-DATOS.md).

**Consecuencia de mantenimiento:** las instrucciones de curso se republican cada año. Cuando llegue la resolución del curso siguiente, la FAQ **no se hereda**: se rehace contra el texto nuevo, porque los epígrafes se renumeran y las cifras cambian. Hasta entonces, `revisado` dice contra qué versión se escribió.

**Se reabre si:** aparece una norma cuya FAQ no quepa en un solo fichero, o si hace falta que las preguntas de varias normas se busquen entre sí, que hoy no hace falta porque solo hay una.

## D19 · El script lleva versión y el diagnóstico detecta si el navegador usa una vieja

`app.js` declara `const VERSION` y la expone en `window.legislacionFP.version`. La página de diagnóstico compara esa versión con la del fichero que el servidor entrega en ese momento, pedido sin caché, y avisa si no coinciden.

**Por qué hace falta.** GitHub Pages sirve los assets con `cache-control: max-age=600`. Tras publicar hay una ventana de diez minutos en la que un navegador puede estar ejecutando el `app.js` anterior contra el HTML nuevo. Eso no se parece a un problema de caché: se parece a que el sitio está roto. Pasó de verdad entre v0.2 y v0.3 —las preguntas frecuentes ya estaban, el arreglo de las anclas no— y el síntoma fue que pulsar un tema repintaba la ficha y te mandaba al principio.

**Consecuencia de mantenimiento:** hay que subir `VERSION` a mano en cada publicación. Es una línea, y es lo que hace que la comprobación sirva de algo.

**Por qué no se versionan las URL de los assets** (`app.js?v=4`), que evitaría el problema en vez de detectarlo: obliga a tocar dos ficheros en cada cambio y a acordarse siempre; olvidarlo da falsa seguridad, mientras que el diagnóstico dice la verdad aunque nadie se acuerde de nada. Se reabre si el sitio pasa a publicarse a menudo.

## D20 · Los saltos dentro de la página los resuelve el script, no el ancla

El índice de temas de las preguntas frecuentes y el enlace de saltar al contenido se atienden con un manejador propio, antes que el enrutador: se desplaza al destino, se le lleva el foco y el fragmento se escribe con `replaceState`.

**Por qué no dejar el comportamiento nativo.** Cada salto nativo deja una entrada en el historial; con ocho temas, volver atrás obliga a pulsar ocho veces, y cada vuelta hace que el enrutador repinte la ficha entera y la devuelva al principio. Con `replaceState` no se añade ninguna entrada: comprobado, ocho saltos y cero entradas nuevas.

**Y el foco viaja con el salto.** El comportamiento nativo mueve la vista pero deja el foco donde estaba, así que quien navega con teclado o con lector de pantalla sigue en el índice mientras la página está en otro sitio. Ahora el destino recibe `tabindex="-1"` y el foco.

## D21 · Las relaciones entre normas se toman del análisis jurídico del DOGV, no del preámbulo

Antes de declarar que una norma deroga o modifica a otra se consulta la API del portal del DOGV:

```
/dogv-portal/dogv/obtenerIdDogv/<AAAA-NNNNN>          → identificador interno
/dogv-portal/disposicion/<id>?lang=es_es              → título, fechas, organismo
/dogv-portal/disposicion/<id>/analisisJuridico?…      → qué afecta y qué la afecta
```

**Por qué.** Hasta ahora las relaciones se deducían leyendo el preámbulo y las disposiciones derogatorias, que es lento y falible: así se estuvo a punto de anotar que la Orden 8/2025 tocaba la Orden 78/2010 cuando lo que deroga es la 79/2010, que es otra norma distinta publicada tres días después. El análisis jurídico lo dice el propio diario, en los dos sentidos, y de paso avisa de afectaciones que el preámbulo no menciona.

**No sustituye a D9.** La API confirma que la disposición existe y qué relaciones tiene, pero el documento se descarga igual y se comprueba que su cabecera CVE coincide con la signatura. Son dos cosas distintas: que el dato exista en el portal y que el enlace que se publica aquí lleve al documento correcto.

**Lo que la API no da:** el *alcance*. Dice «Deroga», nunca «deroga salvo para los ciclos LOGSE, que siguen rigiéndose por ella». Ese matiz sigue saliendo de leer la norma y sigue viviendo en el `resumen`. Ver «Lo que el modelo no captura» en [MODELO-DATOS.md](MODELO-DATOS.md).
