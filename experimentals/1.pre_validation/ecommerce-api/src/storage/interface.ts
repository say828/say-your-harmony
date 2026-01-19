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
  CreateOrderInput,
  UpdateStockInput,
} from '../types/index.js';

export interface IStorage {
  // User operations
  users: {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(input: UserCreateInput & { passwordHash: string }): Promise<User>;
    findAll(): Promise<User[]>;
  };

  // Product operations
  products: {
    findById(id: string): Promise<Product | null>;
    findAll(includeInactive?: boolean): Promise<Product[]>;
    create(input: ProductCreateInput): Promise<Product>;
    update(id: string, input: ProductUpdateInput): Promise<Product | null>;
    delete(id: string): Promise<boolean>;
    search(params: {
      query?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
    }): Promise<Product[]>;
  };

  // Cart operations
  carts: {
    findById(id: string): Promise<Cart | null>;
    create(input: CartCreateInput): Promise<Cart>;
    update(id: string, cart: Partial<Cart>): Promise<Cart | null>;
    delete(id: string): Promise<boolean>;
    cleanup(): Promise<number>;
  };

  // Order operations
  orders: {
    findById(id: string): Promise<Order | null>;
    findByUserId(userId: string): Promise<Order[]>;
    findAll(): Promise<Order[]>;
    create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
    update(id: string, order: Partial<Order>): Promise<Order | null>;
  };

  // Token blacklist
  tokens: {
    addToBlacklist(token: string): Promise<void>;
    isBlacklisted(token: string): Promise<boolean>;
  };

  // Inventory audit
  audit: {
    log(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<AuditEntry>;
    getByProductId(productId: string): Promise<AuditEntry[]>;
    getAll(): Promise<AuditEntry[]>;
  };
}
