import 'reflect-metadata';
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

// Framework & Driver: TypeORM entity (database schema representation)
@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  email!: string;

  @Column({ type: 'varchar', name: 'password_hash' })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
