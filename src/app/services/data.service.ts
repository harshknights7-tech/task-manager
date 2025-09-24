import { Injectable, signal, inject } from '@angular/core';
import { ApiService, Family } from './api.service';

export interface TaskRecord {
  taskid: string;
  title: string;
  description?: string;
  family_lookup?: string;
  status?: string;
  priority?: string;
  dueon?: string;
}

export interface FamilyMemberRecord {
  familymemberid: string;
  fullname: string;
  email?: string;
  mobile?: string;
  role?: string;
  is_active?: boolean;
}

export interface ContactRecord {
  contactid: string;
  name: string;
  service_type?: string;
  phone?: string;
  email?: string;
}

export interface AppointmentRecord {
  appointmentid: string;
  title: string;
  doctor?: string;
  date?: string;
  status?: string;
  notes?: string;
}

export interface DoctorRecord {
  doctorid: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export interface FamilyRecord {
  familyid: string;
  name: string;
  description?: string;
  timezone?: string;
  currency?: string;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiService = inject(ApiService);

  tasks = signal<TaskRecord[]>([
    { taskid: 't1', title: 'Buy groceries', status: 'open', priority: 'medium' },
    { taskid: 't2', title: 'Call plumber', status: 'in_progress', priority: 'high' },
  ]);

  members = signal<FamilyMemberRecord[]>([
    { familymemberid: 'm1', fullname: 'Alex Johnson', email: 'alex@example.com', is_active: true },
    { familymemberid: 'm2', fullname: 'Sam Lee', mobile: '+1 555 212', is_active: true },
  ]);

  contacts = signal<ContactRecord[]>([
    { contactid: 'c1', name: 'Dr. Smith', service_type: 'Doctor', phone: '555-1234' },
    { contactid: 'c2', name: 'Electrician Co', service_type: 'Electrician', phone: '555-9876' },
  ]);

  appointments = signal<AppointmentRecord[]>([
    { appointmentid: 'a1', title: 'Dental checkup', doctor: 'Dr. Smith', date: '2025-10-01', status: 'scheduled' },
  ]);

  doctors = signal<DoctorRecord[]>([
    { doctorid: 'd1', name: 'Dr. Smith', specialty: 'Dentist', phone: '555-1234', email: 'smith@clinic.com' },
  ]);

  // Families are now managed through API calls for data security
  families = signal<FamilyRecord[]>([]);

  upsertTask(task: TaskRecord) {
    const existing = this.tasks().find(t => t.taskid === task.taskid);
    if (existing) {
      this.tasks.update(arr => arr.map(t => t.taskid === task.taskid ? task : t));
    } else {
      this.tasks.update(arr => [...arr, { ...task, taskid: crypto.randomUUID() }]);
    }
  }

  deleteTask(taskid: string) {
    this.tasks.update(arr => arr.filter(t => t.taskid !== taskid));
  }

  setTaskStatus(taskid: string, status: string) {
    this.tasks.update(arr => arr.map(t => t.taskid === taskid ? { ...t, status } : t));
  }

  upsertMember(member: FamilyMemberRecord) {
    const existing = this.members().find(m => m.familymemberid === member.familymemberid);
    if (existing) {
      this.members.update(arr => arr.map(m => m.familymemberid === member.familymemberid ? member : m));
    } else {
      this.members.update(arr => [...arr, { ...member, familymemberid: crypto.randomUUID() }]);
    }
  }

  upsertContact(contact: ContactRecord) {
    const existing = this.contacts().find(c => c.contactid === contact.contactid);
    if (existing) {
      this.contacts.update(arr => arr.map(c => c.contactid === contact.contactid ? contact : c));
    } else {
      this.contacts.update(arr => [...arr, { ...contact, contactid: crypto.randomUUID() }]);
    }
  }

  upsertAppointment(appointment: AppointmentRecord) {
    const existing = this.appointments().find(a => a.appointmentid === appointment.appointmentid);
    if (existing) {
      this.appointments.update(arr => arr.map(a => a.appointmentid === appointment.appointmentid ? appointment : a));
    } else {
      this.appointments.update(arr => [...arr, { ...appointment, appointmentid: crypto.randomUUID() }]);
    }
  }

  upsertDoctor(doctor: DoctorRecord) {
    const existing = this.doctors().find(d => d.doctorid === doctor.doctorid);
    if (existing) {
      this.doctors.update(arr => arr.map(d => d.doctorid === doctor.doctorid ? doctor : d));
    } else {
      this.doctors.update(arr => [...arr, { ...doctor, doctorid: crypto.randomUUID() }]);
    }
  }

  upsertFamily(family: FamilyRecord) {
    // This method is now deprecated - use API calls directly in components
    // Keeping for backward compatibility but families should be managed via API
    const existing = this.families().find(f => f.familyid === family.familyid);
    if (existing) {
      this.families.update(arr => arr.map(f => f.familyid === family.familyid ? family : f));
    } else {
      this.families.update(arr => [...arr, { ...family, familyid: crypto.randomUUID() }]);
    }
  }

  // New method to load families from API
  loadFamilies() {
    this.apiService.getFamilies().subscribe({
      next: (response) => {
        if (response.success) {
          // Convert API Family format to FamilyRecord format
          const familyRecords: FamilyRecord[] = response.data.map(f => ({
            familyid: f.id,
            name: f.name,
            description: f.description || '',
            timezone: f.timezone || '',
            currency: f.currency || ''
          }));
          this.families.set(familyRecords);
        }
      },
      error: (error) => {
        console.error('Error loading families:', error);
      }
    });
  }
}


