import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { HttpServer } from '@presentation/http/HttpServer';
import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';

export class FastifyHttpServer implements HttpServer {
  private app: FastifyInstance;

  constructor() {
    this.app = fastify();
  }

  // Fastify parses JSON by default; keep method for interface symmetry
  useJson(): void {
    // no-op for Fastify
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
