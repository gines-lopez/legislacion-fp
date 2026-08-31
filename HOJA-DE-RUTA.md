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

`docs/data/normas.json` contiene **36 normas** volcadas de las seis secciones de la web del CEICE, con los seis invariantes de [MODELO-DATOS.md](MODELO-DATOS.md) comprobados y las 58 URL verificadas una a una (código 200 y tipo de contenido esperado).

| Sección | Normas |
|---|---|
| `ordenacion-academica` | 20 |
| `curso-actual` | 4 |
| `desdobles` | 3 |
| `anexos` | 4 |
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

## Fase 3 · Interfaz — pendiente, es lo siguiente

Portada con buscador instantáneo y filtros por sección, ámbito y estado. Ficha de norma mostrando sus relaciones. Aviso legal en el pie con fecha de última revisión.

**Ya resuelto sobre la portada provisional:** el ámbito estatal o autonómico se muestra en cada norma como línea de procedencia junto al diario que la publica (D10 en [DECISIONES.md](DECISIONES.md)), y cada tarjeta lleva `data-ambito`, así que el filtro de la fase 3 solo tiene que engancharse. De paso se corrigieron los identificadores, que se pintaban sin tildes: se citaba «LEY ORGANICA» y «REAL-DECRETO».

**Requisito que sale del volcado:** una relación entre normas casi nunca es total, y el alcance está en el `resumen`, no en el dato. Ver «Lo que el modelo no captura» en [MODELO-DATOS.md](MODELO-DATOS.md). En la práctica, para la interfaz:

- Donde se muestre `estado` o una relación, el `resumen` de la norma tiene que estar a la vista, no escondido tras un despliegue. Un distintivo de «modificada» a solas informa de menos de lo que aparenta.
- En la ficha, cada norma relacionada se acompaña de su propio `resumen`, que es donde se dice qué se modificó exactamente.
- El filtro por estado ordena, pero no decide: nada en la interfaz debe dar a entender que una norma `derogada` es papel mojado, ni que una `vigente` lo es sin matices.

## Fase 4 · Páginas de consulta — pendiente, a demanda

Articulado navegable en HTML para no tener que abrir el PDF. Se irán pidiendo norma a norma. Ver el matiz de D7 en [DECISIONES.md](DECISIONES.md): son ayuda a la lectura, no texto auténtico.
