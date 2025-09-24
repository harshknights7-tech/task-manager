import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Contact } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { FormWindowComponent } from '../shared/form-window/form-window.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [FormsModule, FormWindowComponent],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css'
})
export class Contacts implements OnInit {
  protected readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected contact: Partial<Contact> = { name: '', service_type: '', phone: '', email: '' };
  protected contacts = signal<Contact[]>([]);
  protected isLoading = signal(false);
  protected showFormWindow = signal(false);
  protected formTitle = signal('');

  ngOnInit() {
    this.loadContacts();
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

  private loadContacts() {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    const familyId = currentFamily?.id;
    
    this.apiService.getContacts(familyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.contacts.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading contacts:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadContact(id: string) {
    this.isLoading.set(true);
    this.apiService.getContact(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.contact = response.data;
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading contact:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected goTo(id: string): void {
    this.openEditForm(id);
  }

  protected openNewForm(): void {
    this.contact = { name: '', service_type: '', phone: '', email: '' };
    this.formTitle.set('Create New Contact');
    this.showFormWindow.set(true);
    this.mode.set('new');
  }

  protected openEditForm(id: string): void {
    this.loadContact(id);
    this.formTitle.set('Edit Contact');
    this.showFormWindow.set(true);
    this.mode.set('detail');
  }

  protected onFormClose(): void {
    this.showFormWindow.set(false);
    this.router.navigate(['/contacts']);
  }

  protected onFormSave(): void {
    this.saveContact();
  }

  protected onFormCancel(): void {
    this.onFormClose();
  }

  protected saveContact(): void {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    if (!currentFamily) {
      console.error('No family selected');
      this.isLoading.set(false);
      return;
    }

    const contactData = {
      ...this.contact,
      family_id: currentFamily.id
    };

    const operation = this.contact.id 
      ? this.apiService.updateContact(this.contact.id, contactData)
      : this.apiService.createContact(contactData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadContacts();
          this.onFormClose();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving contact:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/contacts']);
  }
}
