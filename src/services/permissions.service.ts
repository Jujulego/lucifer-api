import Context from 'bases/context';

import { HttpError } from 'middlewares/errors';

import { PLvl, PName } from 'data/permission/permission.enums';
import PermissionHolder from 'data/permission/permission.holder';
import PermissionRepository from 'data/permission/permission.repository';

import AuthorizeService from './authorize.service';

import { Service } from 'utils';

// Service
@Service(PermissionsService)
class PermissionsService {
  // Constructor
  constructor(private authorizer: AuthorizeService) {}

  // Statics
  private static getPermissionRepository<H extends PermissionHolder>(holder: H): PermissionRepository<H> {
    return new PermissionRepository(holder);
  }

  // Methods
  private async allow(ctx: Context, level: PLvl) {
    await this.authorizer.allow(ctx, "permissions", level);
  }

  async grant<H extends PermissionHolder>(ctx: Context, holder: H, name: PName, level: PLvl): Promise<H> {
    await this.allow(ctx, PLvl.UPDATE);

    // Apply grant
    return await PermissionsService.getPermissionRepository(holder).update(name, level);
  }

  async elevate<H extends PermissionHolder>(ctx: Context, holder: H, admin: boolean = true): Promise<H> {
    // Only admins are allowed to manage admins
    if (!ctx.permissions || !(await ctx.permissions).admin) {
      throw HttpError.Forbidden();
    }

    // Change admin state
    return await PermissionsService.getPermissionRepository(holder).setAdmin(admin);
  }

  async revoke<H extends PermissionHolder>(ctx: Context, holder: H, name: PName): Promise<H> {
    await this.allow(ctx, PLvl.DELETE);

    // Apply revoke
    return await PermissionsService.getPermissionRepository(holder).delete(name);
  }
}

export default PermissionsService;
