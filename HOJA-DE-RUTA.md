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
