# Auditoría técnica del portfolio — SmartDesk AI
**Fecha:** 8 de noviembre de 2026 · **Alcance:** análisis estático del workflow JSON público, evidencia #53–#57 y capturas; sin entrar a las credenciales ni ejecutar el workflow original de n8n.

## Resultado
La exportación JSON es válida y contiene **24 nodos**, **23 claves de nodos origen en conexiones**, `active: false`, `pinData: {}` y ninguna credencial configurada en los nodos. Los IDs de recursos de integración están reemplazados por marcadores. El flujo tiene rutas de clasificación, espera HITL, aprobación/rechazo y errores.

**No certifica funcionamiento autónomo ni seguridad para producción**; requiere credenciales propias, configuración de recursos y pruebas integradas.

## Hallazgos priorizados
| Prioridad | Evidencia y riesgo | Medida recomendada |
|---|---|---|
| **Alta** | El nodo Wait usa una URL de reanudación que se incluye en Slack. `ignoreBots: true` evita algunas reanudaciones de bots, pero **no autentica al aprobador**. La rama posterior verifica el campo `Aprobado` en Airtable, pero es necesario restringir quién puede editarlo y correlacionar la aprobación con la ejecución. | Crear aprobación autenticada, con identidad, registro de decisión, token de un solo uso y vencimiento. |
| **Alta** | La respuesta Gmail utiliza `$('Validar salida IA').item.json.respuesta_sugerida`, es decir, el texto originalmente generado. Si un operador edita el borrador en Airtable, **la versión editada no se recupera explícitamente** antes del envío. | Enviar la versión aprobada y versionada que efectivamente revisó la persona, nunca el texto original sin comparar. |
| **Media** | El mensaje de Slack incluye resumen y texto del borrador, además de un enlace de reanudación. | Minimizar datos compartidos y asegurar que el canal sea privado y tenga permisos restringidos. |
| **Media** | Filtro Gmail `in:inbox subject:"[IDEI]" is:unread` más marcar como leído reduce repeticiones, pero no ofrece idempotencia estricta. | Guardar una clave única por `messageId` y verificar estado terminal antes de enviar. |
| **Media** | Una rama de error puede marcar un correo como leído y dejar la solicitud en estado Error. | Crear cola de reintentos, alerta operativa y reconciliación de casos no respondidos. |
| **Media** | El nodo Notion consulta registros estructurados (getAll); no existe índice vectorial ni embeddings en el JSON. | Describirlo como consulta a base de conocimiento de Notion; reservar el término RAG vectorial para una implementación verificable. |
| **Media** | El workflow exportado no contiene credenciales ni IDs reales. | No confundir «importable» con «ejecutable sin configuración». Re-vincular, revisar permisos y probar con datos ficticios. |

## Evidencia comprobada
- JSON sintácticamente válido, nodos y conexiones presentes, exportación `active: false`.
- Captura de la ejecución **#57** en estado Succeeded (43,862 segundos) con los nodos ejecutados resaltados.
- Captura de la ejecución **#70** en estado Waiting: prueba de pausa, **no** de finalización.
- Documento histórico de pruebas #53 rechazo, #54 aprobación, #55 error, #56 prioridad alta y #57 información incompleta. No se volvieron a ejecutar en esta auditoría.

## Matriz de verificación recomendada en un entorno de pruebas
- [ ] Correo nuevo → registro único en Airtable → clasificación coherente.
- [ ] Salida de IA inválida → estado Error, alerta y ausencia de envío.
- [ ] Rechazo humano → ausencia de correo enviado, registro Rechazado.
- [ ] Aprobación por usuario autorizado → comparación de borrador aprobado con texto realmente enviado.
- [ ] Edición humana del borrador → envío de versión editada, no de versión previa.
- [ ] Segundo clic en enlace de aprobación / mensaje duplicado → ningún segundo envío.
- [ ] Enlace de reanudación filtrado a un tercero → intento rechazado.
- [ ] Caída de Airtable/Gmail/Slack → reintentos controlados, aviso y recuperación.
- [ ] Datos personales → minimización de contenido en Slack, trazas y logs.

## Posicionamiento profesional
Es defendible presentarlo como **prototipo académico funcional de automatización con IA, orquestación n8n, validación de salidas, integraciones y Human-in-the-loop**, con pruebas controladas. **No** describirlo como producto institucional oficial, plataforma con cumplimiento de seguridad certificado ni automatización sin supervisión.

**Decisión de auditoría:** documentar los límites y conservar intacta la exportación sanitizada, que es una evidencia histórica de la entrega. Implementar cualquier mejora operativa en una copia de laboratorio, validarla y exportar una nueva versión diferenciada.
