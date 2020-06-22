import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import validator from 'validator';

import { UserService } from 'users/user.service';

import { Daemon } from './daemon.entity';
import { DaemonCreate, DaemonUpdate } from './daemon.schema';

// Service
@Injectable()
export class DaemonService {
  // Constructor
  constructor(
    private users: UserService,
    @InjectRepository(Daemon) private repository: Repository<Daemon>
  ) {}

  // Methods
  async create(data: DaemonCreate): Promise<Daemon> {
    try {
      // Create daemon
      const daemon = this.repository.create({
        name: data.name
      });

      if (data.ownerId) {
        daemon.owner = await this.users.getLocal(data.ownerId, { full: false });
      }

      return await this.repository.save(daemon);
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() === 404) throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async list(): Promise<Daemon[]> {
    return this.repository.find({
      relations: ['owner']
    });
  }

  async get(id: string): Promise<Daemon> {
    if (!validator.isUUID(id)) throw new NotFoundException(`Daemon ${id} not found`);

    // Get daemon
    const daemon = await this.repository.findOne(id, {
      relations: ['owner', 'dependencies', 'dependents']
    });

    if (!daemon) throw new NotFoundException(`Daemon ${id} not found`);

    return daemon;
  }

  async getAll(ids: string[]): Promise<Daemon[]> {
    const daemons = await this.repository.findByIds(ids);

    // Search for missings
    if (daemons.length !== ids.length) {
      const missing = ids.filter(id => !daemons.find(dmn => dmn.id === id));

      if (missing.length > 0) {
        throw new BadRequestException(`Daemons not found: ${ids.join(', ')}`);
      }
    }

    return daemons;
  }

  async update(id: string, update: DaemonUpdate): Promise<Daemon> {
    // Get daemon
    const daemon = await this.get(id);

    // Validate data
    if (update.dependencies?.includes(id)) {
      throw new BadRequestException('A daemon cannot depend on itself');
    }

    try {
      // Apply update
      if ('name' in update) daemon.name = update.name || null;

      if ('ownerId' in update) {
        if (!update.ownerId) {
          daemon.owner = undefined;
        } else {
          daemon.owner = await this.users.getLocal(update.ownerId, { full: false });
        }
      }

      if (update.dependencies) {
        daemon.dependencies = await this.getAll(update.dependencies);
      }

      return await this.repository.save(daemon);
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() === 404) throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async delete(...ids: string[]): Promise<void> {
    await this.repository.delete(ids);
  }
}
