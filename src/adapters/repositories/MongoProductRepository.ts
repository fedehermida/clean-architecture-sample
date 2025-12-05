import 'reflect-metadata';
import { injectable } from 'inversify';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { UserModel, EmbeddedProduct } from '@infrastructure/database/mongoose/UserModel';

// Adapter: MongoDB implementation of ProductRepository with many-to-many support
// Products are embedded in user documents - same product can exist in multiple users (data duplication)
// This is the MongoDB-idiomatic approach prioritizing query performance over data normalization
@injectable()
export class MongoProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    // Find any user that has this product (products are duplicated across users)
    const user = await UserModel.findOne({ 'products._id': id }).exec();
    if (!user) {
      return null;
    }
    const embeddedProduct = user.products.find((p) => p._id === id);
    if (!embeddedProduct) {
      return null;
    }
    return this.mapEmbeddedToProduct(embeddedProduct);
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      return [];
    }
    return user.products.map((p) => this.mapEmbeddedToProduct(p));
  }

  async findAll(): Promise<Product[]> {
    // Get all unique products across all users
    const users = await UserModel.find({ 'products.0': { $exists: true } }).exec();
    const productMap = new Map<string, Product>();

    for (const user of users) {
      for (const embeddedProduct of user.products) {
        // Use Map to deduplicate products by ID
        if (!productMap.has(embeddedProduct._id)) {
          productMap.set(embeddedProduct._id, this.mapEmbeddedToProduct(embeddedProduct));
        }
      }
    }

    return Array.from(productMap.values());
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

    // Update product in ALL users who have it (maintain consistency across duplicates)
    await UserModel.updateMany(
      { 'products._id': product.id },
      { $set: { 'products.$': embeddedProduct } },
    ).exec();
  }

  async deleteById(id: string): Promise<void> {
    // Remove product from ALL users who have it
    await UserModel.updateMany(
      { 'products._id': id },
      { $pull: { products: { _id: id } } },
    ).exec();
  }

  async associateWithUser(productId: string, userId: string, product?: Product): Promise<void> {
    let embeddedProduct: EmbeddedProduct | undefined;

    if (product) {
      // Use the provided product (for new product creation)
      embeddedProduct = {
        _id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    } else {
      // Find an existing copy of this product from any user
      const userWithProduct = await UserModel.findOne({ 'products._id': productId }).exec();
      if (userWithProduct) {
        embeddedProduct = userWithProduct.products.find((p) => p._id === productId);
      }
    }

    if (!embeddedProduct) {
      // Product doesn't exist anywhere - cannot associate
      return;
    }

    // Check if user already has this product
    const targetUser = await UserModel.findById(userId).exec();
    if (!targetUser) {
      return;
    }

    const alreadyHas = targetUser.products.some((p) => p._id === productId);
    if (!alreadyHas) {
      // Add a copy of the product to this user's embedded products
      await UserModel.updateOne({ _id: userId }, { $push: { products: embeddedProduct } }).exec();
    }
  }

  async disassociateFromUser(productId: string, userId: string): Promise<void> {
    // Remove product from specific user only
    await UserModel.updateOne({ _id: userId }, { $pull: { products: { _id: productId } } }).exec();
  }

  private mapEmbeddedToProduct(embedded: EmbeddedProduct): Product {
    return Product.create({
      id: embedded._id,
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
