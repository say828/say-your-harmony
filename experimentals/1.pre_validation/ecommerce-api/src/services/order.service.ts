import { IStorage } from '../storage/interface.js';
import {
  Order,
  CreateOrderInput,
  UpdateOrderStatusInput,
  OrderStatus,
  ORDER_STATUS_TRANSITIONS,
  OrderItem,
} from '../types/index.js';
import {
  NotFoundError,
  ValidationError,
  ForbiddenError,
  InvalidStatusTransitionError,
  InsufficientStockError,
} from '../errors/index.js';
import { config } from '../config/index.js';
import { InventoryService } from './inventory.service.js';

export class OrderService {
  constructor(
    private storage: IStorage,
    private inventoryService: InventoryService
  ) {}

  async create(userId: string, input: CreateOrderInput): Promise<Order> {
    // Get cart
    const cart = await this.storage.carts.findById(input.cartId);
    if (!cart) {
      throw new NotFoundError('Cart not found or has expired');
    }

    if (cart.items.length === 0) {
      throw new ValidationError('Cart is empty');
    }

    // Convert cart items to order items
    const orderItems: OrderItem[] = cart.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * config.business.taxRate;
    const total = subtotal + tax;

    // Try to decrement inventory for all items
    const inventoryUpdates: Array<{ productId: string; quantity: number }> = [];

    try {
      for (const item of orderItems) {
        const success = await this.inventoryService.decrementStock(
          item.productId,
          item.quantity,
          undefined, // orderId will be set after order creation
          userId
        );

        if (!success) {
          // Rollback previous inventory updates
          for (const update of inventoryUpdates) {
            await this.inventoryService.incrementStock(update.productId, update.quantity, undefined, userId);
          }

          const product = await this.storage.products.findById(item.productId);
          throw new InsufficientStockError(
            item.productName,
            product?.stock || 0,
            item.quantity
          );
        }

        inventoryUpdates.push({ productId: item.productId, quantity: item.quantity });
      }

      // Create order
      const order = await this.storage.orders.create({
        userId,
        items: orderItems,
        status: 'pending',
        subtotal,
        tax,
        total,
        shippingAddress: input.shippingAddress,
      });

      // Delete cart after successful order creation
      await this.storage.carts.delete(input.cartId);

      return order;
    } catch (error) {
      // If it's not an insufficient stock error, rollback inventory
      if (!(error instanceof InsufficientStockError)) {
        for (const update of inventoryUpdates) {
          await this.inventoryService.incrementStock(update.productId, update.quantity, undefined, userId);
        }
      }
      throw error;
    }
  }

  async findById(id: string, userId?: string, isAdmin = false): Promise<Order> {
    const order = await this.storage.orders.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership (only owner or admin can view)
    if (!isAdmin && userId && order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.storage.orders.findByUserId(userId);
  }

  async findAll(): Promise<Order[]> {
    return this.storage.orders.findAll();
  }

  async updateStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    userId?: string
  ): Promise<Order> {
    const order = await this.storage.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(input.status)) {
      throw new InvalidStatusTransitionError(order.status, input.status);
    }

    // Update order status
    const updated = await this.storage.orders.update(orderId, {
      status: input.status,
    });

    if (!updated) {
      throw new NotFoundError('Order not found');
    }

    return updated;
  }

  async cancel(orderId: string, userId: string, isAdmin = false): Promise<Order> {
    const order = await this.storage.orders.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check ownership (only owner or admin can cancel)
    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this order');
    }

    // Check if cancellation is allowed
    const allowedStatuses: OrderStatus[] = ['pending', 'confirmed', 'processing'];
    if (!allowedStatuses.includes(order.status)) {
      throw new ValidationError(`Cannot cancel order in ${order.status} status`);
    }

    // Restore inventory
    for (const item of order.items) {
      await this.inventoryService.incrementStock(
        item.productId,
        item.quantity,
        orderId,
        userId
      );
    }

    // Update order status
    const updated = await this.storage.orders.update(orderId, {
      status: 'cancelled',
    });

    if (!updated) {
      throw new NotFoundError('Order not found');
    }

    return updated;
  }
}
