# Auditoría · Versión B
Código: e1493
Repositorio público propio: https://github.com/TheRealLemonMan/examen-pawnee.git
Rama: examen/e1493

## B-01 · No se guarda la edición del avistamiento
### Síntoma
Acción/datos, esperado y observado ANTES:
Al editar un avistamiento existente desde la interfaz web y cambiar la criatura o la ubicación, se esperaba que el cambio persistiera en la base de datos tras pulsar "Guardar". ANTES: El backend ignoraba el cambio de criatura durante la edición o producía inconsistencia porque el formulario enviaba la propiedad `criaturaId` en lugar de `criatura`, haciendo que el avistamiento conservara el valor previo al recargar.

### Causa
Explicación causal y archivo/capa, no solo su nombre:
En la capa de presentación frontend (`frontend/src/paginas/FormularioAvistamiento.tsx`), el objeto de datos a enviar utilizaba una condición ternaria `datos[id ? 'criaturaId' : 'criatura'] = form.criatura;`. Al editar (cuando `id` existe), enviaba el campo bajo el nombre `criaturaId`, mientras que la API backend espera recibir siempre la propiedad `criatura` en el cuerpo de la petición PUT/POST para mapearla con la referencia del esquema.

### Cambio
Qué modifiqué, por qué resuelve la causa y commit de corrección:
Se unificó la definición del objeto `datos` para asignar directamente la propiedad `criatura: form.criatura` sin importar si se trata de una creación o actualización. Resuelve el problema porque el payload siempre cumple con la interfaz y el contrato del endpoint. Commit: <SHA corto>

### Prueba
Pasos/comando, datos, status/resultado esperado y observado DESPUÉS; archivo de evidencia:
Desde `http://127.0.0.1:5173`, se abrió el avistamiento `65a000000000000000000201`, se seleccionó "Editar avistamiento", se cambió la criatura y la ubicación y se pulsó "Guardar". Resultado esperado: Vista de detalle actualizada con los nuevos datos persistidos tras F5. Resultado observado DESPUÉS: Los cambios se guardaron correctamente y persistieron tras recargar la página. Archivo de evidencia: evidencias/b01-ok.png

### Estado
Resuelto

## B-02 · El detalle no identifica a la criatura
### Síntoma
Acción/datos, esperado y observado ANTES:
Al ingresar a la vista de detalle de un avistamiento, se esperaba visualizar el nombre legible de la criatura asignada. ANTES: Se mostraba el identificador crudo (`ID: 65a...`) en lugar del nombre, y ante identificadores no encontrados la aplicación no manejaba el error adecuadamente pudiendo mostrar una pantalla en blanco.

### Causa
Explicación causal y archivo/capa, no solo su nombre:
En la capa de servicio del backend (`backend/src/services/avistamientos.service.ts`), la función `obtener` ejecutaba únicamente `Avistamiento.findById(idValido(id))`, trayendo el documento con el campo `criatura` únicamente como un `ObjectId` referencial sin poblar el documento referenciado de la colección de criaturas.

### Cambio
Qué modifiqué, por qué resuelve la causa y commit de corrección:
Se encadenó el método `.populate('criatura')` a la consulta de Mongoose (`Avistamiento.findById(idValido(id)).populate('criatura')`). Esto resuelve la causa permitiendo que el documento devuelto contenga el objeto completo de la criatura con su nombre para ser renderizado por el frontend. Commit: <SHA corto>

### Prueba
Pasos/comando, datos, status/resultado esperado y observado DESPUÉS; archivo de evidencia:
1. Se abrió el detalle del avistamiento y se comprobó que el campo "Criatura" mostrara su nombre ("La Ardilla del Martes").
2. Se navegó a `http://127.0.0.1:5173/avistamientos/65afffffffffffffffffffff`.
Resultado esperado: Mensaje amigable de error en pantalla sin crashear.
Resultado observado DESPUÉS: Mensaje claro "Avistamiento no encontrado · petición ..." renderizado en interfaz. Archivo de evidencia: evidencias/b02-ok.png

### Estado
Resuelto

## B-03 · Se acepta un tipo de criatura inválido
### Síntoma
Acción/datos, esperado y observado ANTES:
Al ejecutar un `PUT` para actualizar una criatura con un tipo no contemplado en el enum del esquema (ej. `"fantasma"`), se esperaba un status 400 Bad Request por fallo de validación. ANTES: La actualización mediante `findByIdAndUpdate` aceptaba el valor sin ejecutar las validaciones del esquema, permitiendo inconsistencias en la base de datos.

### Causa
Explicación causal y archivo/capa, no solo su nombre:
En el servicio del backend (`backend/src/services/criaturas.service.ts`), la llamada a `actualizar` invocaba la actualización en Mongoose con la opción `{ new: true }`. Por defecto en Mongoose, las operaciones de actualización (`update`, `findOneAndUpdate`, `findByIdAndUpdate`) no disparan los validadores del schema a menos que se active explícitamente la bandera `runValidators`.

### Cambio
Qué modifiqué, por qué resuelve la causa y commit de corrección:
Se añadieron las opciones completas `{ new: true, runValidators: true }` en la función `actualizar`. De esta forma, cualquier actualización parcial valida que los campos restringidos (como el enum `tipo`) cumplan con las reglas del modelo antes de guardar. Commit: <SHA corto>

### Prueba
Pasos/comando, datos, status/resultado esperado y observado DESPUÉS; archivo de evidencia:
1. Petición HTTP PUT a `http://127.0.0.1:3000/api/criaturas/65a000000000000000000101` con `{"tipo":"mitica"}`. Retornó `HTTP/1.1 200 OK`.
2. Petición HTTP PUT al mismo recurso con `{"tipo":"fantasma"}`. Retornó `HTTP/1.1 400 Bad Request` con mensaje de fallo de validación de enum.
Resultado observado DESPUÉS: Las validaciones se ejecutan y rechazan el tipo no permitido. Archivo de evidencia: evidencias/b03-ok.png

### Estado
Resuelto

## B-04 · El filtro de avistamientos no actualiza
### Síntoma
Acción/datos, esperado y observado ANTES:
En la lista de avistamientos, al cambiar la opción del selector de criaturas, se esperaba que la lista se filtrara automáticamente. ANTES: El usuario tenía que pulsar manualmente el botón "Actualizar lista", ya que cambiar la criatura en el selector desplegable no producía ningún efecto inmediato en la vista.

### Causa
Explicación causal y archivo/capa, no solo su nombre:
En el componente de interfaz (`frontend/src/paginas/ListaAvistamientos.tsx`), el hook `useEffect` encargado de ejecutar la función `listarAvistamientos` tenía como arreglo de dependencias únicamente `[recarga]`. Al no incluir el estado del filtro `criaturaId`, React no detectaba el cambio de selección para volver a disparar el efecto.

### Cambio
Qué modifiqué, por qué resuelve la causa y commit de corrección:
Se incluyó `criaturaId` en el arreglo de dependencias del `useEffect`: `[criaturaId, recarga]`. De este modo, cada vez que cambia el valor seleccionado en el selector de criatura, React ejecuta nuevamente la consulta y actualiza la lista. Commit: <SHA corto>

### Prueba
Pasos/comando, datos, status/resultado esperado y observado DESPUÉS; archivo de evidencia:
En `http://127.0.0.1:5173/avistamientos`, se cambió el selector de "Todas" a una criatura específica sin presionar "Actualizar lista".
Resultado esperado: Filtrado reactivo inmediato de los avistamientos.
Resultado observado DESPUÉS: La lista se actualizó instantáneamente mostrando solo los registros pertenecientes a la criatura elegida. Archivo de evidencia: evidencias/b04-ok.png

### Estado
Resuelto

