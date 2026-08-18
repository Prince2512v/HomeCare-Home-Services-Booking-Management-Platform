import { Injectable } from '@angular/core';

// session.service.ts
@Injectable({ providedIn: 'root' })
export class SessionService {
  private loggedIn      = false;
  private _currentUserId: number | null = null;
  private _isSuperAdmin = false;

  markLoggedIn(): void          { this.loggedIn = true; }
  isLoggedIn(): boolean         { return this.loggedIn; }
  setCurrentUser(id: number, isSuperAdmin: boolean): void {
    this._currentUserId = id;
    this._isSuperAdmin  = isSuperAdmin;
  }
  get currentUserId()  { return this._currentUserId; }
  get isSuperAdmin()   { return this._isSuperAdmin; }
  clearAll(): void {
    this.loggedIn       = false;
    this._currentUserId = null;
    this._isSuperAdmin  = false;
  }
}