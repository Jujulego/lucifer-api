import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import validator from 'validator';

import { UserService } from 'users/user.service';

import { Daemon } from './daemon.entity';
import { daemonCreate, DaemonCreate } from './daemon.schema';
import { daemonUpdate, DaemonUpdate } from './daemon.schema';

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
    // Validate data
    const result = daemonCreate.validate(data);
    if (result.error) throw new BadRequestException(result.error.message);

    data = result.value;

    try {
      // Create daemon
      const daemon = this.repository.create();

      if (data.ownerId) {
        daemon.owner = await this.users.getLocal(data.ownerId);
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
      relations: ['owner']
    });

    if (!daemon) throw new NotFoundException(`Daemon ${id} not found`);

    return daemon;
  }

  async update(id: string, update: DaemonUpdate): Promise<Daemon> {
    // Get daemon
    const daemon = await this.get(id);

    // Validate data
    const result = daemonUpdate.validate(update);
    if (result.error) throw new BadRequestException(result.error.message);

    update = result.value;

    try {
      // Apply update
      if ('ownerId' in update) {
        if (!update.ownerId) {
          daemon.owner = undefined;
        } else {
          daemon.owner = await this.users.getLocal(update.ownerId);
        }
      }

      return await this.repository.save(daemon);
    } catch (error) {
      if (error instanceof HttpException) {
        if (error.getStatus() === 404) throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
