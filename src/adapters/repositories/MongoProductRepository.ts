import 'reflect-metadata';
import { injectable } from 'inversify';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { UserModel, EmbeddedProduct } from '@infrastructure/database/mongoose/UserModel';

// Adapter: MongoDB implementation of ProductRepository using embedded documents in User
@injectable()
export class MongoProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    // Find user that has this product in their products array
    const user = await UserModel.findOne({ 'products._id': id }).exec();
    if (!user) {
      return null;
    }
    const embeddedProduct = user.products.find((p) => p._id === id);
    if (!embeddedProduct) {
      return null;
    }
    return this.mapEmbeddedToProduct(user._id, embeddedProduct);
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      return [];
    }
    return user.products.map((p) => this.mapEmbeddedToProduct(userId, p));
  }

  async findAll(): Promise<Product[]> {
    const users = await UserModel.find({ 'products.0': { $exists: true } }).exec();
    const products: Product[] = [];
    for (const user of users) {
      for (const embeddedProduct of user.products) {
        products.push(this.mapEmbeddedToProduct(user._id, embeddedProduct));
      }
    }
    return products;
  }

  async save(product: Product): Promise<void> {
    const embeddedProduct: EmbeddedProduct = {
      _id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    // Try to update existing product in user's products array
    const updateResult = await UserModel.updateOne(
      { _id: product.userId, 'products._id': product.id },
      { $set: { 'products.$': embeddedProduct } },
    ).exec();

    // If product doesn't exist, push it to the array
    if (updateResult.matchedCount === 0) {
      await UserModel.updateOne(
        { _id: product.userId },
        { $push: { products: embeddedProduct } },
      ).exec();
    }
  }

  async deleteById(id: string): Promise<void> {
    await UserModel.updateOne(
      { 'products._id': id },
      { $pull: { products: { _id: id } } },
    ).exec();
  }

  private mapEmbeddedToProduct(userId: string, embedded: EmbeddedProduct): Product {
    return Product.create({
      id: embedded._id,
      userId,
      name: embedded.name,
      description: embedded.description,
      price: embedded.price,
      stock: embedded.stock,
      createdAt:
        embedded.createdAt instanceof Date ? embedded.createdAt : new Date(embedded.createdAt),
      updatedAt:
        embedded.updatedAt instanceof Date ? embedded.updatedAt : new Date(embedded.updatedAt),
    });
  }
}
