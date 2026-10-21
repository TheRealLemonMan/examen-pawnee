# Uso de IA
- Herramientas utilizadas (o "No utilizada"): Claude y Gemini.
- Una o dos solicitudes representativas SIN secretos:
1. "Cómo corregir B-01 a B-04 según los reportes de error en frontend y backend"
2. "Comandos para probar las validaciones enum en Mongoose usando curl y estructura de AUDITORIA.md"
- Decisión técnica: qué acepté, ajusté o descarté y por qué:
Acepté las soluciones manuales directas para cada reporte (unificar el campo `criatura` en el formulario para evitar el uso condicional de `criaturaId`, agregar `.populate('criatura')` en la consulta del servicio de avistamientos, habilitar `runValidators: true` en la actualización de criaturas y añadir `criaturaId` a las dependencias de `useEffect` en la vista de lista). Descarté la aplicación del archivo `.patch` para tener control total de los cambios en el código y evitar conflictos de Git.
- Cómo verifiqué los cambios:
Se verificó la compilación de TypeScript limpia con `npm run check`. Luego se levantaron ambos servidores (backend en puerto 3000 y frontend en 5173), probando interactivamente la edición con persistencia, el manejo de errores ante IDs inexistentes, el filtrado reactivo sin recargar y ejecutando peticiones HTTP con `curl` para validar los códigos de estado 200 y 400.

No se exige rechazar una sugerencia si todas fueron útiles, ni entregar conversaciones completas. No usar IA no reduce puntaje.
