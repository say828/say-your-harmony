import { IStorage } from '../storage/interface.js';
import { Product, UpdateStockInput, LowStockProduct, AuditEntry } from '../types/index.js';
import { NotFoundError, ValidationError } from '../errors/index.js';
import { config } from '../config/index.js';

export class InventoryService {
  constructor(private storage: IStorage) {}

  async getStock(productId: string): Promise<{ productId: string; stock: number }> {
    const product = await this.storage.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return {
      productId: product.id,
      stock: product.stock,
    };
  }

  async updateStock(productId: string, input: UpdateStockInput, userId?: string): Promise<Product> {
    const product = await this.storage.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const quantityBefore = product.stock;
    const quantityAfter = input.quantity;
    const quantityChange = quantityAfter - quantityBefore;

    // Update product stock
    const updated = await this.storage.products.update(productId, {
      stock: input.quantity,
    });

    if (!updated) {
      throw new NotFoundError('Product not found');
    }

    // Log audit entry
    await this.storage.audit.log({
      productId,
      action: 'set',
      quantityBefore,
      quantityAfter,
      quantityChange,
      userId,
      reason: input.reason,
    });

    return updated;
  }

  async decrementStock(
    productId: string,
    quantity: number,
    orderId?: string,
    userId?: string
  ): Promise<boolean> {
    const product = await this.storage.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < quantity) {
      return false; // Insufficient stock
    }

    const quantityBefore = product.stock;
    const quantityAfter = quantityBefore - quantity;

    await this.storage.products.update(productId, {
      stock: quantityAfter,
    });

    // Log audit entry
    await this.storage.audit.log({
      productId,
      action: orderId ? 'order_created' : 'decrement',
      quantityBefore,
      quantityAfter,
      quantityChange: -quantity,
      userId,
      orderId,
    });

    return true;
  }

  async incrementStock(
    productId: string,
    quantity: number,
    orderId?: string,
    userId?: string
  ): Promise<void> {
    const product = await this.storage.products.findById(productId);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const quantityBefore = product.stock;
    const quantityAfter = quantityBefore + quantity;

    await this.storage.products.update(productId, {
      stock: quantityAfter,
    });

    // Log audit entry
    await this.storage.audit.log({
      productId,
      action: orderId ? 'order_cancelled' : 'increment',
      quantityBefore,
      quantityAfter,
      quantityChange: quantity,
      userId,
      orderId,
    });
  }

  async getLowStockProducts(): Promise<LowStockProduct[]> {
    const allProducts = await this.storage.products.findAll(false);
    const threshold = config.business.lowStockThreshold;

    return allProducts
      .filter((product) => product.stock < threshold)
      .map((product) => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock,
        threshold,
      }));
  }

  async getAuditLog(productId?: string): Promise<AuditEntry[]> {
    if (productId) {
      return this.storage.audit.getByProductId(productId);
    }
    return this.storage.audit.getAll();
  }
}
