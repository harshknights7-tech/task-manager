import { Injectable, signal } from '@angular/core';
import { ApiService, User, Family } from '../services/api.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly USER_KEY = 'task_manager_user';
  
  readonly isAuthenticated = signal(false);
  readonly currentUser = signal<User | null>(null);
  readonly currentFamily = signal<Family | null>(null);
  private readonly FAMILY_KEY = 'currentFamily';

  constructor(private apiService: ApiService) {
    this.checkAuthState();
  }

  checkAuthState() {
    const userData = localStorage.getItem(this.USER_KEY);
    const token = localStorage.getItem('auth_token');
    const familyData = localStorage.getItem(this.FAMILY_KEY);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
        
        if (familyData) {
          const family = JSON.parse(familyData);
          this.currentFamily.set(family);
        }
      } catch {
        this.clearAuth();
      }
    } else if (token) {
      // Handle JWT token from OAuth
      try {
        const payload = this.decodeJWT(token);
        if (payload && payload.id && payload.email) {
          const user = {
            id: payload.id,
            email: payload.email,
            name: payload.name || payload.email.split('@')[0]
          };
          this.currentUser.set(user);
          this.isAuthenticated.set(true);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          // Keep the token for API calls - don't remove it
          // Also update the ApiService token subject
          this.apiService.setToken(token);
          
          if (familyData) {
            const family = JSON.parse(familyData);
            this.currentFamily.set(family);
          }
        } else {
          this.clearAuth();
        }
      } catch {
        this.clearAuth();
      }
    }
  }

  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.apiService.login(email, password).pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.apiService.register(name, email, password).pipe(
      tap(response => {
        if (response.success) {
          this.currentUser.set(response.data.user);
          this.isAuthenticated.set(true);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));
        }
      })
    );
  }

  logout() {
    this.clearAuth();
    this.apiService.logout();
  }

  private clearAuth() {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.FAMILY_KEY);
    localStorage.removeItem('auth_token');
    this.currentUser.set(null);
    this.currentFamily.set(null);
    this.isAuthenticated.set(false);
  }

  getCurrentFamily(): Family | null {
    return this.currentFamily();
  }

  // Get families that the current user has access to
  getUserFamilies(): Observable<any> {
    const currentUser = this.currentUser();
    if (!currentUser) {
      throw new Error('No user logged in');
    }
    
    // Check if user is a family member first
    return this.apiService.getFamilyMembersByUserEmail(currentUser.email);
  }

  // Set current family and update local storage
  setCurrentFamily(family: Family | null) {
    this.currentFamily.set(family);
    if (family) {
      localStorage.setItem(this.FAMILY_KEY, JSON.stringify(family));
    } else {
      localStorage.removeItem(this.FAMILY_KEY);
    }
  }
}
