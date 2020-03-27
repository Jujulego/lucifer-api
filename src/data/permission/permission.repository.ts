import { PLvl, PName } from 'data/permission/permission.enums';
import { Permission } from 'data/permission/permission';
import PermissionHolder from 'data/permission/permission.holder';

// Repository
class PermissionRepository<H extends PermissionHolder> {
  // Constructor
  constructor(private holder: H) {}

  // Methods
  // - admin state
  async setAdmin(admin: boolean): Promise<H> {
    this.holder.admin = admin;

    return await this.holder.save();
  }

  // - permissions
  getByName(name: PName): Permission | null {
    return this.holder.permissions.find(p => p.name === name) || null;
  }

  async update(name: PName, level: PLvl): Promise<H> {
    // Get permission
    let perm = this.getByName(name);

    // Apply new level
    if (perm) {
      // Update level
      perm.level = level;
    } else {
      // Add permission
      perm = this.holder.permissions.create({ name, level });
      this.holder.permissions.push(perm);
    }

    return await this.holder.save();
  }

  async delete(name: PName): Promise<H> {
    // Get permission
    const perm = this.getByName(name);
    if (!perm) return this.holder;

    // Delete permission
    await perm.remove();
    return await this.holder.save();
  }
}

export default PermissionRepository;
