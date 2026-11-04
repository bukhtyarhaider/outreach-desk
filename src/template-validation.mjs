import { render, assess } from './core.mjs';

/** The editor and bulk importer share the same renderability contract. */
export function validateTemplate(template, { lead, business = {}, checks = {} } = {}) {
  if (!Number.isInteger(template.weight) || template.weight < 1 || template.weight > 100)
    throw new Error('Template weight must be from 1 to 100.');
  const message = render(lead || { company: 'Example Company', email: 'person@example.com', fields: {} }, template, business);
  if (/{{|}}/.test(message.subject + message.body))
    throw new Error('Resolve malformed template fields. Use {{fieldName}} without spaces.');
  return assess(message, checks);
}
