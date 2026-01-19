export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  sessionId?: string;
  userId?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface CartCreateInput {
  sessionId?: string;
  userId?: string;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface CartSummary {
  cart: Cart;
  itemCount: number;
  subtotal: number;
}
