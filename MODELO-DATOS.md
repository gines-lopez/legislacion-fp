# Modelo de datos

`docs/data/normas.json` es la fuente de verdad única (ver D3 en [DECISIONES.md](DECISIONES.md)). Es un array de objetos norma.

## Ficha de norma

```json
{
  "id": "decreto-114-2025",
  "tipo": "decreto",
  "numero": "114/2025",
  "fecha": "2025-07-29",
  "titulo": "Decreto 114/2025, de 29 de julio, del Consell, por el que se establecen los currículos de los ciclos formativos de grado medio y grado superior",
  "resumen": "Fija el currículo autonómico de los ciclos de grado medio y superior en la Comunitat Valenciana.",
  "ambito": "autonomico",
  "seccion": "ordenacion-academica",
  "estado": "modificada",
  "modificadaPor": ["decreto-95-2026"],
  "modifica": [],
  "deroga": [],
  "enlaces": [
    { "etiqueta": "DOGV", "url": "https://dogv.gva.es/…", "formato": "pdf" }
  ],
  "etiquetas": ["curriculo", "grado-medio", "grado-superior"]
}
```

## Campos

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | string | sí | Único. Kebab-case derivado de tipo y número: `decreto-114-2025`, `rd-659-2023`, `resolucion-2026-07-16`. Es la URL de la ficha, así que **no se renombra** una vez publicado. |
| `tipo` | enum | sí | `ley-organica`, `real-decreto`, `decreto`, `orden`, `resolucion`, `instrucciones`, `guia`, `anexo`, `calendario`. |
| `numero` | string | no | Tal cual se cita: `114/2025`, o `I` en un anexo. Las resoluciones e instrucciones a menudo no tienen y se identifican por fecha. En `anexo` y `guia` **es lo que distingue unos de otros**: sin él, la interfaz cae al título como identificador. |
| `fecha` | string | sí | ISO `AAAA-MM-DD`. La de la norma, no la de publicación en diario. |
| `titulo` | string | sí | Título oficial completo, sin abreviar. Es lo que se cita. |
| `resumen` | string | sí | Una o dos frases en lenguaje llano: qué resuelve y a quién afecta. Redacción propia, no copiar el preámbulo. |
| `ambito` | enum | sí | `estatal` o `autonomico`. Se muestra en la línea de procedencia de cada norma, junto al diario que la publica. Ver D10 en [DECISIONES.md](DECISIONES.md). |
| `seccion` | enum | sí | Ver más abajo. |
| `estado` | enum | sí | `vigente`, `modificada`, `derogada`. `modificada` significa vigente pero con reformas: sigue siendo aplicable. |
| `modificadaPor` / `modifica` / `deroga` | array de `id` | sí (pueden ir vacíos) | Relaciones entre normas. |
| `remiteA` | array de `id` | no | Normas en las que esta se apoya sin cambiarlas: las cita y manda aplicarlas. **Se declara por un solo lado**, el de la norma que remite; el reverso lo deriva la interfaz. No exige simetría y no altera el `estado` de nadie. Ver D26 en [DECISIONES.md](DECISIONES.md). |
| `enlaces` | array | sí, mínimo uno | `etiqueta` (`DOGV`, `PDF del DOGV`, `BOE`, `CEICE`, `Corrección de errores`), `url` y `formato` (`pdf` o `html`). Ver D9 en [DECISIONES.md](DECISIONES.md). |
| `texto` | booleano | no | `true` si la norma tiene el articulado transcrito. El fichero es `docs/data/texto/<id>.json` y la página, `docs/norma/<id>.html`: ambas rutas se derivan del `id`. Ver D22 en [DECISIONES.md](DECISIONES.md). |
| `consulta` | booleano | no | `true` si la norma tiene preguntas frecuentes. El fichero es `docs/data/consulta/<id>.json`: la ruta se deriva del `id`, no se escribe. Ver D18 en [DECISIONES.md](DECISIONES.md). |
| `esquema` | booleano | no | `true` si la norma tiene un esquema de su estructura. El fichero es `docs/data/esquema/<id>.json` y la página, `docs/esquema/<id>.html`. Ver D29 en [DECISIONES.md](DECISIONES.md). |
| `parteDe` | `id` | no | Solo en documentos que **no son norma independiente**, sino parte del texto que los publica: los anexos de una resolución. La ficha de la madre los lista, y la del hijo declara de quién es parte. Ver D16 en [DECISIONES.md](DECISIONES.md). |
| `etiquetas` | array de string | no | Kebab-case, transversales a las secciones: `dual`, `grado-basico`, `fct`, `curriculo`, `optatividad`. |

## Secciones

Corresponden a los bloques de la web original y ordenan la portada:

`ordenacion-academica` · `curso-actual` · `desdobles` · `anexos` · `optatividad` · `cursos-anteriores`

`curso-actual` es deliberadamente genérico y no lleva el año en el identificador: al empezar un curso nuevo, sus normas pasan a `cursos-anteriores` y las nuevas ocupan su lugar, sin renombrar nada.

## Invariantes

Deben cumplirse siempre; conviene comprobarlos tras cada tanda de cambios.

1. `id` único en todo el fichero.
2. Todo `id` citado en `modificadaPor`, `modifica` o `deroga` existe como norma.
3. **Simetría de relaciones:** si A declara `modificadaPor: [B]`, entonces B declara `modifica: [A]`. Igual con `deroga`. Una relación declarada por un solo lado es un error, no una abreviatura.
4. `estado: "modificada"` exige `modificadaPor` no vacío. `estado: "derogada"` exige que alguna norma la liste en su `deroga`.
5. Ninguna norma `derogada` en `curso-actual`: si ha sido sustituida, va a `cursos-anteriores`.
6. `enlaces` con al menos una entrada, y ninguna URL a un dominio distinto de `dogv.gva.es`, `boe.es` o `ceice.gva.es` sin justificarlo.
7. Dos normas del mismo `tipo` sin `numero` y sin `fecha` distinta se mostrarían con el mismo identificador. Si ocurre, hay que darles `numero`.
8. Todo `parteDe` apunta a una norma que existe, y ninguna norma es parte de sí misma.
9. Toda norma con `consulta: true` tiene su fichero en `docs/data/consulta/`, sin identificadores repetidos, y ninguna pregunta sin `epigrafe` ni sin `cita`.
10. Toda norma con `texto: true` tiene su fichero en `docs/data/texto/`, ninguna pieza sin párrafos, y todo `modificadoPor` apunta a una norma que existe.
11. Todo `id` citado en `remiteA` existe como norma, y ninguna norma se remite a sí misma. A diferencia del invariante 3, **no se exige reverso**: es deliberado.
12. Toda norma con `esquema: true` tiene su fichero en `docs/data/esquema/`, con `aviso`, ningún bloque sin `id` ni sin `rotulo`, y **ninguna `cita` sin su `citaArticulo`**. Es la misma exigencia del invariante 9 y por la misma razón: un esquema interpreta, y la cita es lo que lo hace comprobable.

Los invariantes 1 a 5 y del 8 al 12 los comprueba sola la página [`diagnostico.html`](docs/diagnostico.html) cada vez que se abre: basta cargarla tras editar el JSON.

## Lo que el modelo no captura

`estado` y las relaciones dicen **que** una norma fue modificada o derogada, pero no **hasta dónde**. Y en este cuerpo normativo el alcance casi nunca es total:

- La Resolución de 19 de junio de 2023 deja sin efecto *el anexo* de la de 2 de diciembre de 2022, no su articulado: el procedimiento de actualización de desdobles sigue siendo el de 2022. En el dato son `modifica` y `modificada`, sin más.
- La Resolución de 8 de agosto de 2024 no sustituyó a la del curso anterior: la prorrogó *solo para los segundos cursos*. El modelo no tiene «prorroga».
- El RD 1147/2011 está derogado, pero los títulos expedidos a su amparo conservan su equivalencia. `derogada` no significa irrelevante.
- El Decreto 95/2026 modifica el 114/2025 y el 117/2025, pero solo artículos y anexos concretos.
- La Orden 8/2025 deroga la Orden 79/2010, pero sus disposiciones transitoria y derogatoria la mantienen aplicable a los ciclos LOGSE en extinción. En el dato es `derogada` a secas.

**Dónde vive ese matiz:** en el `resumen`, redactado a propósito para decirlo. Es la razón de que `resumen` sea obligatorio y de que no se copie del preámbulo.

**Consecuencia para quien construya vistas:** un distintivo de estado a solas es información incompleta, y presentarlo así induce justo el error que el sitio quiere evitar. Siempre que se muestre `estado` o una relación, el `resumen` correspondiente tiene que estar a la vista.

## Los otros dos ficheros de datos

Ver D14 en [DECISIONES.md](DECISIONES.md). Ninguno de los dos toca el esquema de norma.

### `docs/data/meta.json`

```json
{
  "revisado": "2026-08-31",
  "fuente": { "titulo": "…", "organismo": "…", "url": "https://ceice.gva.es/…" }
}
```

`revisado` es la fecha de la última comprobación del corpus entero y sale en la cabecera y en el pie. Es el dato que hay que actualizar **cada vez que se repasa la normativa**, aunque no cambie ninguna norma: decir «revisado en agosto» cuando se revisó en enero es peor que no decirlo.

### `docs/data/consulta/<id>.json`

Las preguntas frecuentes de una norma. La norma declara `consulta: true` y el fichero se llama como su `id`.

```json
{
  "norma": "resolucion-2026-07-16",
  "revisado": "2026-08-31",
  "aviso": "…",
  "preguntas": [
    {
      "id": "exencion-experiencia",
      "tema": "formacion-empresa",
      "pregunta": "¿Cuánta experiencia laboral hace falta para la exención?",
      "respuesta": "Seis meses para los grados C y E, y un año a tiempo completo…",
      "epigrafe": "15.1.3",
      "epigrafeTitulo": "Exención de la fase de formación en empresa u organismo equiparado",
      "cita": "el alumnado deberá acreditar una experiencia laboral correspondiente a seis meses…"
    }
  ]
}
```

| Campo | Obligatorio | Notas |
|---|---|---|
| `id` | sí | Único dentro del fichero. Es la URL de la pregunta: `?n=<norma>&p=<id>`, así que **no se renombra**. |
| `tema` | sí | Agrupa las preguntas en la ficha: `matricula`, `evaluacion`, `convocatorias`, `titulacion`, `convalidaciones`, `formacion-empresa`, `profesorado`, `alumnado`, `organizacion`. |
| `pregunta` | sí | Tal y como la formularía quien consulta, no como la titula la norma. |
| `respuesta` | sí | Redacción propia en lenguaje llano. **Nunca va sola:** siempre acompañada de `epigrafe` y `cita`. |
| `epigrafe` / `epigrafeTitulo` | sí | Numeración y rótulo del epígrafe del que sale, tal y como aparecen en el índice de la norma. |
| `cita` | sí | Frase **literal** de la norma en la que se apoya la respuesta. |

**Invariante 9:** ninguna pregunta sin `epigrafe` y sin `cita`, y ninguna `cita` que no aparezca literalmente en el texto publicado. Una respuesta sin respaldo es exactamente el daño que este sitio existe para evitar.

**Cómo se comprueba la literalidad.** Se extrae el texto del PDF oficial, se le quita la maquetación del diario —que se cuela en mitad de las frases al cruzar página— y se compara cada `cita` ignorando los espacios, porque la extracción los mete dentro de las palabras. Las 50 preguntas de la Resolución de 16 de julio de 2026 se generaron así y las 50 citas quedaron verificadas. La página [`diagnostico.html`](docs/diagnostico.html) comprueba después lo que puede comprobar en el navegador: que el fichero exista, que no haya identificadores repetidos y que ninguna respuesta se quede sin epígrafe ni sin cita.

### `docs/data/texto/<id>.json`

El articulado de una norma, transcrito. La norma declara `texto: true`.

```json
{
  "norma": "orden-8-2025",
  "revisado": "2026-08-31",
  "consolidacion": {
    "propia": true,
    "aplicadas": [{ "norma": "orden-5-2026", "identificador": "Orden 5/2026, de 1 de abril", "desde": "2026-04-08" }],
    "aviso": "…"
  },
  "articulado": [
    {
      "tipo": "articulo",
      "numero": "14",
      "titulo": "Promoción de curso en régimen presencial",
      "parrafos": ["1. Se podrá promocionar a segundo curso:", "…"],
      "modificadoPor": {
        "norma": "orden-5-2026",
        "identificador": "Orden 5/2026, de 1 de abril",
        "desde": "2026-04-08",
        "detalle": "Nueva redacción del apartado 1.b, sobre promoción a segundo en grado medio y superior."
      }
    }
  ]
}
```

`tipo` es `articulo` o `disposicion`; las disposiciones llevan además `grupo` («Disposiciones adicionales», «Disposición derogatoria»…). Cada pieza tiene su ancla derivada del número: `#articulo-14`.

**Invariante 10:** cada párrafo del articulado aparece **literalmente** en el PDF del que procede. Los párrafos no modificados, en el de la propia norma; los que una norma posterior haya cambiado, en el PDF de esa norma posterior. Es la misma comprobación que la de las citas de la consulta y se hace igual: se compara ignorando los espacios, porque la extracción del PDF los mete dentro de las palabras, y quitando antes la maquetación del diario.

**Cuando la consolidación es propia hay que decirlo.** `consolidacion.propia` con su `aviso` sale destacado en la cabecera de la página. Ver D22.

**El buscador de la portada entra aquí.** Cada pieza se indexa por separado —rótulo, título y párrafos— porque **el artículo es la unidad que se cita y por tanto la que se encuentra**: los términos tienen que caer todos dentro de la misma pieza. El identificador de la norma se queda fuera del índice a propósito; si entrara, buscar «orden» devolvería los veintiséis artículos de la Orden 8/2025. El ancla (`#articulo-14`) la componen `app.js` y `norma.js` con la misma función escrita dos veces: si se cambia una hay que cambiar la otra o los enlaces del buscador caen en el vacío. Ver la fase 5 de [HOJA-DE-RUTA.md](HOJA-DE-RUTA.md).

### `docs/data/esquema/<id>.json`

El esquema de una norma: cómo está construida, para poder entenderla sin leerla entera. La norma declara `esquema: true`. Ver D29 en [DECISIONES.md](DECISIONES.md).

```json
{
  "norma": "lo-3-2022",
  "revisado": "2026-08-31",
  "aviso": "Este esquema es una lectura de la ley, no su texto…",
  "tesis": "Hasta 2022 había dos formaciones profesionales…",
  "cifras": [{ "dato": "117", "rotulo": "artículos", "nota": "…", "mono": false }],
  "bloques": [ { "tipo": "escalera", "id": "grados", "rotulo": "Los cinco grados", "…": "…" } ]
}
```

| Campo | Obligatorio | Notas |
|---|---|---|
| `aviso` | sí | Sale destacado en la cabecera. Dice que esto interpreta y que el auténtico es el diario oficial. |
| `tesis` | sí | Qué hace la norma, en un párrafo. Va antes que el índice: un esquema que empieza por el índice obliga a leerlo entero para saber de qué va. |
| `cifras` | no | El tamaño de lo que se va a leer, antes de empezar. `mono: true` para lo que no es un número redondo, como una fecha. |
| `bloques` | sí | Cada uno con `tipo`, `id` —que es su ancla— y `rotulo`. |

**Los tipos de bloque** son un vocabulario corto y reutilizable, no un formato por norma:

| `tipo` | Para qué | Piezas |
|---|---|---|
| `escalera` | Una secuencia acumulativa, donde cada peldaño se construye con los anteriores | `pasos`, cada uno con `letra`, `nombre`, `que`, `filas`, `articulos` y la regla `acumula` que lleva al siguiente |
| `cadena` | Un flujo de A a B a C | `eslabones` numerados y `derivaciones`, que es lo que entra o sale por los lados |
| `comparacion` | Dos o más variantes contrastadas criterio a criterio | `comun` con lo que vale para todas, y `columnas` con las mismas `filas` en el mismo orden |
| `mapa` | La estructura completa del articulado | `titulos` con sus capítulos, secciones y artículos, y `disposiciones` por grupos |
| `corpus` | Qué normas de este listado la desarrollan | Solo `etiqueta`: las normas **no se escriben**, se deducen (D3) |

**La cita es obligatoria donde se afirma una cifra o una regla.** Cualquier objeto que lleve `cita` tiene que llevar `citaArticulo`, y la frase debe estar **literalmente** en ese artículo. Se comprueba igual que las citas de la consulta: se extrae el texto del diario, se compara ignorando los espacios y se descarta lo que no aparezca. Las citas del esquema de la LO 3/2022 se verificaron así, una a una, contra el XML del BOE.

**En `comparacion`, todas las columnas llevan las mismas `filas` en el mismo orden.** La interfaz las pivota para enfrentar los dos valores de cada criterio, así que una fila de más en una columna descuadra la comparación entera.

### `docs/data/recursos.json`

Array de objetos con `id`, `titulo`, `resumen`, `fuente`, `url` y `formato`. Son documentos que la conselleria publica junto a la normativa pero que no son normas: no tienen fecha de disposición, no se citan y no llevan estado de vigencia. Se muestran en un bloque aparte, rotulado «Recursos, no normativa», y solo cuando no hay ningún filtro activo.

## Lo que la interfaz deriva y no está en el fichero

- **`derogadaPor`.** No existe como campo: se calcula recorriendo el `deroga` de las demás normas, que el invariante 3 obliga a declarar. Por eso ese invariante no es una formalidad; si falta, la ficha de la norma derogada no puede decir quién la derogó.
- **El diario** (`DOGV`, `BOE`, `CEICE`) sale del dominio del primer enlace, no de la etiqueta. Ver D10.
- **El identificador que se muestra y se enlaza** se compone de `tipo` + `numero`; si no hay `numero`, de `tipo` + `fecha`; y en `anexo` y `guia` sin número, del propio `titulo`.
- **Los hijos de una norma.** No hay campo «partes»: se derivan agrupando por el `parteDe` de las demás, igual que `derogadaPor`.
- **«Remiten a esta norma».** Tampoco existe como campo: se calcula recorriendo el `remiteA` de las demás. Es el mismo criterio que con `derogadaPor` y por la misma razón: dos puntas escritas a mano son dos ocasiones de que dejen de coincidir.
- **El nombre corto de un anexo.** Dentro de la ficha de su madre, del título se muestra solo lo que sigue a los dos puntos: «Anexo I de la Resolución de 16 de julio de 2026: solicitud de anulación de matrícula» se pinta como «solicitud de anulación de matrícula», porque de quién es parte ya lo dice el encabezado.
- **El rango normativo** que ordena cada sección sale de `tipo`: ley orgánica → real decreto → decreto → orden → resolución → instrucciones → calendario → anexo → guía. A igual rango, la más reciente primero.

## Al añadir una norma

Actualizar **las dos** puntas de cada relación, y revisar si la nueva norma cambia el `estado` de otra existente. Es el error más fácil de cometer y el que produce el fallo más grave: mostrar como vigente algo que ya no lo está.
