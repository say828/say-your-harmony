import { IStorage } from '../storage/interface.js';
import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
  ProductSearchParams,
  PaginationMeta,
} from '../types/index.js';
import { NotFoundError } from '../errors/index.js';

export class ProductService {
  constructor(private storage: IStorage) {}

  async create(input: ProductCreateInput): Promise<Product> {
    return this.storage.products.create(input);
  }

  async findById(id: string): Promise<Product> {
    const product = await this.storage.products.findById(id);
    if (!product || !product.isActive) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async findAll(params: { page?: number; pageSize?: number }): Promise<{
    products: Product[];
    meta: PaginationMeta;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    const allProducts = await this.storage.products.findAll(false);
    const totalCount = allProducts.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const products = allProducts.slice(start, end);

    return {
      products,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  async search(params: ProductSearchParams): Promise<{
    products: Product[];
    meta: PaginationMeta;
  }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;

    const allProducts = await this.storage.products.search({
      query: params.query,
      category: params.category,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
    });

    const totalCount = allProducts.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const products = allProducts.slice(start, end);

    return {
      products,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  async update(id: string, input: ProductUpdateInput): Promise<Product> {
    const product = await this.storage.products.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updated = await this.storage.products.update(id, input);
    if (!updated) {
      throw new NotFoundError('Product not found');
    }

    return updated;
  }

  async delete(id: string): Promise<void> {
    const success = await this.storage.products.delete(id);
    if (!success) {
      throw new NotFoundError('Product not found');
    }
  }
}
