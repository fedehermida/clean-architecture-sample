import { Pool } from 'pg';
import { User } from '@domain/entities/User';
import { UserRepository } from '@domain/repositories/UserRepository';

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE id = $1',
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]!);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = $1',
      [email],
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToUser(result.rows[0]!);
  }

  async save(user: User): Promise<void> {
    await this.pool.query(
      `INSERT INTO users (id, email, password_hash, created_at)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         password_hash = EXCLUDED.password_hash`,
      [user.id, user.email, user.passwordHash, user.createdAt],
    );
  }

  async deleteById(id: string): Promise<void> {
    await this.pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  private mapRowToUser(row: {
    id: string;
    email: string;
    password_hash: string;
    created_at: Date | string;
  }): User {
    return User.create({
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at instanceof Date ? row.created_at : new Date(row.created_at),
    });
  }
}
