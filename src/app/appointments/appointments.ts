import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Appointment } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { FormWindowComponent } from '../shared/form-window/form-window.component';
import { SearchableDropdownComponent } from '../shared/searchable-dropdown/searchable-dropdown.component';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [FormsModule, FormWindowComponent, SearchableDropdownComponent],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css'
})
export class Appointments implements OnInit {
  protected readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected appointment: Partial<Appointment> = { title: '', doctor: '', appointment_date: '', status: 'scheduled', notes: '', family_member_id: null };
  protected appointments = signal<Appointment[]>([]);
  protected isLoading = signal(false);
  protected showFormWindow = signal(false);
  protected formTitle = signal('');

  ngOnInit() {
    this.loadAppointments();
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

  private loadAppointments() {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    const familyId = currentFamily?.id;
    
    this.apiService.getAppointments(familyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.appointments.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadAppointment(id: string) {
    this.isLoading.set(true);
    this.apiService.getAppointment(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.appointment = response.data;
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading appointment:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected goTo(id: string): void {
    this.openEditForm(id);
  }

  protected openNewForm(): void {
    this.appointment = { title: '', doctor: '', appointment_date: '', status: 'scheduled', notes: '', family_member_id: null };
    this.formTitle.set('Create New Appointment');
    this.showFormWindow.set(true);
    this.mode.set('new');
  }

  protected openEditForm(id: string): void {
    this.loadAppointment(id);
    this.formTitle.set('Edit Appointment');
    this.showFormWindow.set(true);
    this.mode.set('detail');
  }

  protected onFormClose(): void {
    this.showFormWindow.set(false);
    this.router.navigate(['/appointments']);
  }

  protected onFormSave(): void {
    this.saveAppointment();
  }

  protected onFormCancel(): void {
    this.onFormClose();
  }

  protected onFamilyMemberSelect(member: any): void {
    this.appointment.family_member_id = member?.id || null;
  }

  protected saveAppointment(): void {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    if (!currentFamily) {
      console.error('No family selected');
      this.isLoading.set(false);
      return;
    }

    const appointmentData = {
      ...this.appointment,
      family_id: currentFamily.id
    };

    const operation = this.appointment.id 
      ? this.apiService.updateAppointment(this.appointment.id, appointmentData)
      : this.apiService.createAppointment(appointmentData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAppointments();
          this.onFormClose();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving appointment:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/appointments']);
  }
}
