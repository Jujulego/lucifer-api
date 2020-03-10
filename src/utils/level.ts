import validator from 'validator';

import { isPLvl, PLvl } from '../data/permission';
import { HttpError } from '../middlewares/errors';

// Utils
export function parseLevel(level: string | number): PLvl {
  if (typeof level === 'number') return level & PLvl.ALL;
  if (validator.isNumeric(level)) return parseInt(level) & PLvl.ALL;

  // Compute level
  const parts = level.split(',').filter(isPLvl);
  if (parts.length === 0) throw HttpError.BadRequest("Need at least 1 valid level");

  return parts.reduce<PLvl>(
    (lvl, name) => lvl | PLvl[name],
    PLvl.NONE
  );
}
