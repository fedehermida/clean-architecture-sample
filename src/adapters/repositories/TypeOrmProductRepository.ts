import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { DataSource, Repository } from 'typeorm';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { ProductEntity } from '@infrastructure/database/typeorm/ProductEntity';
import { UserProductEntity } from '@infrastructure/database/typeorm/UserProductEntity';
import { TYPES } from '@infrastructure/di/types';

// Adapter: TypeORM implementation of ProductRepository with many-to-many user-product support
@injectable()
export class TypeOrmProductRepository implements ProductRepository {
  private productRepository: Repository<ProductEntity>;
  private userProductRepository: Repository<UserProductEntity>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(ProductEntity);
    this.userProductRepository = dataSource.getRepository(UserProductEntity);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.productRepository.findOne({ where: { id } });
    if (!entity) {
      return null;
    }
    return this.mapEntityToProduct(entity);
  }

  async findByUserId(userId: string): Promise<Product[]> {
    // Query through the join table to find all products associated with a user
    const userProducts = await this.userProductRepository.find({ where: { userId } });
    const productIds = userProducts.map((up) => up.productId);

    if (productIds.length === 0) {
      return [];
    }

    const entities = await this.productRepository
      .createQueryBuilder('product')
      .whereInIds(productIds)
      .getMany();

    return entities.map((entity) => this.mapEntityToProduct(entity));
  }

  async findAll(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map((entity) => this.mapEntityToProduct(entity));
  }

  async save(product: Product): Promise<void> {
    const entity = this.mapProductToEntity(product);
    await this.productRepository.save(entity);
  }

  async deleteById(id: string): Promise<void> {
    // First remove all user-product associations
    await this.userProductRepository.delete({ productId: id });
    // Then delete the product
    await this.productRepository.delete(id);
  }

  async associateWithUser(productId: string, userId: string, _product?: Product): Promise<void> {
    // product parameter is optional and unused for TypeORM (product already saved via save())
    // Check if association already exists
    const existing = await this.userProductRepository.findOne({
      where: { userId, productId },
    });

    if (!existing) {
      const userProduct = new UserProductEntity();
      userProduct.userId = userId;
      userProduct.productId = productId;
      await this.userProductRepository.save(userProduct);
    }
  }

  async disassociateFromUser(productId: string, userId: string): Promise<void> {
    await this.userProductRepository.delete({ userId, productId });
  }

  private mapEntityToProduct(entity: ProductEntity): Product {
    return Product.create({
      id: entity.id,
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
    entity.name = product.name;
    entity.description = product.description;
    entity.price = product.price;
    entity.stock = product.stock;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }
}
