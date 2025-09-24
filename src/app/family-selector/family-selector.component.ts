import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FamilyMember } from '../services/api.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-family-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './family-selector.component.html',
  styleUrl: './family-selector.component.css'
})
export class FamilySelectorComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  protected userFamilies = signal<FamilyMember[]>([]);
  protected selectedFamily = signal<FamilyMember | null>(null);
  protected isLoading = signal(false);

  ngOnInit() {
    this.loadUserFamilies();
  }

  private loadUserFamilies() {
    this.isLoading.set(true);
    this.authService.getUserFamilies().subscribe({
      next: (response) => {
        if (response.success) {
          this.userFamilies.set(response.data);
          // Auto-select first family if available
          if (response.data.length > 0) {
            const firstFamily = response.data[0];
            this.selectFamily(firstFamily);
          }
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading user families:', error);
        this.isLoading.set(false);
        // If no families found, try to load all families (for admin users)
        this.loadAllFamilies();
      }
    });
  }

  private loadAllFamilies() {
    this.apiService.getFamilies().subscribe({
      next: (response) => {
        if (response.success && response.data.length > 0) {
          // Convert families to family member format for consistency
          const familyMembers = response.data.map(family => ({
            id: family.id,
            family_id: family.id,
            fullname: family.name,
            email: '',
            mobile: '',
            role: 'admin',
            points: 0,
            is_active: true,
            joined_on: family.created_at,
            created_at: family.created_at,
            updated_at: family.updated_at,
            family_name: family.name,
            family_description: family.description
          }));
          this.userFamilies.set(familyMembers);
          this.selectFamily(familyMembers[0]);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading all families:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected selectFamily(familyMember: FamilyMember) {
    this.selectedFamily.set(familyMember);
    
    // Convert family member to family format for auth service
    const family = {
      id: familyMember.family_id,
      name: familyMember.family_name || familyMember.fullname,
      description: familyMember.family_description || '',
      timezone: 'UTC',
      currency: 'USD',
      created_at: familyMember.created_at,
      updated_at: familyMember.updated_at
    };
    
    this.authService.setCurrentFamily(family);
  }
}