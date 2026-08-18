import { Injectable } from '@angular/core';

const TOKEN_KEY = 'hc_token';

@Injectable({ providedIn: 'root' })
export class TokenService {
  save(token: string): void {
    if (token && token !== 'undefined' && token !== 'null') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  }

  get(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    return !token || token === 'undefined' || token === 'null' ? null : token;
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
  }
}