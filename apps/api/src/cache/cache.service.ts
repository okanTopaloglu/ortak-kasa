import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client: Redis | null = null;

  private getClient(): Redis | null {
    if (!process.env.REDIS_URL) return null;
    if (!this.client) {
      try {
        this.client = new Redis(process.env.REDIS_URL, {
          connectTimeout: 1500,
          maxRetriesPerRequest: 0,
          enableReadyCheck: true,
          retryStrategy: () => null,
        });
      } catch {
        return null;
      }
    }
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const client = this.getClient();
    if (!client) return null;
    try {
      const data = await Promise.race([
        client.get(key),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('cache_timeout')), 2000)
        ),
      ]);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 600): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      await client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  async del(key: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    try {
      await client.del(key);
    } catch {
      // ignore
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}
