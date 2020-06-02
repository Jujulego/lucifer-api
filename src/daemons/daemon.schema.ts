import joi from '@hapi/joi';

// Types
export type DaemonCreate = { ownerId?: string };
export type DaemonUpdate = { ownerId?: string };

// Schemas
export const daemonCreate = joi.object({
  ownerId: joi.string()
});

export const daemonUpdate = joi.object({
  ownerId: joi.string().allow(null)
});
