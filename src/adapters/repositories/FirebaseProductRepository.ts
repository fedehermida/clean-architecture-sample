import 'reflect-metadata';
import { injectable } from 'inversify';
import { Product } from '@domain/entities/Product';
import { ProductRepository } from '@domain/repositories/ProductRepository';
import { firestore } from '@infrastructure/database/firestore/connection';

// Embedded product interface for Firestore
interface EmbeddedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Adapter: Firestore implementation of ProductRepository using embedded documents in User
@injectable()
export class FirebaseProductRepository implements ProductRepository {
  private readonly collection = firestore.collection('users');

  async findById(id: string): Promise<Product | null> {
    // Query all users and find the one containing this product
    const snapshot = await this.collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const products = (data['products'] as EmbeddedProduct[]) || [];
      const embeddedProduct = products.find((p) => p.id === id);
      if (embeddedProduct) {
        return this.mapEmbeddedToProduct(doc.id, embeddedProduct);
      }
    }
    return null;
  }

  async findByUserId(userId: string): Promise<Product[]> {
    const doc = await this.collection.doc(userId).get();
    if (!doc.exists) {
      return [];
    }
    const data = doc.data();
    const products = (data?.['products'] as EmbeddedProduct[]) || [];
    return products.map((p) => this.mapEmbeddedToProduct(userId, p));
  }

  async findAll(): Promise<Product[]> {
    const snapshot = await this.collection.get();
    const products: Product[] = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const embeddedProducts = (data['products'] as EmbeddedProduct[]) || [];
      for (const embeddedProduct of embeddedProducts) {
        products.push(this.mapEmbeddedToProduct(doc.id, embeddedProduct));
      }
    }
    return products;
  }

  async save(product: Product): Promise<void> {
    const embeddedProduct: EmbeddedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };

    const userDoc = this.collection.doc(product.userId);
    const doc = await userDoc.get();

    if (!doc.exists) {
      return; // User doesn't exist, can't add product
    }

    const data = doc.data();
    const products = (data?.['products'] as EmbeddedProduct[]) || [];

    // Check if product already exists
    const existingIndex = products.findIndex((p) => p.id === product.id);
    if (existingIndex >= 0) {
      // Update existing product
      products[existingIndex] = embeddedProduct;
    } else {
      // Add new product
      products.push(embeddedProduct);
    }

    await userDoc.update({ products });
  }

  async deleteById(id: string): Promise<void> {
    // Find the user containing this product
    const snapshot = await this.collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const products = (data['products'] as EmbeddedProduct[]) || [];
      const productIndex = products.findIndex((p) => p.id === id);
      if (productIndex >= 0) {
        products.splice(productIndex, 1);
        await this.collection.doc(doc.id).update({ products });
        return;
      }
    }
  }

  private mapEmbeddedToProduct(userId: string, embedded: EmbeddedProduct): Product {
    return Product.create({
      id: embedded.id,
      userId,
      name: embedded.name,
      description: embedded.description,
      price: embedded.price,
      stock: embedded.stock,
      createdAt:
        embedded.createdAt instanceof Date
          ? embedded.createdAt
          : (embedded.createdAt as FirebaseFirestore.Timestamp)?.toDate?.() ??
            new Date(embedded.createdAt),
      updatedAt:
        embedded.updatedAt instanceof Date
          ? embedded.updatedAt
          : (embedded.updatedAt as FirebaseFirestore.Timestamp)?.toDate?.() ??
            new Date(embedded.updatedAt),
    });
  }
}
