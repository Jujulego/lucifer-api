import Context from 'bases/context';

import { HttpError } from 'middlewares/errors';

import { PName, PLvl } from 'data/permission/permission.enums';
import PermissionHolder from 'data/permission/permission.holder';
import PermissionRepository from 'data/permission/permission.repository';

import { Service } from 'utils';

// Service
@Service(AuthorizeService)
class AuthorizeService {
  // Statics
  private static getPermissionRepository(holder: PermissionHolder): PermissionRepository {
    return new PermissionRepository(holder);
  }

  // Methods
  async has(ctx: Context, name: PName, level: PLvl): Promise<boolean> {
    // Has holder
    if (!ctx.permissions) return false;
    const holder = await ctx.permissions;

    // Admins always pass
    if (holder.admin) return true;

    // Find permission
    const permission = AuthorizeService.getPermissionRepository(holder).getByName(name);
    if (!permission) return false;

    // Check level
    return (permission.level & level) === level;
  }

  async allow(ctx: Context, name: PName, level: PLvl) {
    const allowed = await this.has(ctx, name, level);

    if (!allowed) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default AuthorizeService;
