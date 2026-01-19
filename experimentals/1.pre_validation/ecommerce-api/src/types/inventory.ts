export type AuditAction = 'increment' | 'decrement' | 'set' | 'order_created' | 'order_cancelled';

export interface AuditEntry {
  id: string;
  productId: string;
  action: AuditAction;
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  userId?: string;
  orderId?: string;
  reason?: string;
  timestamp: string;
}

export interface UpdateStockInput {
  quantity: number;
  reason?: string;
}

export interface LowStockProduct {
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
}
