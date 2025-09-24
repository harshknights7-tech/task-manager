import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, FamilyMember, Family } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { FormWindowComponent } from '../shared/form-window/form-window.component';

@Component({
  selector: 'app-family-member',
  standalone: true,
  imports: [FormsModule, FormWindowComponent],
  templateUrl: './family-member.html',
  styleUrl: './family-member.css'
})
export class FamilyMemberComponent implements OnInit {
  protected readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected member: Partial<FamilyMember> = { fullname: '', email: '', mobile: '', role: '', points: 0, is_active: true };
  protected members = signal<FamilyMember[]>([]);
  protected families = signal<Family[]>([]);
  protected selectedFamilyId = signal<string>('');
  protected isLoading = signal(false);
  protected showFormWindow = signal(false);
  protected formTitle = signal('');

  ngOnInit() {
    this.loadFamilies();
    this.loadMembers();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (this.router.url.endsWith('/new')) {
        this.openNewForm();
      } else if (id) {
        this.openEditForm(id);
      } else {
        this.mode.set('list');
        this.showFormWindow.set(false);
      }
    });
  }

  private loadFamilies() {
    this.apiService.getFamilies().subscribe({
      next: (response) => {
        if (response.success) {
          this.families.set(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading families:', error);
      }
    });
  }

  private loadMembers() {
    this.isLoading.set(true);
    
    // Load all family members to show across families
    this.apiService.getFamilyMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.members.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading family members:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadMember(id: string) {
    this.isLoading.set(true);
    this.apiService.getFamilyMember(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.member = response.data;
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading family member:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected goTo(id: string): void {
    this.openEditForm(id);
  }

  protected openNewForm(): void {
    this.member = { fullname: '', email: '', mobile: '', role: '', points: 0, is_active: true };
    this.selectedFamilyId.set('');
    this.formTitle.set('Create New Family Member');
    this.showFormWindow.set(true);
    this.mode.set('new');
  }

  protected openEditForm(id: string): void {
    this.loadMember(id);
    this.formTitle.set('Edit Family Member');
    this.showFormWindow.set(true);
    this.mode.set('detail');
  }

  protected onFormClose(): void {
    this.showFormWindow.set(false);
    this.router.navigate(['/family-member']);
  }

  protected onFormSave(): void {
    this.saveMember();
  }

  protected onFormCancel(): void {
    this.onFormClose();
  }

  protected saveMember(): void {
    this.isLoading.set(true);
    
    // For new members, use selected family. For editing, use existing family_id
    const familyId = this.mode() === 'new' ? this.selectedFamilyId() : this.member.family_id;
    
    if (!familyId) {
      console.error('No family selected');
      this.isLoading.set(false);
      return;
    }

    const memberData = {
      ...this.member,
      family_id: familyId
    };

    const operation = this.member.id 
      ? this.apiService.updateFamilyMember(this.member.id, memberData)
      : this.apiService.createFamilyMember(memberData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadMembers();
          this.onFormClose();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving family member:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected onFamilySelect(familyId: string): void {
    this.selectedFamilyId.set(familyId);
  }

  protected cancel(): void {
    this.router.navigate(['/family-member']);
  }
}
