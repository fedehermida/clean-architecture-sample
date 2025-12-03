// Presentation/Interface Adapter: HTTP abstraction types (framework-agnostic)
export interface HttpRequest {
  body: unknown;
  params: Record<string, string>;
  query: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
}

export interface HttpResponse {
  status(code: number): HttpResponse;
  json(data: unknown): void;
  send(body: string): void;
}


