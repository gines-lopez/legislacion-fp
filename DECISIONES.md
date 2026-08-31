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

## D22 · El articulado se publica consolidado, y se dice que la consolidación es propia

La página de la Orden 8/2025 reproduce sus 20 artículos con los apartados 12.8 y 14.1.b en la redacción que les dio la Orden 5/2026, señalados con trazo doble y una nota que dice qué norma los cambió y desde cuándo.

**Por qué consolidar y no reproducir el original.** Porque el DOGV todavía no lo ha hecho. Su «versión vigente» de la Orden 8/2025 es la inicial de abril de 2025 —la propia API marca la disposición como pendiente de consolidar—, así que quien la consulte hoy leerá que a segundo se promociona «cuando se haya superado al menos el 80 % del total de las horas lectivas del primer curso», criterio que la Orden 5/2026 sustituyó por «todos los módulos de primero, salvo que lo pendiente no supere las 240 horas». Son dos reglas distintas, y la que el diario oficial ofrece como vigente es la que ya no se aplica.

**Y por qué decirlo con todas las letras.** Adelantarse al diario oficial es útil y es exactamente lo que este sitio puede aportar, pero deja de serlo en el momento en que se presenta como si fuera oficial. El aviso de la cabecera dice que la consolidación es propia, que el DOGV mantiene la redacción anterior y que ante cualquier duda manda lo publicado.

**Se reabre si:** el DOGV consolida. Entonces esta página deja de ser una aportación y pasa a ser una copia: habría que revisarla contra la consolidación oficial y decidir si sigue teniendo sentido mantenerla.

## D23 · Una sola página de articulado sirve para todas

`docs/norma/<id>.html` es un armazón sin contenido y `assets/js/norma.js` deduce de qué norma se trata a partir del nombre del fichero. Transcribir otra norma es escribir su JSON, copiar el HTML cambiándole el nombre y poner `texto: true` en `normas.json`.

**Por qué.** La fase 4 va a repetirse norma a norma durante años. Si cada página llevara su propio script o su contenido en el HTML, la vigésima sería inmantenible y ninguna se parecería a las demás. Así el coste de la siguiente es el de escribir los datos, que es donde está el trabajo de verdad.

**Coherente con D3:** el articulado es contenido y vive en `data/texto/`, no en el HTML.

## D24 · Un solo `h1` por vista, y es el asunto de lo que se está viendo

En el listado el `h1` es el título del sitio; en una ficha lo es la norma, y el título del sitio baja a párrafo sin cambiar de aspecto. La página de articulado ya lo hacía así.

**Por qué.** La ficha y el listado son la misma página y se cambia entre ellas sin recargar, así que el `h1` estático de la cabecera convivía con el de la norma: dos títulos de página. Quien navega saltando por encabezados —que es como se recorre un documento largo con lector de pantalla— se encontraba dos veces con el principio.

**Por qué el título del sitio baja a párrafo y no a `h2`.** Un `h2` ahí lo convertiría en el primer apartado de la ficha, que no es. Como párrafo sigue siendo la marca y deja de estar en el índice de encabezados.

## D25 · La hoja de impresión se compone sin fondos

En papel no se fuerza la impresión de fondos. Todo lo que en pantalla se distingue por relleno se distingue en papel por filete o por peso.

**Por qué.** Forzar los fondos gasta tóner de un centro educativo, que es exactamente el sitio donde se imprime esto. Y no forzarlos tiene una trampa que estuvo activa un tiempo: el chip de filtro activo y el botón de atajo son tinta plena con el texto en papel, así que sin fondo quedaban **en blanco sobre blanco**, invisibles. Ahora esos controles se ocultan o pasan a filete negro.

**Qué más cambia en papel:** los plegables se abren —una pregunta cerrada imprime su respuesta y su cita, que si no la hoja no sirve de nada—, el listado pasa a una columna, los laterales fijos dejan de serlo, los títulos recortados se imprimen enteros y ni una norma, artículo o respuesta se parte entre páginas. El trazo del margen sigue codificando la vigencia, y el estado y el ámbito están escritos además con palabras (D5).

**Se comprueba, no se supone:** las reglas de `@media print` se extraen de la hoja y se aplican como si fueran de pantalla para poder medirlas. Así se detectó el blanco sobre blanco.

## D26 · «Remite a» es una relación, y se declara por un solo lado

Las instrucciones de curso no modifican la Orden 8/2025 ni la derogan: se apoyan en ella y mandan aplicarla. Eso es un dato, y ahora es el campo `remiteA`.

**Por qué merecía un campo.** Hasta ahora esa dependencia solo se veía abriendo una de las dieciocho preguntas frecuentes que enlazan a su articulado. Quien mira la ficha de las instrucciones no puede adivinar que la mitad de lo que dicen sobre evaluar remite a otra norma, y citarlas sin ella es citarlas a medias. Es la misma razón de D4: si una relación no es dato, no se puede mostrar, ni filtrar, ni validar.

**Por qué va con nota y las otras cuatro no.** Ver una norma debajo de otra se lee como una reforma. «Remite a» es más floja que «modifica» y que «deroga», así que el rótulo no basta: la ficha dice con todas las letras que ni la modifica ni la deroga, que hay que leerlas juntas y que el alcance de cada remisión está en el articulado y en las preguntas. Coherente con «Lo que el modelo no captura» de [MODELO-DATOS.md](MODELO-DATOS.md).

**Por qué no exige simetría.** El invariante 3 obliga a declarar `modifica` ↔ `modificadaPor` por las dos puntas, porque las dos son afirmaciones jurídicas fuertes y conviene que alguien las escriba dos veces. Aquí no: el reverso —«Remiten a esta norma»— lo deriva la interfaz recorriendo el `remiteA` de las demás, igual que `derogadaPor` y que los anexos. Una norma muy citada acumularía media docena de líneas escritas a mano solo para no desincronizarse.

**Se reabre si:** hace falta distinguir *para qué* remite una norma a otra —evaluación, convalidaciones, formación en empresa—. Entonces el campo pasa de array de `id` a array de objetos con su motivo.

## D27 · El buscador entra en el articulado, y la unidad es el artículo

Buscar «promoción» encontraba la norma y las preguntas frecuentes, pero no el artículo 14, que es donde lo pone. Ahora el buscador de la portada indexa cada pieza de `data/texto/` por separado.

**Por qué la pieza y no la norma.** El artículo es lo que se cita: «el artículo 14 de la Orden 8/2025», no «la Orden 8/2025, por algún sitio». Indexar la norma entera devolvería siempre el mismo resultado —la norma— sin decir dónde mirar, que es exactamente lo que ya hacía y lo que había que arreglar. Los términos tienen que caer todos dentro de una misma pieza: dos palabras repartidas entre el artículo 3 y el 14 no son una coincidencia.

**El resultado se parece a lo que va a abrir.** Cada pieza encontrada llega con el mismo canal y el mismo trazo que tiene en la página del texto —sólido si está como se publicó, doble si una norma posterior la cambió—, y las modificadas dicen qué norma las cambió y desde cuándo. Es el aviso llegando antes de citar de memoria un artículo reformado, que es el daño que este sitio existe para evitar. Va después del bloque de respuestas y no antes: se lee de lo llano a lo literal, igual que cada respuesta lleva debajo la frase de la norma en que se apoya.

**Se resalta lo que distingue, no todo lo tecleado.** Marcar «a» y «la» dejaba el articulado entero subrayado: 3.623 marcas al buscar «atención a la diversidad». Se marcan solo los términos de más de dos letras, y si la búsqueda entera es de palabras cortas, entonces sí se marcan todas, porque entonces son lo que se ha ido a buscar.

**El articulado se carga después del primer pintado.** Es el único conjunto de datos que crece sin techo, y la portada no puede esperar a un texto que solo hace falta si se busca algo. Mientras no ha llegado, la interfaz no afirma nada sobre él: no dice «no hay artículos», dice solo lo que ya sabe. Si algún día hay veinte normas transcritas esto deja de bastar; está anotado en la fase 5 de [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md).

**Se reabre si:** el número de transcripciones hace que cargarlas todas se note. La salida es un índice pregenerado, que reabre D1 porque alguien tiene que generarlo, o cargar cada articulado solo cuando la búsqueda lo pida.

## D28 · El foco viaja a los encabezados, pero sin recuadro

Al cambiar de vista, el `h1` de la ficha recibe el foco; al saltar a un artículo desde el índice, lo recibe el artículo. Ninguno de los dos se dibuja con recuadro.

**Por qué el foco sí.** La ficha y el listado son la misma página y se cambia entre ellas sin recargar. Sin mover el foco, quien navega con teclado o con lector de pantalla se queda donde estaba mientras la página entera cambia debajo. Ver D20, que es el mismo problema con los saltos internos.

**Por qué el recuadro no.** Un recuadro de foco significa «esto se acciona»: es la señal de que lo que hay ahí responde al Intro. Un encabezado no responde a nada. Ponérselo promete una interacción que no existe y ensucia la cabecera con un rectángulo enorme cada vez que se abre una ficha. La regla de accesibilidad que exige indicador visible es para los controles operables con teclado; estos destinos no lo son, solo reciben el foco de paso.

**Dónde sí se mantiene:** en todo lo que se pulsa —enlaces, botones, chips, el resumen del índice—, sin tocar.

## D29 · Hay un tercer tipo de página: el esquema, que dibuja la norma en vez de reproducirla

`docs/esquema/<id>.html` desde `docs/data/esquema/<id>.json`. La primera es la de la Ley Orgánica 3/2022.

**Por qué no basta con transcribir el articulado.** La LO 3/2022 tiene 117 artículos y 25 disposiciones. Transcribirla daría una página perfectamente fiel en la que sigue siendo imposible ver lo único que hay que ver: que los cinco grados son **una escalera acumulable**, que todo el sistema cuelga de una sola definición —el estándar de competencia— y que los dos regímenes de dual se diferencian en tres cifras concretas. Eso está en la ley, repartido entre artículos que no se leen seguidos, y ninguna transcripción lo hace aparecer. El articulado sirve para comprobar; el esquema, para entender. Son dos trabajos distintos y ahora son dos páginas distintas.

**Por qué es más peligroso y qué se hace al respecto.** Un esquema interpreta, y lo que interpreta es lo que puede hacer daño: es el mismo riesgo que D18 identificó en las preguntas frecuentes, con la misma solución. Cada pieza dice de qué artículo sale y, en cuanto afirma una cifra o una regla —el 25 %, las 300 a 900 horas, los 2 o 3 cursos—, reproduce debajo la frase literal de la ley. Las citas del esquema de la LO 3/2022 se comprobaron una a una contra el XML del BOE antes de guardar el fichero, y el diagnóstico verifica que ninguna se quede sin artículo (invariante 12).

**Los tipos de bloque son un vocabulario, no un formato a medida.** `escalera`, `cadena`, `comparacion`, `mapa` y `corpus`. Están elegidos porque describen formas que se repiten en cualquier norma de ordenación —una secuencia acumulativa, un flujo, dos variantes contrastadas, una estructura, lo que la desarrolla—, no porque los pidiera esta ley. El esquema siguiente se escribe combinando los que le sirvan; si hace falta uno nuevo, se añade al vocabulario y queda disponible para los demás. Es D23 aplicado otra vez: el coste de la segunda página es el de escribir los datos.

**Se enlaza al BOE, no a una transcripción propia.** De esta ley no hay articulado transcrito, así que cada número de artículo lleva al texto consolidado oficial. Si algún día se transcribe, el esquema debería enlazar a la transcripción y la transcripción al esquema; hoy no hay nada que decidir porque no existe.

**Y el bloque `corpus` no se escribe.** Las normas de este listado que desarrollan la ley salen de la etiqueta, no de una lista a mano: al añadir una norma nueva con esa etiqueta aparece sola. Es D3 otra vez, y evita la lista de enlaces que se queda vieja en silencio.

**Se reabre si:** un esquema no cabe en el vocabulario de bloques sin retorcerlo, o si aparecen tantos esquemas que convenga poder buscar dentro de ellos, como ya se hace con el articulado (D27).
