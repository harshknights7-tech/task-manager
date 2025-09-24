import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected isLoading = signal(false);
  protected errorMessage = signal('');
  protected showPassword = signal(false);
  protected showConfirmPassword = signal(false);
  protected emailError = signal('');
  protected passwordError = signal('');
  protected confirmPasswordError = signal('');

  protected onSubmit() {
    if (this.isLoading()) return;
    
    this.errorMessage.set('');
    
    // Validation
    if (!this.name.trim()) {
      this.errorMessage.set('Name is required');
      return;
    }
    
    if (!this.email.trim()) {
      this.errorMessage.set('Email is required');
      return;
    }
    
    if (!this.isValidEmail(this.email)) {
      this.errorMessage.set('Please enter a valid email address');
      return;
    }
    
    if (!this.password) {
      this.errorMessage.set('Password is required');
      return;
    }
    
    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long');
      return;
    }
    
    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.router.navigate(['/tasks']);
        } else {
          this.errorMessage.set((response && response.message) || 'Registration failed. Please try again.');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (error.status === 409) {
          this.errorMessage.set('An account with this email already exists. Please sign in instead.');
        } else if (error.status === 400) {
          this.errorMessage.set('Please check your information and try again.');
        } else if (error.status === 0) {
          this.errorMessage.set('Unable to connect to server. Please check your internet connection.');
        } else {
          this.errorMessage.set(error.error?.message || error.message || 'Registration failed. Please try again.');
        }
        this.isLoading.set(false);
      }
    });
  }

  protected onGoogleSignup() {
    if (this.isLoading()) return;
    
    this.isLoading.set(true);
    this.errorMessage.set('');
    
    // Directly redirect to Google OAuth - let the backend handle configuration check
    window.location.href = 'http://localhost:3000/api/auth/google';
  }

  protected togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  protected toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected validateEmail() {
    if (!this.email.trim()) {
      this.emailError.set('');
      return;
    }
    if (!this.isValidEmail(this.email)) {
      this.emailError.set('Please enter a valid email address');
    } else {
      this.emailError.set('');
    }
  }

  protected validatePassword() {
    if (!this.password) {
      this.passwordError.set('');
      return;
    }
    if (this.password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters long');
    } else {
      this.passwordError.set('');
    }
  }

  protected validateConfirmPassword() {
    if (!this.confirmPassword) {
      this.confirmPasswordError.set('');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
    } else {
      this.confirmPasswordError.set('');
    }
  }
}
