import bcrypt from 'bcryptjs';
import validator from 'validator';

import { Context } from 'context';
import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { RightsService } from 'roles/rights.service';
import { Role } from 'roles/role.entity';

import { User } from './user.entity';
import { userCreate, UserCreate } from 'users/user.schema';
import { userUpdate, UserUpdate } from 'users/user.schema';
import { Token } from './token.entity';
import { TokenService } from './token.service';
import { LRN } from 'resources/lrn.model';

// Service
@Service()
export class UserService {
  // Constructor
  constructor(
    private database: DatabaseService,
    private tokens: TokenService,
    private rights: RightsService
  ) {}

  // Methods
  async create(data: UserCreate): Promise<User> {
    const rolRepo = this.database.connection.getRepository(Role);
    const usrRepo = this.repository;

    // Validate data
    const res = userCreate.validate(data);
    if (res.error) throw HttpError.BadRequest(res.error.message);

    data = res.value;

    // Create user
    const user = usrRepo.create();
    user.role = rolRepo.create();
    user.email = data.email.toLowerCase();
    user.password = data.password;
    user.daemons = [];
    user.tokens = [];
    user.rules = [];

    return await usrRepo.save(user);
  }

  async list(): Promise<User[]> {
    // Get user list
    return await this.repository.find({
      relations: ['role']
    });
  }

  async get(id: string, opts = { full: true }): Promise<User> {
    if (!validator.isUUID(id)) throw HttpError.NotFound();

    // Get user
    const user = await this.repository.findOne(id, {
      relations: opts.full ? ['role', 'tokens'] : []
    });

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return user;
  }

  async update(id: string, update: UserUpdate): Promise<User> {
    // Get user
    const user = await this.get(id);

    // Validate
    const res = userUpdate.validate(update);
    if (res.error) throw HttpError.BadRequest(res.error.message);
    update = res.value;

    return await this.database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);
      const tknRepo = manager.getRepository(Token);

      // Apply update
      if (update.email) user.email = update.email;
      if (update.password) {
        user.password = update.password;

        // Delete all tokens
        await tknRepo.delete({ user });
        user.tokens = [];
      }

      // Save
      return await usrRepo.save(user);
    });
  }

  async delete(ctx: Context, id: string) {
    await this.rights.allow(ctx.user.id, new LRN('user', id), { delete: true });
    await this.repository.delete(id);
  }

  async login(email: string, password: string): Promise<string> {
    // Get user and check credentials
    const user = await this.repository.findOne({
      where: { email }
    });

    if (!user) throw HttpError.Unauthorized();
    if (!await bcrypt.compare(password, user.password)) {
      throw HttpError.Unauthorized();
    }

    // Generate token
    const token = await this.tokens.create(user);
    return this.tokens.encrypt(token);
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(User);
  }
}
