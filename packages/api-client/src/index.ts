export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export class LacLacApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token?: string,
  ) {}

  private headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async getFoods(): Promise<ApiResponse<unknown[]>> {
    const response = await fetch(`${this.baseUrl}/foods`, {
      headers: this.headers(),
    });
    return (await response.json()) as ApiResponse<unknown[]>;
  }

  async getRandomFood(filters?: Record<string, string>): Promise<ApiResponse<unknown>> {
    const params = new URLSearchParams(filters ?? {}).toString();
    const url = `${this.baseUrl}/foods/random${params ? `?${params}` : ''}`;

    const response = await fetch(url, {
      headers: this.headers(),
    });

    return (await response.json()) as ApiResponse<unknown>;
  }

  async logAction(payload: Record<string, unknown>): Promise<ApiResponse<unknown>> {
    const response = await fetch(`${this.baseUrl}/actions`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(payload),
    });

    return (await response.json()) as ApiResponse<unknown>;
  }
}
