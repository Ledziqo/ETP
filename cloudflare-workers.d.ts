declare module "cloudflare:workers" {
  export const env: any;
}

declare interface Fetcher {
  fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}

declare interface D1Database {
  prepare(query: string): unknown;
}
