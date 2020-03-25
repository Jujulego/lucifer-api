import bcrypt from 'bcryptjs';

import DaemonModel from './daemon.model';
import { Credentials, Daemon, SimpleDaemon } from './daemon';
import { DaemonFilter, DaemonCreate, DaemonUpdate } from './daemon';

// Repository
class DaemonRepository {
  // Methods
  async create(data: DaemonCreate, secret: string): Promise<Daemon> {
    // Create daemon
    const daemon = new DaemonModel({
      name: data.name,
      secret,
      user: data.user,
    });

    return await daemon.save();
  }

  async getById(id: string): Promise<Daemon | null> {
    return DaemonModel.findById(id);
  }

  async getByCredentials(cred: Credentials): Promise<Daemon | null> {
    // Search by name
    const daemon = await this.getById(cred.id);
    if (!daemon) return null;

    // Check secret
    const match = await bcrypt.compare(cred.secret, daemon.secret);
    if (!match) return null;

    return daemon;
  }

  async getByToken(id: string, token: string): Promise<Daemon | null> {
    return DaemonModel.findOne({ _id: id, 'tokens.token': token });
  }

  async getByUser(id: string, user: string): Promise<Daemon | null> {
    return DaemonModel.findOne({ _id: id, user });
  }

  async find(filter: DaemonFilter): Promise<SimpleDaemon[]> {
    return DaemonModel.find(filter, { tokens: false, permissions: false });
  }

  async update(daemon: Daemon, update: DaemonUpdate): Promise<Daemon> {
    // Apply update
    if (update.name)   daemon.name   = update.name;
    if (update.user)   daemon.user   = update.user;
    if (update.secret) daemon.secret = update.secret;

    return await daemon.save();
  }

  async delete(id: string): Promise<Daemon | null> {
    return DaemonModel.findByIdAndDelete(id);
  }
}

export default DaemonRepository;
