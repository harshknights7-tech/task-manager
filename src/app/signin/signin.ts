import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signin.html',
  styleUrl: './signin.css'
})
export class SigninComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  onSubmit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.router.navigate(['/tasks']);
        } else {
          this.errorMessage = (response && response.message) || 'Login failed. Please try again.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.status === 400) {
          this.errorMessage = 'Please check your email format and password length.';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  onGoogleSignin() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    // Directly redirect to Google OAuth - let the backend handle configuration check
    window.location.href = 'http://localhost:3000/api/auth/google';
  }
}
