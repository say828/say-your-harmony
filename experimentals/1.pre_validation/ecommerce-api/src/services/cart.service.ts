import { IStorage } from '../storage/interface.js';
import {
  Cart,
  CartCreateInput,
  AddToCartInput,
  UpdateCartItemInput,
  CartSummary,
  CartItem,
} from '../types/index.js';
import { NotFoundError, CartExpiredError, ValidationError } from '../errors/index.js';

export class CartService {
  constructor(private storage: IStorage) {}

  async create(input: CartCreateInput): Promise<Cart> {
    return this.storage.carts.create(input);
  }

  async findById(id: string): Promise<Cart> {
    const cart = await this.storage.carts.findById(id);
    if (!cart) {
      throw new CartExpiredError('Cart not found or has expired');
    }
    return cart;
  }

  async getSummary(id: string): Promise<CartSummary> {
    const cart = await this.findById(id);

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      cart,
      itemCount,
      subtotal,
    };
  }

  async addItem(cartId: string, input: AddToCartInput): Promise<Cart> {
    const cart = await this.findById(cartId);

    // Get product details
    const product = await this.storage.products.findById(input.productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    // Check stock availability
    if (product.stock < input.quantity) {
      throw new ValidationError('Insufficient stock available');
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex((item) => item.productId === input.productId);

    if (existingItemIndex !== -1) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + input.quantity;

      if (newQuantity > 99) {
        throw new ValidationError('Maximum quantity per product is 99');
      }

      if (product.stock < newQuantity) {
        throw new ValidationError('Insufficient stock available');
      }

      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
        subtotal: existingItem.unitPrice * newQuantity,
      };
    } else {
      // Add new item (snapshot price)
      const newItem: CartItem = {
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: input.quantity,
        subtotal: product.price * input.quantity,
      };
      cart.items.push(newItem);
    }

    const updated = await this.storage.carts.update(cartId, { items: cart.items });
    if (!updated) {
      throw new NotFoundError('Cart not found');
    }

    return updated;
  }

  async updateItem(cartId: string, productId: string, input: UpdateCartItemInput): Promise<Cart> {
    const cart = await this.findById(cartId);

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    // Get product to check stock
    const product = await this.storage.products.findById(productId);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }

    if (product.stock < input.quantity) {
      throw new ValidationError('Insufficient stock available');
    }

    // Update quantity
    const item = cart.items[itemIndex];
    cart.items[itemIndex] = {
      ...item,
      quantity: input.quantity,
      subtotal: item.unitPrice * input.quantity,
    };

    const updated = await this.storage.carts.update(cartId, { items: cart.items });
    if (!updated) {
      throw new NotFoundError('Cart not found');
    }

    return updated;
  }

  async removeItem(cartId: string, productId: string): Promise<Cart> {
    const cart = await this.findById(cartId);

    const itemIndex = cart.items.findIndex((item) => item.productId === productId);
    if (itemIndex === -1) {
      throw new NotFoundError('Item not found in cart');
    }

    cart.items.splice(itemIndex, 1);

    const updated = await this.storage.carts.update(cartId, { items: cart.items });
    if (!updated) {
      throw new NotFoundError('Cart not found');
    }

    return updated;
  }

  async clear(cartId: string): Promise<Cart> {
    const cart = await this.findById(cartId);

    const updated = await this.storage.carts.update(cartId, { items: [] });
    if (!updated) {
      throw new NotFoundError('Cart not found');
    }

    return updated;
  }

  async delete(cartId: string): Promise<void> {
    const success = await this.storage.carts.delete(cartId);
    if (!success) {
      throw new NotFoundError('Cart not found');
    }
  }
}
