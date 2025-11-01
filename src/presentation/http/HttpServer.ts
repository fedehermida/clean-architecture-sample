import { HttpRequest, HttpResponse } from './HttpTypes';

export interface HttpServer {
  useJson(): void;
  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  delete(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  listen(port: number, onListen: () => void): void;
}


