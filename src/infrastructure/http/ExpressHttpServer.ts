import 'reflect-metadata';
import { injectable } from 'inversify';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { HttpServer } from '@presentation/http/HttpServer';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { env } from '@infrastructure/config/env';

// Framework & Driver: Express HTTP server implementation
@injectable()
export class ExpressHttpServer implements HttpServer {
  private app = express();

  useJson(): void {
    this.app.use(express.json());
  }

  useCors(): void {
    const allowedOrigins = env.FRONTEND_URL
      ? env.FRONTEND_URL.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];

    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl requests) in development
          if (!origin || env.NODE_ENV !== 'production') {
            callback(null, true);
            return;
          }
          // In production, check against allowed origins
          if (allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );
  }

  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.get(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = {
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, unknown>,
        headers: req.headers as Record<string, string | string[] | undefined>,
      };
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
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.post(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = {
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, unknown>,
        headers: req.headers as Record<string, string | string[] | undefined>,
      };
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
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  delete(
    path: string,
    handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void,
  ): void {
    this.app.delete(path, async (req: Request, res: Response) => {
      const httpReq: HttpRequest = {
        body: req.body,
        params: req.params as Record<string, string>,
        query: req.query as Record<string, unknown>,
        headers: req.headers as Record<string, string | string[] | undefined>,
      };
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
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  listen(port: number, onListen: () => void): void {
    this.app.listen(port, onListen);
  }
}
