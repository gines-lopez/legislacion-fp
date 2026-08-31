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
| `enlaces` | array | sí, mínimo uno | `etiqueta` (`DOGV`, `PDF del DOGV`, `BOE`, `CEICE`, `Corrección de errores`), `url` y `formato` (`pdf` o `html`). Ver D9 en [DECISIONES.md](DECISIONES.md). |
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

Los invariantes 1 a 5 los comprueba sola la página [`diagnostico.html`](docs/diagnostico.html) cada vez que se abre: basta cargarla tras editar el JSON.

## Lo que el modelo no captura

`estado` y las relaciones dicen **que** una norma fue modificada o derogada, pero no **hasta dónde**. Y en este cuerpo normativo el alcance casi nunca es total:

- La Resolución de 19 de junio de 2023 deja sin efecto *el anexo* de la de 2 de diciembre de 2022, no su articulado: el procedimiento de actualización de desdobles sigue siendo el de 2022. En el dato son `modifica` y `modificada`, sin más.
- La Resolución de 8 de agosto de 2024 no sustituyó a la del curso anterior: la prorrogó *solo para los segundos cursos*. El modelo no tiene «prorroga».
- El RD 1147/2011 está derogado, pero los títulos expedidos a su amparo conservan su equivalencia. `derogada` no significa irrelevante.
- El Decreto 95/2026 modifica el 114/2025 y el 117/2025, pero solo artículos y anexos concretos.

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

### `docs/data/recursos.json`

Array de objetos con `id`, `titulo`, `resumen`, `fuente`, `url` y `formato`. Son documentos que la conselleria publica junto a la normativa pero que no son normas: no tienen fecha de disposición, no se citan y no llevan estado de vigencia. Se muestran en un bloque aparte, rotulado «Recursos, no normativa», y solo cuando no hay ningún filtro activo.

## Lo que la interfaz deriva y no está en el fichero

- **`derogadaPor`.** No existe como campo: se calcula recorriendo el `deroga` de las demás normas, que el invariante 3 obliga a declarar. Por eso ese invariante no es una formalidad; si falta, la ficha de la norma derogada no puede decir quién la derogó.
- **El diario** (`DOGV`, `BOE`, `CEICE`) sale del dominio del primer enlace, no de la etiqueta. Ver D10.
- **El identificador que se muestra y se enlaza** se compone de `tipo` + `numero`; si no hay `numero`, de `tipo` + `fecha`; y en `anexo` y `guia` sin número, del propio `titulo`.
- **El rango normativo** que ordena cada sección sale de `tipo`: ley orgánica → real decreto → decreto → orden → resolución → instrucciones → calendario → anexo → guía. A igual rango, la más reciente primero.

## Al añadir una norma

Actualizar **las dos** puntas de cada relación, y revisar si la nueva norma cambia el `estado` de otra existente. Es el error más fácil de cometer y el que produce el fallo más grave: mostrar como vigente algo que ya no lo está.
