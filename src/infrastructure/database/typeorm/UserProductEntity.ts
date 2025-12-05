import 'reflect-metadata';
import { Entity, PrimaryColumn, CreateDateColumn, Index } from 'typeorm';

// Framework & Driver: TypeORM join table entity for many-to-many user-product relationship
@Entity('user_products')
@Index(['userId', 'productId'], { unique: true })
export class UserProductEntity {
  @PrimaryColumn('uuid', { name: 'user_id' })
  userId!: string;

  @PrimaryColumn('uuid', { name: 'product_id' })
  productId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
}
