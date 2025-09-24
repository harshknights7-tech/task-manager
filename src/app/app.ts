import { Component, signal, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { FamilySelectorComponent } from './family-selector/family-selector.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FamilySelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('task-manager');
  protected readonly sidebarOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    // Check authentication state on app init
    // Route guards will handle redirects
  }

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected toggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }
}
