import express, { Request, Response } from 'express';
import { HttpServer } from '@presentation/http/HttpServer';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';

export class ExpressHttpServer implements HttpServer {
  private app = express();

  useJson(): void {
    this.app.use(express.json());
  }

  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.get(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = { body: req.body, params: req.params as Record<string, string> };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          res.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          res.json(data);
        },
        send: (body: string) => {
          res.send(body);
        }
      };
      await handler(httpReq, httpRes);
    });
  }

  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.post(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = { body: req.body, params: req.params as Record<string, string> };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          res.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          res.json(data);
        },
        send: (body: string) => {
          res.send(body);
        }
      };
      await handler(httpReq, httpRes);
    });
  }

  delete(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.delete(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = { body: req.body, params: req.params as Record<string, string> };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          res.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          res.json(data);
        },
        send: (body: string) => {
          res.send(body);
        }
      };
      await handler(httpReq, httpRes);
    });
  }

  listen(port: number, onListen: () => void): void {
    this.app.listen(port, onListen);
  }
}


