import { v4 as uuidv4 } from 'uuid';
import {
  User,
  Product,
  Cart,
  Order,
  AuditEntry,
  UserCreateInput,
  ProductCreateInput,
  ProductUpdateInput,
  CartCreateInput,
} from '../types/index.js';
import { IStorage } from './interface.js';
import { config } from '../config/index.js';

export class InMemoryStorage implements IStorage {
  private usersMap = new Map<string, User>();
  private productsMap = new Map<string, Product>();
  private cartsMap = new Map<string, Cart>();
  private ordersMap = new Map<string, Order>();
  private tokenBlacklist = new Set<string>();
  private auditLog: AuditEntry[] = [];

  // Indexes for faster lookups
  private userEmailIndex = new Map<string, string>(); // email -> userId
  private orderUserIndex = new Map<string, string[]>(); // userId -> orderIds[]

  constructor() {
    // Start cart cleanup interval
    this.startCartCleanup();
  }

  private startCartCleanup(): void {
    setInterval(() => {
      this.carts.cleanup();
    }, 60000); // Run every minute
  }

  users = {
    findById: async (id: string): Promise<User | null> => {
      return this.usersMap.get(id) || null;
    },

    findByEmail: async (email: string): Promise<User | null> => {
      const userId = this.userEmailIndex.get(email.toLowerCase());
      if (!userId) return null;
      return this.usersMap.get(userId) || null;
    },

    create: async (input: UserCreateInput & { passwordHash: string }): Promise<User> => {
      const user: User = {
        id: uuidv4(),
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        role: input.role || 'user',
        firstName: input.firstName,
        lastName: input.lastName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.usersMap.set(user.id, user);
      this.userEmailIndex.set(user.email, user.id);

      return user;
    },

    findAll: async (): Promise<User[]> => {
      return Array.from(this.usersMap.values());
    },
  };

  products = {
    findById: async (id: string): Promise<Product | null> => {
      return this.productsMap.get(id) || null;
    },

    findAll: async (includeInactive = false): Promise<Product[]> => {
      const products = Array.from(this.productsMap.values());
      if (includeInactive) {
        return products;
      }
      return products.filter((p) => p.isActive);
    },

    create: async (input: ProductCreateInput): Promise<Product> => {
      const product: Product = {
        id: uuidv4(),
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        imageUrl: input.imageUrl,
        stock: input.stock,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.productsMap.set(product.id, product);
      return product;
    },

    update: async (id: string, input: ProductUpdateInput): Promise<Product | null> => {
      const product = this.productsMap.get(id);
      if (!product) return null;

      const updated: Product = {
        ...product,
        ...input,
        updatedAt: new Date().toISOString(),
      };

      this.productsMap.set(id, updated);
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      const product = this.productsMap.get(id);
      if (!product) return false;

      // Soft delete
      product.isActive = false;
      product.updatedAt = new Date().toISOString();
      this.productsMap.set(id, product);

      return true;
    },

    search: async (params: {
      query?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }): Promise<Product[]> => {
      let products = Array.from(this.productsMap.values()).filter((p) => p.isActive);

      if (params.query) {
        const query = params.query.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
        );
      }

      if (params.category) {
        products = products.filter((p) => p.category === params.category);
      }

      if (params.minPrice !== undefined) {
        products = products.filter((p) => p.price >= params.minPrice!);
      }

      if (params.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= params.maxPrice!);
      }

      return products;
    },
  };

  carts = {
    findById: async (id: string): Promise<Cart | null> => {
      const cart = this.cartsMap.get(id);
      if (!cart) return null;

      // Check expiration
      if (new Date(cart.expiresAt) < new Date()) {
        this.cartsMap.delete(id);
        return null;
      }

      return cart;
    },

    create: async (input: CartCreateInput): Promise<Cart> => {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + config.business.cartExpiryHours);

      const cart: Cart = {
        id: uuidv4(),
        sessionId: input.sessionId,
        userId: input.userId,
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      this.cartsMap.set(cart.id, cart);
      return cart;
    },

    update: async (id: string, updates: Partial<Cart>): Promise<Cart | null> => {
      const cart = await this.carts.findById(id);
      if (!cart) return null;

      const updated: Cart = {
        ...cart,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.cartsMap.set(id, updated);
      return updated;
    },

    delete: async (id: string): Promise<boolean> => {
      return this.cartsMap.delete(id);
    },

    cleanup: async (): Promise<number> => {
      const now = new Date();
      let count = 0;

      for (const [id, cart] of this.cartsMap) {
        if (new Date(cart.expiresAt) < now) {
          this.cartsMap.delete(id);
          count++;
        }
      }

      return count;
    },
  };

  orders = {
    findById: async (id: string): Promise<Order | null> => {
      return this.ordersMap.get(id) || null;
    },

    findByUserId: async (userId: string): Promise<Order[]> => {
      const orderIds = this.orderUserIndex.get(userId) || [];
      return orderIds
        .map((id) => this.ordersMap.get(id))
        .filter((order): order is Order => order !== undefined);
    },

    findAll: async (): Promise<Order[]> => {
      return Array.from(this.ordersMap.values());
    },

    create: async (input: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
      const order: Order = {
        ...input,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.ordersMap.set(order.id, order);

      // Update user index
      const userOrders = this.orderUserIndex.get(order.userId) || [];
      userOrders.push(order.id);
      this.orderUserIndex.set(order.userId, userOrders);

      return order;
    },

    update: async (id: string, updates: Partial<Order>): Promise<Order | null> => {
      const order = this.ordersMap.get(id);
      if (!order) return null;

      const updated: Order = {
        ...order,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      this.ordersMap.set(id, updated);
      return updated;
    },
  };

  tokens = {
    addToBlacklist: async (token: string): Promise<void> => {
      this.tokenBlacklist.add(token);
    },

    isBlacklisted: async (token: string): Promise<boolean> => {
      return this.tokenBlacklist.has(token);
    },
  };

  audit = {
    log: async (
      entry: Omit<AuditEntry, 'id' | 'timestamp'>
    ): Promise<AuditEntry> => {
      const auditEntry: AuditEntry = {
        ...entry,
        id: uuidv4(),
        timestamp: new Date().toISOString(),
      };

      this.auditLog.push(auditEntry);
      return auditEntry;
    },

    getByProductId: async (productId: string): Promise<AuditEntry[]> => {
      return this.auditLog.filter((entry) => entry.productId === productId);
    },

    getAll: async (): Promise<AuditEntry[]> => {
      return [...this.auditLog];
    },
  };
}
