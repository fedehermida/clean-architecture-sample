import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { ProductEntity } from '@infrastructure/database/typeorm/ProductEntity';
import { TYPES } from '@infrastructure/di/types';

// Adapter: TypeORM implementation of ProductRepository
@injectable()
export class TypeOrmProductRepository implements ProductRepository {
  private repository: Repository<ProductEntity>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(ProductEntity);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapEntityToProduct(entity);
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const entities = await this.repository.find({ where: { userId } });
    return entities.map((entity) => this.mapEntityToProduct(entity));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.mapEntityToProduct(entity));
  }

  async save(product: Product): Promise<void> {
    const entity = this.mapProductToEntity(product);
    await this.repository.save(entity);
  }

  async deleteById(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private mapEntityToProduct(entity: ProductEntity): Product {
    return Product.create({
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      stock: entity.stock,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private mapProductToEntity(product: Product): ProductEntity {
    const entity = new ProductEntity();
    entity.id = product.id;
    entity.userId = product.userId;
    entity.name = product.name;
    entity.description = product.description;
    entity.price = product.price;
    entity.stock = product.stock;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }
}
