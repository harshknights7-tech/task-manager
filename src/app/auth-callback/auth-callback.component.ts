import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="callback-card">
        <div class="loading-spinner"></div>
        <h2>Completing sign in...</h2>
        <p>Please wait while we complete your authentication.</p>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .callback-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      padding: 40px;
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    h2 {
      margin: 0 0 8px 0;
      color: #111827;
      font-size: 1.5rem;
    }

    p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    this.handleCallback();
  }

  private handleCallback() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        console.error('OAuth error:', error);
        this.router.navigate(['/signin'], { queryParams: { error: 'oauth_failed' } });
        return;
      }

      if (token) {
        // Store the token and redirect to tasks
        localStorage.setItem('auth_token', token);
        this.authService.checkAuthState();
        this.router.navigate(['/tasks']);
      } else {
        // No token, redirect to signin
        this.router.navigate(['/signin']);
      }
    });
  }
}
