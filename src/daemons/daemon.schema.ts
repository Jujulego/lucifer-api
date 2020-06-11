import joi from '@hapi/joi';

// Types
export type DaemonCreate = { name?: string, ownerId?: string };
export type DaemonUpdate = { name?: string, ownerId?: string };

// Schemas
export const daemonCreate = joi.object({
  name: joi.string(),
  ownerId: joi.string()
});

export const daemonUpdate = joi.object({
  name: joi.string(),
  ownerId: joi.string().allow(null)
});
