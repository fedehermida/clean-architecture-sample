import 'reflect-metadata';
import { injectable } from 'inversify';
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyCors from '@fastify/cors';
import { HttpServer } from '@presentation/http/HttpServer';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { env } from '@infrastructure/config/env';

// Framework & Driver: Fastify HTTP server implementation
@injectable()
export class FastifyHttpServer implements HttpServer {
  private app: FastifyInstance;

  constructor() {
    this.app = fastify();
  }

  // Fastify parses JSON by default; keep method for interface symmetry
  useJson(): void {
    // no-op for Fastify
  }

  async useCors(): Promise<void> {
    const allowedOrigins = env.FRONTEND_URL
      ? env.FRONTEND_URL.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];

    await this.app.register(fastifyCors, {
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
          callback(new Error('Not allowed by CORS'), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });
  }

  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.get(path, async (request: FastifyRequest, reply: FastifyReply) => {
      const httpReq: HttpRequest = {
        body: request.body,
        params: (request.params as Record<string, string>) ?? {},
      };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          reply.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          reply.send(data);
        },
        send: (body: string) => {
          reply.send(body);
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void {
    this.app.post(path, async (request: FastifyRequest, reply: FastifyReply) => {
      const httpReq: HttpRequest = {
        body: request.body,
        params: (request.params as Record<string, string>) ?? {},
      };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          reply.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          reply.send(data);
        },
        send: (body: string) => {
          reply.send(body);
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  delete(
    path: string,
    handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void,
  ): void {
    this.app.delete(path, async (request: FastifyRequest, reply: FastifyReply) => {
      const httpReq: HttpRequest = {
        body: request.body,
        params: (request.params as Record<string, string>) ?? {},
      };
      const httpRes: HttpResponse = {
        status: (code: number) => {
          reply.status(code);
          return httpRes;
        },
        json: (data: unknown) => {
          reply.send(data);
        },
        send: (body: string) => {
          reply.send(body);
        },
      };
      await handler(httpReq, httpRes);
    });
  }

  listen(port: number, onListen: () => void): void {
    this.app.listen({ port, host: '0.0.0.0' }).then(() => onListen());
  }
}
