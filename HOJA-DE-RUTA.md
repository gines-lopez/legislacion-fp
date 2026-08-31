# Hoja de ruta

Estado a 31 de agosto de 2026.

## Fase 0 · Documentación — hecha

CLAUDE.md, [DECISIONES.md](DECISIONES.md), [MODELO-DATOS.md](MODELO-DATOS.md) y este fichero. `.gitignore` protegiendo `docs/`.

## Fase 1 · Esqueleto y despliegue — hecha

`docs/` con `index.html`, `.nojekyll`, `assets/css/base.css`, `assets/js/app.js` y dos normas semilla en `data/normas.json`.

La portada provisional es un **diagnóstico de despliegue**: comprueba en el propio navegador que cargan la hoja de estilos, el script y los datos, y muestra la ruta con la que ha resuelto el JSON. Si algo falla al publicar, se ve en la página en vez de en la consola. Se sustituye por el buscador en la fase 3.

Verificado en local sirviendo bajo un subpath, que es la única forma de detectar el fallo de rutas absolutas: las cuatro comprobaciones en verde, contraste AA en claro (mínimo 5,07:1) y oscuro (mínimo 5,6:1), y sin desbordamiento horizontal a 375 px.

Publicado en https://gines-lopez.github.io/legislacion-fp y comprobado en producción: las cuatro comprobaciones en verde, 36 normas cargadas y la ruta resuelta como `/legislacion-fp/data/normas.json`, que es lo que confirma que ninguna ruta interna es absoluta.

## Fase 2 · Datos — hecha

`docs/data/normas.json` contiene **40 normas** volcadas de las seis secciones de la web del CEICE, con los seis invariantes de [MODELO-DATOS.md](MODELO-DATOS.md) comprobados y las 58 URL verificadas una a una (código 200 y tipo de contenido esperado).

| Sección | Normas |
|---|---|
| `ordenacion-academica` | 23 |
| `curso-actual` | 4 |
| `desdobles` | 3 |
| `anexos` | 5 |
| `optatividad` | 1 |
| `cursos-anteriores` | 4 |

Cada norma del DOGV lleva dos enlaces: la ficha por signatura (estable, bilingüe) y el PDF directo. Las del BOE, la versión consolidada. **Todas las signaturas se verificaron descargando el PDF correspondiente y comprobando que su cabecera CVE coincide**, porque `resultat-dogv?signatura=…` devuelve 200 incluso con una signatura inexistente: es una aplicación de JavaScript que monta el documento después de cargar. El mismo cuidado hace falta con el BOE, que sirve su página de error 404 con estado HTTP 200 (así se colaron cuatro `…/con` inexistentes que hubo que corregir: los RD 497 a 500/2024 no tienen versión consolidada).

### Lo que el volcado corrige respecto de la fuente

Es la aportación real del sitio, y sale de leer las normas, no de la web original:

- **El RD 1147/2011 está derogado.** El BOE lo marca como disposición derogada; lo deroga el apartado 2 de la disposición derogatoria única del RD 659/2023. La web del CEICE lo sigue presentando como «de aplicación a ciclos LOE».
- **La cadena de instrucciones de curso es explícita.** Cada resolución anual deja sin efecto la anterior, salvo la de 2024-2025, que solo prorrogó la de 2023-2024 para los segundos cursos; por eso la de 2025-2026 tuvo que dejar sin efectos las dos. Las cuatro de `cursos-anteriores` quedan como `derogada`.
- **Los desdobles son una modificación, no una derogación.** La resolución de 19 de junio de 2023 deja sin efecto *el anexo* de la de 2 de diciembre de 2022, no su articulado: el mecanismo de actualización sigue siendo el de 2022. De ahí `modificada` y no `derogada`.
- **El Decreto 95/2026 modifica dos decretos, no uno.** El 114/2025 y el 117/2025. La semilla solo declaraba el primero.
- **El Decreto 117/2025 no deroga el 135/2014.** Deroga los decretos de currículo de grado básico (185/2014, 23/2022 y 67/2024); la ordenación del 135/2014 sigue en pie mientras queden ciclos LOE en extinción.

También se completaron los títulos oficiales de las dos normas semilla, que estaban abreviados.

### Enlaces rotos en la fuente

Los cuatro «Anexos más frecuentes» del CEICE (anexos VII, IX, X y XIII) responden **301 hacia `webinterna2.gva.es`**, un servidor interno inaccesible desde fuera de la red de la Generalitat. El fallo es específico de esa carpeta de documentos; el resto de PDF alojados en `ceice.gva.es` funcionan. La sección `anexos` se ha modelado, por decisión del mantenedor, con los anexos I a IV de la Resolución de 16 de julio de 2026, que son los impresos realmente vigentes y sí tienen fecha y enlace válido (ver D8 en [DECISIONES.md](DECISIONES.md)).

### Fuera del volcado

- **«Secuenciación y horarios».** Es una página web de la conselleria, no una norma: no tiene fecha ni encaja en ningún valor de `tipo`. Si interesa, la fase 3 puede añadir un bloque de recursos aparte del listado de normas.
- **Formulario de alegaciones de optatividad.** Apunta a `forms.edu.gva.es`, dominio fuera de los admitidos por el invariante 6, y correspondía a un plazo ya cerrado. Los tres listados de propuestas sí están, como enlaces de las instrucciones de optatividad.
- **El apéndice de familias profesionales** con las equivalencias LOGSE→LOE, como estaba previsto. Tiene estructura de tabla de correspondencias y entra como sección aparte más adelante.

### Qué conviene vigilar

- Las **instrucciones de optatividad** son las del curso 2025-2026 y así lo dice su resumen. La web del CEICE no ha publicado las de 2026-2027; cuando aparezcan, sustituyen a estas.
- La **Orden 78/2010** figura como `vigente` porque nada consultado la deroga expresamente, pero conviene revisarla cuando se incorpore la Orden 8/2025 de evaluación, que sí tocó la Orden 79/2010.
- La **Resolución de 26 de abril de 2023** de cursos de especialización queda `vigente`: el Decreto 95/2026 solo lleva cláusula derogatoria genérica, que no basta para marcarla derogada.

## Fase 3 · Interfaz — cerrada

La portada de diagnóstico se sustituyó por la herramienta de consulta. Esta sección se reescribió al cerrar la fase, porque había quedado congelada mientras el proyecto seguía y afirmaba seis cosas que ya no eran ciertas: en un sitio cuyo argumento es que la documentación desactualizada hace daño, eso no es un detalle.

### Qué hace

**Buscador instantáneo.** Sobre identificador, título, resumen y materias, además de sección, ámbito y estado traducidos, de modo que escribir «derogada» encuentra lo mismo que el chip. Insensible a tildes y a mayúsculas, con varios términos en conjunción, y resaltando las coincidencias sobre el texto original: se busca «especializacion» y se marca «especialización». Alcanza también las preguntas frecuentes: al buscar «exención» no sale ninguna norma pero sí cuatro respuestas, y el aviso de «sin resultados» lo dice en vez de fingir que no hay nada.

**Filtros de sección, ámbito y estado**, en chips con recuento vivo. El recuento de cada opción cuenta ya con lo filtrado en los otros ejes, así que los callejones sin salida se ven antes de entrar. Las materias filtran también, desde la ficha.

**Ficha de norma** en `?n=<id>`, con las relaciones agrupadas por verbo —derogada por, modificada por, deroga, modifica— y **cada norma relacionada acompañada de su propio resumen**, que es donde se dice hasta dónde llega la relación. Lleva los enlaces al diario, las materias, la sección, la cita copiable y, si la norma tiene anexos, la lista de sus partes.

**Estado en la URL.** `?q=`, `?seccion=`, `?ambito=`, `?estado=`, `?etiqueta=`, `?n=` y `?p=`, de modo que cualquier consulta es un enlace pegable. El botón atrás funciona y al volver de una ficha se recupera la posición del listado y se realza la norma de la que se venía.

**Atajo a las instrucciones del curso** en la cabecera, deducido de los datos —sección «curso actual», etiqueta `instrucciones-curso`, la más reciente— para que al rotar de curso siga solo.

### El aparato visual

La página se organiza sobre un canal izquierdo por el que corre **una regla vertical continua** que atraviesa cada sección y cambia de trazo norma a norma: sólido vigente, doble modificada, punteado derogada. En pantallas anchas el listado ocupa la pantalla y las normas fluyen en columnas de periódico, cada una con su propia regla; la ficha se queda centrada en medida de lectura.

Los chips de estado llevan una muestra del trazo idéntica a la del listado, así que **el filtro hace de leyenda**. Sin color (D5): el chip activo se distingue por inversión completa.

### Estado al cerrar

| | |
|---|---|
| Normas | 40 · 23 / 4 / 3 / 5 / 1 / 4 por sección |
| Estados | 29 vigentes, 5 modificadas, 6 derogadas |
| Ámbito | 32 autonómicas, 8 estatales |
| Ficheros en `docs/` | 13 |
| Comprobaciones del diagnóstico | 10, todas en verde |

El diagnóstico valida además el modelo: los invariantes 1 a 5 y del 8 al 10 de [MODELO-DATOS.md](MODELO-DATOS.md), los ficheros de consulta y de articulado, y si el navegador está ejecutando una versión del script anterior a la publicada.

### Comprobado

- **Contraste AA en los dos temas**, mínimo 4,52:1 sobre nueve combinaciones. El filete de los chips se subió de 1,4:1 a 5,07:1 por ser un control que se pulsa.
- **Sin desbordamiento horizontal** a 375, 900, 1280 y 1440 px.
- **Recuentos correctos** contra los datos, y facetas que se deshabilitan al quedar a cero.
- **Navegación:** ficha, vuelta con posición y realce, botón atrás, filtro por materia, anclas sin ensuciar el historial y enlaces externos con `rel="noopener noreferrer"`.

### Lo que se arregló al cerrarla

Tres cosas que habían quedado sueltas y que salieron de auditar la fase contra lo que realmente había:

1. **Dos `<h1>` en la ficha.** El título del sitio y el identificador de la norma competían, así que quien navega saltando por encabezados encontraba dos títulos de página. Ahora el `h1` es el asunto de la vista: en el listado, el título del sitio; en una ficha, la norma, y el título del sitio baja a párrafo sin cambiar de aspecto.

2. **El bloque de impresión se había quedado en la fase 3** y no conocía nada de lo añadido después. Tenía un fallo silencioso: el chip de filtro activo y el botón de atajo son tinta plena con texto en papel, y como los navegadores no imprimen fondos, salían **en blanco sobre blanco**. Se reescribió entero, comprobándolo: ahora esos controles se ocultan o pasan a filete negro, los plegables se abren —una pregunta cerrada imprime su respuesta y su cita—, el listado va a una columna, los laterales fijos dejan de serlo y nada se parte a mitad. D5 justifica la escala de grises por la impresión en blanco y negro en los centros; hasta ahora la hoja contradecía su propio porqué.

3. **Esta sección**, que afirmaba tres ficheros, 36 normas, siete diagnósticos e invariantes 1 a 5.

### Decisiones

D11 a D15 durante la fase; D19 a D21 después. Ver [DECISIONES.md](DECISIONES.md).

### Lo que queda fuera a propósito

- **El apéndice de familias profesionales** con las equivalencias LOGSE→LOE, que entra como sección aparte.
- **Valenciano** (D6) y **posicionamiento en buscadores**: sin JavaScript no hay listado, solo la cabecera, el aviso legal y un enlace a la fuente.

## Fase 4 · Páginas de consulta — empezada

La primera es la **Resolución de 16 de julio de 2026**, las instrucciones de inicio de curso: 41 páginas y 24.346 palabras, el documento de trabajo diario del profesorado y el que más se consulta.

En vez de transcribir el articulado, se ha resuelto como **50 preguntas frecuentes** dentro de su propia ficha, en `docs/data/consulta/resolucion-2026-07-16.json`. Cada una lleva la pregunta tal y como se formula de verdad, una respuesta en lenguaje llano, el epígrafe del que sale y **la frase literal de la norma en que se apoya**. Ver D18 en [DECISIONES.md](DECISIONES.md).

| Tema | Preguntas |
|---|---|
| Matrícula, anulación y faltas | 9 |
| Evaluación, promoción y calificaciones | 11 |
| Convocatorias | 7 |
| Titulación | 1 |
| Convalidaciones | 5 |
| Formación en empresa | 12 |
| Profesorado | 3 |
| Alumnado | 2 |

Cubren 31 epígrafes distintos de los 99 del documento. El reparto no es proporcional a la extensión, sino a lo que se consulta: el apartado 17, «Profesorado», es de los más largos y se lleva tres preguntas, mientras que la formación en empresa se lleva doce.

**Verificado:** las 50 citas se comprobaron una a una contra el texto extraído del PDF del DOGV antes de guardar el fichero, quitando antes la maquetación del diario, que se cuela en mitad de las frases al cruzar página. Ninguna respuesta se apoya en una frase que no esté publicada.

**En la interfaz:** las preguntas se despliegan con `<details>`, agrupadas por tema y con un índice para saltar; cada una tiene su propia URL (`?n=resolucion-2026-07-16&p=exencion-experiencia`), que se puede pegar en un correo y abre esa respuesta. El buscador de la portada las alcanza: al buscar «exención» no sale ninguna norma, pero sí cuatro respuestas, y el mensaje lo dice.

La portada lleva además un **atajo directo** a la ficha de las instrucciones del curso en vigor, deducido de los datos —sección «curso actual», etiqueta `instrucciones-curso`, la más reciente— para que al rotar de curso siga solo.

### Qué toca después

- **Rehacer la FAQ cuando salga la resolución del curso 2027-2028.** No se hereda: los epígrafes se renumeran y las cifras cambian. Ver D18.
- **Más normas con consulta,** a demanda. El mecanismo ya está: basta `consulta: true` en la norma y su fichero en `docs/data/consulta/`.
- **El apéndice de familias profesionales** con las equivalencias LOGSE→LOE, como sección aparte.

### Añadido de paso

El **Anexo V** de la Resolución, que estaba en el PDF y no en los datos: la relación centro a centro de ciclos y cursos de especialización de nueva implantación en 2026-2027. Va en `anexos`, junto a los otros cuatro, con `parteDe` apuntando a su resolución. No es un impreso como los anexos I a IV, sino un listado informativo, y su resumen lo dice. El corpus pasa de 36 a 37 normas.

### Las tres normas de evaluación

Añadidas la **Orden 8/2025**, de 22 de abril, de evaluación, y la **Orden 5/2026**, de 1 de abril, que la modifica. Con ellas entra una tercera que no se pidió pero que hacía falta para poder declarar la relación: la **Orden 79/2010**, a la que la Orden 8/2025 deroga. El corpus pasa de 37 a 40 normas.

La Orden 5/2026 toca dos artículos y nada más: el 12.8, sobre el carácter informativo de las calificaciones parciales, y el 14.1.b, que fija en 240 horas el máximo de módulos pendientes de primero con el que se puede cursar segundo. Es, por cierto, la redacción que cita la pregunta sobre promoción de las preguntas frecuentes.

La Orden 79/2010 entra como `derogada`, pero su resumen advierte de lo que el estado no puede decir: las disposiciones transitoria y derogatoria de la Orden 8/2025 la mantienen aplicable a los ciclos LOGSE mientras queden en extinción, y las instrucciones de curso siguen remitiendo a ella. Es el caso de manual de por qué el `resumen` es obligatorio.

**Duda pendiente, resuelta.** La fase 2 dejó anotado que convenía revisar la Orden 78/2010 al incorporar la de evaluación. Ya está comprobado: **nadie la deroga**. Lo que la Orden 8/2025 deroga es la Orden 79/2010, que es otra. La 78/2010 sigue vigente, aunque la modificaron la Orden 33/2011 y el Decreto 193/2021, que no están en este listado; su resumen ahora lo dice y remite a la versión consolidada.

### Cómo se verificaron

El portal del DOGV tiene una API que hasta ahora no se estaba usando y que ahorra trabajo y evita errores:

| Petición | Qué da |
|---|---|
| `/dogv-portal/dogv/obtenerIdDogv/<AAAA-NNNNN>` | El identificador interno de la disposición |
| `/dogv-portal/disposicion/<id>?lang=es_es` | Título oficial, fecha de disposición, fecha y número de DOGV, organismo |
| `/dogv-portal/disposicion/<id>/analisisJuridico?lang=es_es` | **Qué deroga y qué modifica, y quién la deroga y la modifica a ella** |

El `analisisJuridico` es lo importante: da las relaciones dichas por el propio diario, en vez de deducidas leyendo el preámbulo. Es de donde salen las tres relaciones nuevas y la respuesta sobre la Orden 78/2010.

Aun así se mantiene la comprobación de D9: los tres PDF se descargaron y se confirmó que su cabecera CVE coincide con la signatura. Que la API responda no basta.

### La página de la Orden 8/2025

Primera transcripción de articulado: **20 artículos y 6 disposiciones, 174 párrafos**, en `docs/norma/orden-8-2025.html` desde `docs/data/texto/orden-8-2025.json`. Cada pieza tiene su ancla (`#articulo-14`), el índice es navegable y se pliega en móvil, y la ficha de la norma la enlaza desde «Texto oficial» advirtiendo de que es transcripción, no texto auténtico.

**Lo que se descubrió al hacerla, y que es la razón de que valga la pena.** El DOGV no ha consolidado la Orden 5/2026: su «versión vigente» de la Orden 8/2025 es la inicial de abril de 2025.

| Artículo 14.1.b · promoción a segundo en grado medio y superior | |
|---|---|
| Lo que el DOGV da como vigente | «cuando se haya superado al menos el 80 % del total de las horas lectivas del primer curso» |
| Lo que se aplica desde el 8 de abril de 2026 | «deberá superar todos los módulos de primer curso… salvo que lo pendiente no supere las 240 horas» |

Quien consulte el texto consolidado oficial aplicará hoy un criterio de promoción derogado. Lo mismo, más leve, en el 12.8, al que le falta que las calificaciones parciales son «informativas». La página publica la redacción vigente, la marca con trazo doble —el mismo signo que «modificada» en el listado— y avisa en cabecera de que la consolidación es propia. Ver D22.

**Verificado:** los 174 párrafos aparecen literalmente en su PDF de origen; los dos modificados, en el PDF de la Orden 5/2026. Es el invariante 10 de [MODELO-DATOS.md](MODELO-DATOS.md).

**Circuito cerrado con la FAQ:** 18 de las 50 preguntas se apoyan en la Orden 8/2025 y ahora enlazan a su artículo concreto. La pregunta sobre promoción lleva al artículo 14, que está señalado como modificado.

**Cómo se llega.** Estaba mal resuelto: el articulado solo era alcanzable entrando en la ficha y mirando en la columna lateral, así que desde el listado no había forma de saber que existía. Ahora hay tres entradas: la tarjeta del listado lo anuncia («Leer el texto completo aquí»), la ficha lo ofrece en el cuerpo principal justo debajo del resumen —que es donde se decide si hace falta el texto— y las 18 preguntas de la FAQ que se apoyan en esta orden llevan a su artículo.

**Lo que todavía no llega:** el buscador de la portada no mira dentro del articulado. Buscar «promoción» encuentra la norma y las preguntas, pero no el artículo 14. Si se transcriben más normas, esto pasará a ser el hueco principal.

**La siguiente transcripción cuesta poco:** escribir su JSON, copiar el HTML con otro nombre y poner `texto: true` en la norma. El script deduce de cuál se trata por el nombre del fichero (D23).

### El buscador ya entra en el articulado

Era el hueco que la propia fase se había anotado: buscar «promoción» encontraba la norma y las preguntas, pero no el artículo 14, que es donde lo pone. Ya no.

**La unidad de búsqueda es el artículo,** no la norma: es lo que se cita, así que es lo que se encuentra. Los términos tienen que caer todos dentro de la misma pieza —dos palabras repartidas entre el artículo 3 y el 14 no son una coincidencia—, igual que en una norma o en una pregunta. El identificador de la norma se queda fuera de ese índice a propósito: si entrara, buscar «orden» devolvería los veintiséis artículos de la Orden 8/2025 sin que ninguno tenga que ver.

**El resultado se parece a lo que va a abrir.** Cada pieza encontrada llega con el mismo canal y el mismo trazo que tiene en la página del texto: sólido si está como se publicó, doble si una norma posterior la cambió. Así el aviso llega antes de citar de memoria un artículo reformado, que es justo el error que este sitio existe para evitar. Debajo va el párrafo donde cae la búsqueda, recortado alrededor de la coincidencia.

**Y el resaltado viaja con el enlace.** Se abre el artículo con `?q=` y las coincidencias marcadas, porque caer en un artículo de veintidós párrafos sin saber dónde está lo que buscabas no resuelve nada. La cabecera dice qué se está resaltando y ofrece quitarlo.

Dos cosas que se descubrieron al probarlo, y que son la razón de haberlo probado:

1. **Marcar «a» y «la» dejaba el articulado entero subrayado:** 3.623 marcas al buscar «atención a la diversidad». Se marca solo lo que distingue —las palabras de una o dos letras, únicamente si la búsqueda entera es así—, y quedan 6.
2. **El recorte empezaba en la primera «a».** Elegía el párrafo por número de términos encontrados, y en un texto legal «a» y «la» están en todos. Ahora puntúa por letras y centra la ventana en el término más largo, que es el que se ha ido a buscar.

**El articulado se carga después del primer pintado,** no antes como las preguntas. Es el único conjunto de datos que crece sin techo, y la portada no puede quedarse esperando a un texto que solo hace falta si se busca algo. Mientras no ha llegado, la interfaz no afirma nada sobre él: no dice «no hay artículos», dice solo lo que ya sabe.

### «Remite a», una relación que faltaba

Las instrucciones de curso no modifican la Orden 8/2025 ni la derogan: se apoyan en ella y mandan aplicarla, y hasta ahora eso solo se veía abriendo una de las dieciocho preguntas que enlazan a su articulado. Ahora es un campo, `remiteA`, y sale en el listado y en la ficha.

Va con nota, porque el verbo no basta: ver una norma debajo de otra se lee como una reforma, y esto no lo es. **Se declara por un solo lado** —el de la norma que remite— y el reverso, «Remiten a esta norma», lo deriva la interfaz, igual que `derogadaPor` y que los anexos. Declararlo dos veces sería una ocasión más de que las dos puntas dejen de coincidir.

### Atención a la diversidad: no salía nada, y sí lo había

Buscar «atención a la diversidad» no devolvía ni una norma. No era que el corpus no lo regulara: la expresión está **literalmente** en el artículo 3 de la Orden 8/2025, las adaptaciones para el alumnado con necesidades específicas están en su artículo 2.4, las seis convocatorias del alumnado con NEE en el 9.7, y las instrucciones de curso le dedican el epígrafe 16 entero. Lo que fallaba era que nada de eso asomaba a la superficie: los resúmenes no lo mencionaban y no había etiqueta.

Corregido por los dos lados. El buscador dentro del articulado devuelve ahora el artículo 3; y las dos normas que de verdad lo regulan llevan la etiqueta `atencion-diversidad` y lo dicen en su resumen, así que también aparecen como normas. **La lección es de datos, no de código:** el vocabulario con el que el profesorado busca —«atención a la diversidad»— no siempre es el de la norma —«necesidades específicas de apoyo educativo»—, y donde no coinciden hay que tender el puente a mano.

### Dos arreglos de interfaz

- **El título del sitio vuelve al listado sin filtros.** Es la salida de cualquier consulta, se esté en una ficha o con media docena de chips puestos. No se pinta como enlace: subrayarlo pondría un botón enorme en mitad de la cabecera.
- **Fuera el recuadro del encabezado.** El título de la ficha recibe el foco al cambiar de vista, para que quien navegue con teclado o con lector de pantalla aterrice en el asunto de la página. Pero un encabezado no es un control, y un recuadro alrededor dice que hay algo que pulsar donde no lo hay. El foco sigue viajando; el recuadro se queda para lo que de verdad se acciona. Lo mismo al saltar a un artículo desde el índice.

### La Ley Orgánica 3/2022, en esquema

Es una página de un tipo nuevo, y la primera que no reproduce una norma sino que la **dibuja**: `docs/esquema/lo-3-2022.html` desde `docs/data/esquema/lo-3-2022.json`. Ver D29 en [DECISIONES.md](DECISIONES.md).

**Por qué no se ha transcrito y ya.** La ley tiene 117 artículos y 25 disposiciones. Transcribirla habría dado una página fiel en la que sigue sin verse lo único que importa entender: que los cinco grados son una escalera acumulable, que el sistema entero cuelga de una sola definición y que los dos regímenes de dual se distinguen por tres cifras. Eso está en la ley, repartido entre artículos que no se leen seguidos.

La página tiene cinco bloques:

| Bloque | Qué muestra |
|---|---|
| **Los cinco grados** | La escalera A→E, cada peldaño con qué acredita, acceso, duración y si lleva fase en empresa, y entre dos peldaños la regla que dice cómo se sube: reunir las acreditaciones parciales de un estándar *es* tener el Grado B |
| **De la competencia al título** | La cadena de catálogos —estándares, modular, ofertas, currículo— y, aparte, los tres registros y la acreditación por experiencia, que entra por el mismo sitio que la formación |
| **El carácter dual** | Lo que vale para los dos regímenes y, criterio a criterio, en qué se diferencian el general y el intensivo |
| **Mapa del articulado** | Los 117 artículos y las 25 disposiciones, con una línea por título que dice qué resuelve. Cada número enlaza a su artículo en el BOE |
| **Cómo aterriza aquí** | Las normas de este listado que la desarrollan, con su estado de vigencia. No se escriben: se deducen de la etiqueta `lfp` |

**Verificado.** La estructura y los textos salen del XML del BOE, no de memoria. Las **28 citas literales** se comprobaron una a una contra el articulado antes de guardar el fichero, comparando sin espacios: ninguna afirmación de cifra o de regla se apoya en una frase que no esté publicada. El diagnóstico comprueba además que ninguna cita se quede sin artículo, que es el invariante 12.

**El aparato visual.** Mismos grises y mismas tres tipografías. El grado D —donde trabaja el profesorado que consulta esto— se destaca sin color: filete de 3 px, nombre en negrita y el distintivo de la letra invertido. La regla de acumulación vive *entre* dos peldaños, con una flecha, porque es lo que convierte cinco fichas sueltas en una escalera.

**Dos cosas que salieron de probarlo:**

1. **La comparación de regímenes no comparaba.** Enfrentada en dos columnas dentro de la columna de lectura, cada una se quedaba en doscientos píxeles y las filas no llegaban a alinearse entre sí. Se rehízo por criterio: los dos valores de cada uno, pegados y etiquetados. Se lee igual en una pantalla ancha y en un móvil, sin dos estructuras distintas.
2. **La trampa de D25, otra vez.** El distintivo del grado D es tinta plena con la letra en papel, así que en la impresión —donde los fondos no se fuerzan— habría salido en blanco sobre blanco. Comprobado extrayendo las reglas de `@media print` y midiéndolas: ahora pasa a filete negro, y los doce títulos del mapa se imprimen abiertos.

**Comprobado además:** sin desbordamiento horizontal a 375, 600, 900, 1280 y 1440 px; contraste mínimo de 5,07:1 en claro y 5,77:1 en oscuro sobre 29 combinaciones; y las once comprobaciones del diagnóstico en verde.

**La siguiente cuesta poco.** Los cinco tipos de bloque —`escalera`, `cadena`, `comparacion`, `mapa`, `corpus`— son un vocabulario reutilizable, no un formato hecho para esta ley: el esquema siguiente se escribe combinando los que le sirvan, se copia el HTML con otro nombre y se pone `esquema: true` en la norma.

## Fase 5 · Refactorización y optimización — pendiente

El sitio está en producción y funciona. Esta fase no añade nada visible: paga la deuda que han dejado cuatro fases de crecer por acumulación, para que la quinta norma transcrita cueste lo mismo que la segunda.

**Nada de esto es urgente,** y por eso está en su propia fase: se toca cuando estorbe, no antes. Publicar una norma nueva no depende de ninguno de estos puntos.

### La duplicación entre los dos scripts

`app.js` y `norma.js` tienen escritas dos veces `escapar`, `fechaLarga`, `aplanar`, `terminosDe`, `resaltar`, `identificador`, el diccionario `TIPO` y las funciones que componen el ancla y el rótulo de una pieza. La de las anclas es la que preocupa: **tiene que coincidir carácter a carácter** entre los dos ficheros o los enlaces del buscador caen en el vacío.

La causa es D1: sin build ni módulos, no hay dónde poner lo común. Salidas posibles, por orden de coste:

1. Un `assets/js/comun.js` cargado antes que los otros dos, que exponga lo compartido. No es un build ni rompe D1; obliga a un `<script>` más en cada página.
2. Módulos ES (`type="module"`), que además dan importaciones explícitas. Habría que revisar que el diagnóstico siga pudiendo leer `VERSION` de cada fichero (D19) y que la carga diferida no cambie el arranque.
3. Dejarlo así y confiar en el comentario que lo advierte, que es lo que hay hoy.

### El tamaño de `app.js`

Novecientas líneas largas en un fichero: vocabulario, utilidades, datos, filtro, pintado de listado, pintado de ficha, enrutado y arranque. Está ordenado por secciones y se navega, pero es el techo. Si la fase 4 sigue añadiendo vistas, hay que partirlo antes de que duela, y eso empuja hacia la salida 1 o 2 del punto anterior.

### La búsqueda, cuando haya muchas transcripciones

Hoy se cargan **todos** los ficheros de `data/texto/` después del primer pintado y se indexan en memoria. Con una norma transcrita son 42 KB y no se nota. Con veinte serían cerca de un mega que se descarga aunque nadie busque nada.

Lo que habría que decidir entonces: un índice de búsqueda pregenerado —que reabre D1, porque alguien tiene que generarlo—, o cargar cada articulado solo cuando la búsqueda lo pida y aceptar que los resultados aparezcan en dos tiempos. **El umbral no es un número de normas, es cuándo se note**, y se sabrá midiéndolo.

### Detalles que ya se saben

- **El bloque de respuestas da por hecho que solo hay una norma con preguntas:** rotula «De las preguntas frecuentes de X» con la primera que encuentra. En cuanto haya una segunda FAQ, hay que agrupar por norma como ya hace el bloque de articulado.
- **Los resultados no se ordenan por relevancia.** Salen por sección y por rango normativo, que es lo correcto para un sumario y discutible para una búsqueda. Antes de tocarlo hay que pensarlo: el orden por rango es información, no un residuo.
- **`VERSION` se sube a mano** en dos ficheros (D19). El diagnóstico avisa si no coinciden, que es lo que lo hace tolerable.
- **`meta.json` tiene la fecha de revisión a mano.** Es a propósito: decir «revisado en agosto» cuando se revisó en enero es peor que no decirlo, y automatizarlo con la fecha del último commit mentiría igual.
- **La hoja de estilos pasa de 1.400 líneas** con el orden en que se fueron añadiendo las vistas. Merece una lectura seguida buscando reglas muertas y duplicadas, no una reescritura.

### Lo que no se toca

El modelo de datos, la escala de grises (D5), el rigor de las citas (D18) y la ausencia de build (D1). Si algo de esto tiene que caer, se discute y se escribe una decisión nueva; no se cambia por el camino durante una refactorización.
