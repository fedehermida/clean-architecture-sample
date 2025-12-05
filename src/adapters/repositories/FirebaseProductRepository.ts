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

// Adapter: Firestore implementation of ProductRepository with many-to-many support
// Products are embedded in user documents - same product can exist in multiple users (data duplication)
// This follows the Firestore-idiomatic approach prioritizing query performance over data normalization
@injectable()
export class FirebaseProductRepository implements ProductRepository {
  private readonly collection = firestore.collection('users');

  async findById(id: string): Promise<Product | null> {
    // Query all users and find one containing this product
    const snapshot = await this.collection.get();
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const products = (data['products'] as EmbeddedProduct[]) || [];
      const embeddedProduct = products.find((p) => p.id === id);
      if (embeddedProduct) {
        return this.mapEmbeddedToProduct(embeddedProduct);
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
    return products.map((p) => this.mapEmbeddedToProduct(p));
  }

  async findAll(): Promise<Product[]> {
    // Get all unique products across all users
    const snapshot = await this.collection.get();
    const productMap = new Map<string, Product>();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const embeddedProducts = (data['products'] as EmbeddedProduct[]) || [];
      for (const embeddedProduct of embeddedProducts) {
        // Use Map to deduplicate products by ID
        if (!productMap.has(embeddedProduct.id)) {
          productMap.set(embeddedProduct.id, this.mapEmbeddedToProduct(embeddedProduct));
        }
      }
    }

    return Array.from(productMap.values());
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

    // Update product in ALL users who have it (maintain consistency across duplicates)
    const snapshot = await this.collection.get();
    const batch = firestore.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const products = (data['products'] as EmbeddedProduct[]) || [];
      const existingIndex = products.findIndex((p) => p.id === product.id);

      if (existingIndex >= 0) {
        products[existingIndex] = embeddedProduct;
        batch.update(this.collection.doc(doc.id), { products });
      }
    }

    await batch.commit();
  }

  async deleteById(id: string): Promise<void> {
    // Remove product from ALL users who have it
    const snapshot = await this.collection.get();
    const batch = firestore.batch();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const products = (data['products'] as EmbeddedProduct[]) || [];
      const productIndex = products.findIndex((p) => p.id === id);

      if (productIndex >= 0) {
        products.splice(productIndex, 1);
        batch.update(this.collection.doc(doc.id), { products });
      }
    }

    await batch.commit();
  }

  async associateWithUser(productId: string, userId: string, product?: Product): Promise<void> {
    let embeddedProduct: EmbeddedProduct | null = null;

    if (product) {
      // Use the provided product (for new product creation)
      embeddedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      };
    } else {
      // Find an existing copy of this product from any user
      const snapshot = await this.collection.get();
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const products = (data['products'] as EmbeddedProduct[]) || [];
        const found = products.find((p) => p.id === productId);
        if (found) {
          embeddedProduct = found;
          break;
        }
      }
    }

    if (!embeddedProduct) {
      // Product doesn't exist anywhere - cannot associate
      return;
    }

    // Check if target user exists and doesn't already have this product
    const userDoc = await this.collection.doc(userId).get();
    if (!userDoc.exists) {
      return;
    }

    const userData = userDoc.data();
    const userProducts = (userData?.['products'] as EmbeddedProduct[]) || [];
    const alreadyHas = userProducts.some((p) => p.id === productId);

    if (!alreadyHas) {
      // Add a copy of the product to this user's embedded products
      userProducts.push(embeddedProduct);
      await this.collection.doc(userId).update({ products: userProducts });
    }
  }

  async disassociateFromUser(productId: string, userId: string): Promise<void> {
    // Remove product from specific user only
    const userDoc = await this.collection.doc(userId).get();
    if (!userDoc.exists) {
      return;
    }

    const data = userDoc.data();
    const products = (data?.['products'] as EmbeddedProduct[]) || [];
    const filteredProducts = products.filter((p) => p.id !== productId);

    if (filteredProducts.length !== products.length) {
      await this.collection.doc(userId).update({ products: filteredProducts });
    }
  }

  private mapEmbeddedToProduct(embedded: EmbeddedProduct): Product {
    return Product.create({
      id: embedded.id,
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
