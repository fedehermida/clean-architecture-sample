import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { CreateProduct } from '@application/use-cases/CreateProduct';
import { GetProductById } from '@application/use-cases/GetProductById';
import { ListProducts } from '@application/use-cases/ListProducts';
import { DeleteProduct } from '@application/use-cases/DeleteProduct';

// Interface Adapter: HTTP controller adapting HTTP layer to Application layer (use cases)
export class ProductController {
  constructor(
    private readonly createProduct: CreateProduct,
    private readonly getProductById: GetProductById,
    private readonly listProducts: ListProducts,
    private readonly deleteProduct: DeleteProduct,
  ) {}

  async create(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.createProduct.execute(
      req.body as { name: string; description: string; price: number; stock: number },
    );
    if (!result.ok) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    res.status(201).json(result.value);
  }

  async getById(req: HttpRequest, res: HttpResponse): Promise<void> {
    const productId = req.params['id'];
    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    const result = await this.getProductById.execute({ productId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async list(_req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.listProducts.execute();
    if (!result.ok) {
      res.status(500).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  async delete(req: HttpRequest, res: HttpResponse): Promise<void> {
    const productId = req.params['id'] as string;
    const result = await this.deleteProduct.execute({ productId });
    if (!result.ok) {
      res.status(404).json({ error: result.error.message });
      return;
    }
    res.status(204).send('');
  }
}
