import joi from '@hapi/joi';

// Types
export type DaemonCreate = {
  name?: string,
  ownerId?: string
};

export type DaemonUpdate = {
  name?: string,
  ownerId?: string,
  dependencies?: string[]
};

// Schemas
export const daemonCreate = joi.object({
  name: joi.string().allow('', null),
  ownerId: joi.string().allow('', null)
});

export const daemonUpdate = joi.object({
  name: joi.string().allow('', null),
  ownerId: joi.string().allow('', null),
  dependencies: joi.array().items(
    joi.string().uuid()
      .not(joi.ref('$id'))
  )
});
