import { PLvl, PName } from 'data/permission/permission.enums';
import { Permission } from 'data/permission/permission';
import PermissionHolder from 'data/permission/permission.holder';

// Repository
class PermissionRepository {
  // Methods
  // - admin state
  async setAdmin<T extends PermissionHolder>(holder: T, admin: boolean): Promise<T> {
    holder.admin = admin;

    return await holder.save();
  }

  // - permissions
  getByName(holder: PermissionHolder, name: PName): Permission | null {
    return holder.permissions.find(p => p.name === name) || null;
  }

  async update<T extends PermissionHolder>(holder: T, name: PName, level: PLvl): Promise<T> {
    // Get permission
    let perm = this.getByName(holder, name);

    // Apply new level
    if (perm) {
      // Update level
      perm.level = level;
    } else {
      // Add permission
      perm = holder.permissions.create({ name, level });
      holder.permissions.push(perm);
    }

    return await holder.save();
  }

  async delete<T extends PermissionHolder>(holder: T, name: PName): Promise<T> {
    // Get permission
    const perm = this.getByName(holder, name);
    if (!perm) return holder;

    // Delete permission
    await perm.remove();
    return await holder.save();
  }
}

export default PermissionRepository;
