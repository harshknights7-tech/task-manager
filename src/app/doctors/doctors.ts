import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Doctor } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { FormWindowComponent } from '../shared/form-window/form-window.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [FormsModule, FormWindowComponent],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css'
})
export class Doctors implements OnInit {
  protected readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected doctor: Partial<Doctor> = { name: '', specialty: '', phone: '', email: '' };
  protected doctors = signal<Doctor[]>([]);
  protected isLoading = signal(false);
  protected showFormWindow = signal(false);
  protected formTitle = signal('');

  ngOnInit() {
    this.loadDoctors();
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

  private loadDoctors() {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    const familyId = currentFamily?.id;
    
    this.apiService.getDoctors(familyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.doctors.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadDoctor(id: string) {
    this.isLoading.set(true);
    this.apiService.getDoctor(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.doctor = response.data;
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading doctor:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected goTo(id: string): void {
    this.openEditForm(id);
  }

  protected openNewForm(): void {
    this.doctor = { name: '', specialty: '', phone: '', email: '' };
    this.formTitle.set('Create New Doctor');
    this.showFormWindow.set(true);
    this.mode.set('new');
  }

  protected openEditForm(id: string): void {
    this.loadDoctor(id);
    this.formTitle.set('Edit Doctor');
    this.showFormWindow.set(true);
    this.mode.set('detail');
  }

  protected onFormClose(): void {
    this.showFormWindow.set(false);
    this.router.navigate(['/doctors']);
  }

  protected onFormSave(): void {
    this.saveDoctor();
  }

  protected onFormCancel(): void {
    this.onFormClose();
  }

  protected saveDoctor(): void {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    if (!currentFamily) {
      console.error('No family selected');
      this.isLoading.set(false);
      return;
    }

    const doctorData = {
      ...this.doctor,
      family_id: currentFamily.id
    };

    const operation = this.doctor.id 
      ? this.apiService.updateDoctor(this.doctor.id, doctorData)
      : this.apiService.createDoctor(doctorData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadDoctors();
          this.onFormClose();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving doctor:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/doctors']);
  }
}
