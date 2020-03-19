import { inject, injectable } from 'inversify';

import Context from 'bases/context';

import { HttpError } from 'middlewares/errors';

import { PLvl, PName } from 'data/permission/permission.enums';
import PermissionHolder from 'data/permission/permission.holder';
import PermissionRepository from 'data/permission/permission.repository';

import AuthorizeService from './authorize.service';

// Service
@injectable()
class PermissionsService {
  // Attributes
  private readonly permRepo = new PermissionRepository();

  // Constructor
  constructor(
    @inject(AuthorizeService) private authorizer: AuthorizeService
  ) {}

  // Methods
  private async allow(ctx: Context, level: PLvl) {
    await this.authorizer.allow(ctx, "permissions", level);
  }

  async grant<T extends PermissionHolder>(ctx: Context, holder: T, name: PName, level: PLvl): Promise<T> {
    await this.allow(ctx, PLvl.UPDATE);

    // Apply grant
    return await this.permRepo.update(holder, name, level);
  }

  async elevate<T extends PermissionHolder>(ctx: Context, holder: T, admin: boolean = true): Promise<T> {
    // Only admins are allowed to manage admins
    if (!ctx.permissions || !(await ctx.permissions).admin) {
      throw HttpError.Forbidden();
    }

    // Change admin state
    return await this.permRepo.setAdmin(holder, admin);
  }

  async revoke<T extends PermissionHolder>(ctx: Context, holder: T, name: PName): Promise<T> {
    await this.allow(ctx, PLvl.DELETE);

    // Apply revoke
    return await this.permRepo.delete(holder, name);
  }
}

export default PermissionsService;
