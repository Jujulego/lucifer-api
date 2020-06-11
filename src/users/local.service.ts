import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LocalUser } from './local.entity';

// Type
export type RequiredFields = Pick<LocalUser, 'id' | 'email' | 'name'>;

export interface GetLocalUserOptions {
  full?: boolean
}

// Service
@Injectable()
export class LocalUserService {
  // Attributes
  entity = LocalUser;

  // Constructor
  constructor(
    @InjectRepository(LocalUser) private repository: Repository<LocalUser>
  ) {}

  // Methods
  async create(data: RequiredFields): Promise<LocalUser> {
    // Create user
    const user = this.repository.create({
      id:    data.id,
      email: data.email,
      name:  data.name
    });
    user.daemons = [];

    return await this.repository.save(user);
  }

  async list(): Promise<LocalUser[]> {
    return await this.repository.find({
      relations: ['daemons'],
      order: { id: 'ASC' }
    });
  }

  async get(id: string, opts: GetLocalUserOptions = {}): Promise<LocalUser | null> {
    const { full = true } = opts;

    // Get user
    const user = await this.repository.findOne({
      relations: full ? ['daemons'] : [],
      where: { id }
    });

    return user || null;
  }

  async getOrCreate(id: string, data: RequiredFields): Promise<LocalUser> {
    // Get user
    const user = await this.get(id);

    // Create if not found
    if (!user) return this.create(data);

    return user;
  }
}
