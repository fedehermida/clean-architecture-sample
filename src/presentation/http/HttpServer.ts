import { HttpRequest, HttpResponse } from './HttpTypes';

// Presentation/Interface Adapter: HTTP Server abstraction (framework-agnostic interface)
export interface HttpServer {
  useJson(): void;
  useCors(): void | Promise<void>;
  get(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  post(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  delete(path: string, handler: (req: HttpRequest, res: HttpResponse) => Promise<void> | void): void;
  listen(port: number, onListen: () => void): void;
}


