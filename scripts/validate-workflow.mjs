import fs from 'node:fs';
import assert from 'node:assert/strict';

const file = new URL('../workflows/gestion-solicitudes-idei.sanitizado.json', import.meta.url);
const raw = fs.readFileSync(file, 'utf8');
const workflow = JSON.parse(raw);
assert.equal(workflow.active, false, 'The portfolio export must remain inactive');
assert.ok(Array.isArray(workflow.nodes) && workflow.nodes.length > 0, 'Workflow requires nodes');
assert.ok(workflow.connections && typeof workflow.connections === 'object', 'Workflow requires connections');
const names = workflow.nodes.map(node => node.name);
assert.equal(new Set(names).size, names.length, 'Node names must be unique');
const required = ['Gmail Trigger', 'Clasificar solicitud con IA', 'Validar salida IA', 'Pausa HITL - Revisión humana', '¿Aprobado?', 'Responder al solicitante por Gmail'];
for (const name of required) assert.ok(names.includes(name), 'Missing node: ' + name);
for (const node of workflow.nodes) {
  assert.ok(!node.credentials || Object.keys(node.credentials).length === 0, 'Credential reference in: ' + node.name);
}
assert.ok(!/sk-proj-|ghp_[A-Za-z0-9]{20,}|xox[baprs]-|-----BEGIN PRIVATE KEY-----/.test(raw), 'Possible secret in workflow export');
assert.ok(!/@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(raw), 'Possible email address in export');
const wait = workflow.nodes.find(node => node.name === 'Pausa HITL - Revisión humana');
assert.equal(wait.parameters.resume, 'webhook');
assert.equal(wait.parameters.options?.ignoreBots, true);
const allIds = new Set(workflow.nodes.map(n => n.name));
for (const [from, outputs] of Object.entries(workflow.connections)) {
  assert.ok(allIds.has(from), 'Connection refers to missing source ' + from);
  for (const channel of Object.values(outputs)) {
    for (const lane of channel ?? []) {
      for (const edge of lane ?? []) {
        assert.ok(allIds.has(edge.node), 'Connection refers to missing target ' + edge.node);
      }
    }
  }
}
console.log('PASS: workflow JSON is parseable; all node names unique; connections refer to existing nodes; export is inactive and scrubbed; basic HITL gate exists.');
console.log('NOT TESTED: actual execution, permissions, human authentication, model quality, error recovery or absence of all data leaks.');
