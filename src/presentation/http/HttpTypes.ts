// Presentation/Interface Adapter: HTTP abstraction types (framework-agnostic)
export interface HttpRequest {
  body: unknown;
  params: Record<string, string>;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: unknown): void;
  send(body: string): void;
}


