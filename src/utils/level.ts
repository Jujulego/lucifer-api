import validator from 'validator';

import { isPLvl, PLvl } from 'data/permission/permission.enums';

// Utils
export function parseLevel(level: string | number): PLvl {
  if (typeof level === 'number') return level & PLvl.ALL;
  if (validator.isNumeric(level)) return parseInt(level) & PLvl.ALL;

  // Compute level
  const parts = level.split(/[,|]/)
    .map(lvl => lvl.trim())
    .filter(isPLvl);

  return parts.reduce<PLvl>(
    (lvl, name) => lvl | PLvl[name],
    PLvl.NONE
  );
}
