import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  created_by?: string;
  assigned_to?: string | null;
  assignment_type?: string;
  status: string;
  priority: string;
  due_on?: string;
  points?: number;
  rejection_reason?: string;
  auto_assign_after_mins?: number;
  escalation_count?: number;
  completed_on?: string;
  percent_complete?: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  fullname: string;
  email?: string;
  mobile?: string;
  role?: string;
  user_lookup?: string;
  points?: number;
  is_active: boolean;
  joined_on: string;
  created_at: string;
  updated_at: string;
  // Additional properties from JOIN queries
  family_name?: string;
  family_description?: string;
}

export interface Contact {
  id: string;
  family_id: string;
  name: string;
  service_type?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  source?: string;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  family_id: string;
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  description?: string;
  timezone?: string;
  currency?: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  family_id: string;
  title: string;
  doctor?: string;
  appointment_date?: string;
  status: string;
  notes?: string;
  family_member_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  family_id: string;
  family_member_id?: string;
  title: string;
  description?: string;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  member_name?: string;
  relation?: string;
}

export interface DocumentStats {
  total_documents: number;
  total_size: number;
  categories_count: number;
  members_with_documents: number;
}

export interface DocumentCategory {
  category: string;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.tokenSubject.next(token);
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.tokenSubject.value;
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  // Auth endpoints
  login(email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response && response.success) {
          localStorage.setItem('auth_token', response.data.token);
          this.tokenSubject.next(response.data.token);
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.baseUrl}/auth/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('auth_token', response.data.token);
          this.tokenSubject.next(response.data.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.tokenSubject.next(null);
  }

  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
    this.tokenSubject.next(token);
  }

  // Task endpoints
  getTasks(familyId?: string): Observable<ApiResponse<Task[]>> {
    const url = familyId ? `${this.baseUrl}/tasks/family/${familyId}` : `${this.baseUrl}/tasks`;
    return this.http.get<ApiResponse<Task[]>>(url, { headers: this.getHeaders() });
  }

  getTask(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  createTask(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.baseUrl}/tasks`, task, { headers: this.getHeaders() });
  }

  updateTask(id: string, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}`, task, { headers: this.getHeaders() });
  }

  deleteTask(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  updateTaskStatus(id: string, status: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.baseUrl}/tasks/${id}/status`, { status }, { headers: this.getHeaders() });
  }

  // Family Member endpoints
  getFamilyMembers(familyId?: string): Observable<ApiResponse<FamilyMember[]>> {
    const url = familyId ? `${this.baseUrl}/family-members?family_id=${familyId}` : `${this.baseUrl}/family-members`;
    return this.http.get<ApiResponse<FamilyMember[]>>(url, { headers: this.getHeaders() });
  }

  getFamilyMembersByFamily(familyId: string): Observable<ApiResponse<FamilyMember[]>> {
    return this.http.get<ApiResponse<FamilyMember[]>>(`${this.baseUrl}/family-members/family/${familyId}`, { headers: this.getHeaders() });
  }

  getFamilyMembersByUserEmail(email: string): Observable<ApiResponse<FamilyMember[]>> {
    return this.http.get<ApiResponse<FamilyMember[]>>(`${this.baseUrl}/family-members/user/${email}`, { headers: this.getHeaders() });
  }

  getFamilyMember(id: string): Observable<ApiResponse<FamilyMember>> {
    return this.http.get<ApiResponse<FamilyMember>>(`${this.baseUrl}/family-members/${id}`, { headers: this.getHeaders() });
  }

  createFamilyMember(member: Partial<FamilyMember>): Observable<ApiResponse<FamilyMember>> {
    return this.http.post<ApiResponse<FamilyMember>>(`${this.baseUrl}/family-members`, member, { headers: this.getHeaders() });
  }

  updateFamilyMember(id: string, member: Partial<FamilyMember>): Observable<ApiResponse<FamilyMember>> {
    return this.http.put<ApiResponse<FamilyMember>>(`${this.baseUrl}/family-members/${id}`, member, { headers: this.getHeaders() });
  }

  deleteFamilyMember(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/family-members/${id}`, { headers: this.getHeaders() });
  }

  // Contact endpoints
  getContacts(familyId?: string): Observable<ApiResponse<Contact[]>> {
    const url = familyId ? `${this.baseUrl}/contacts?family_id=${familyId}` : `${this.baseUrl}/contacts`;
    return this.http.get<ApiResponse<Contact[]>>(url, { headers: this.getHeaders() });
  }

  getContact(id: string): Observable<ApiResponse<Contact>> {
    return this.http.get<ApiResponse<Contact>>(`${this.baseUrl}/contacts/${id}`, { headers: this.getHeaders() });
  }

  createContact(contact: Partial<Contact>): Observable<ApiResponse<Contact>> {
    return this.http.post<ApiResponse<Contact>>(`${this.baseUrl}/contacts`, contact, { headers: this.getHeaders() });
  }

  updateContact(id: string, contact: Partial<Contact>): Observable<ApiResponse<Contact>> {
    return this.http.put<ApiResponse<Contact>>(`${this.baseUrl}/contacts/${id}`, contact, { headers: this.getHeaders() });
  }

  deleteContact(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/contacts/${id}`, { headers: this.getHeaders() });
  }

  // Doctor endpoints
  getDoctors(familyId?: string): Observable<ApiResponse<Doctor[]>> {
    const url = familyId ? `${this.baseUrl}/doctors?family_id=${familyId}` : `${this.baseUrl}/doctors`;
    return this.http.get<ApiResponse<Doctor[]>>(url, { headers: this.getHeaders() });
  }

  getDoctor(id: string): Observable<ApiResponse<Doctor>> {
    return this.http.get<ApiResponse<Doctor>>(`${this.baseUrl}/doctors/${id}`, { headers: this.getHeaders() });
  }

  createDoctor(doctor: Partial<Doctor>): Observable<ApiResponse<Doctor>> {
    return this.http.post<ApiResponse<Doctor>>(`${this.baseUrl}/doctors`, doctor, { headers: this.getHeaders() });
  }

  updateDoctor(id: string, doctor: Partial<Doctor>): Observable<ApiResponse<Doctor>> {
    return this.http.put<ApiResponse<Doctor>>(`${this.baseUrl}/doctors/${id}`, doctor, { headers: this.getHeaders() });
  }

  deleteDoctor(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/doctors/${id}`, { headers: this.getHeaders() });
  }

  // Family endpoints
  getFamilies(): Observable<ApiResponse<Family[]>> {
    return this.http.get<ApiResponse<Family[]>>(`${this.baseUrl}/families`, { headers: this.getHeaders() });
  }

  getFamily(id: string): Observable<ApiResponse<Family>> {
    return this.http.get<ApiResponse<Family>>(`${this.baseUrl}/families/${id}`, { headers: this.getHeaders() });
  }

  createFamily(family: Partial<Family>): Observable<ApiResponse<Family>> {
    return this.http.post<ApiResponse<Family>>(`${this.baseUrl}/families`, family, { headers: this.getHeaders() });
  }

  updateFamily(id: string, family: Partial<Family>): Observable<ApiResponse<Family>> {
    return this.http.put<ApiResponse<Family>>(`${this.baseUrl}/families/${id}`, family, { headers: this.getHeaders() });
  }

  deleteFamily(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/families/${id}`, { headers: this.getHeaders() });
  }

  // Appointment endpoints
  getAppointments(familyId?: string): Observable<ApiResponse<Appointment[]>> {
    const url = familyId ? `${this.baseUrl}/appointments?family_id=${familyId}` : `${this.baseUrl}/appointments`;
    return this.http.get<ApiResponse<Appointment[]>>(url, { headers: this.getHeaders() });
  }

  getAppointment(id: string): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.baseUrl}/appointments/${id}`, { headers: this.getHeaders() });
  }

  createAppointment(appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(`${this.baseUrl}/appointments`, appointment, { headers: this.getHeaders() });
  }

  updateAppointment(id: string, appointment: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.baseUrl}/appointments/${id}`, appointment, { headers: this.getHeaders() });
  }

  deleteAppointment(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/appointments/${id}`, { headers: this.getHeaders() });
  }

  // Document endpoints
  getDocumentsByFamily(familyId: string): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/documents/family/${familyId}`, { headers: this.getHeaders() });
  }

  getDocumentsByMember(memberId: string): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/documents/member/${memberId}`, { headers: this.getHeaders() });
  }

  getDocument(id: string): Observable<ApiResponse<Document>> {
    return this.http.get<ApiResponse<Document>>(`${this.baseUrl}/documents/${id}`, { headers: this.getHeaders() });
  }

  uploadDocument(formData: FormData): Observable<ApiResponse<Document>> {
    const token = this.tokenSubject.value;
    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
      // Don't set Content-Type for FormData, let browser set it with boundary
    });
    return this.http.post<ApiResponse<Document>>(`${this.baseUrl}/documents/upload`, formData, { headers });
  }

  updateDocument(id: string, document: Partial<Document>): Observable<ApiResponse<Document>> {
    return this.http.put<ApiResponse<Document>>(`${this.baseUrl}/documents/${id}`, document, { headers: this.getHeaders() });
  }

  deleteDocument(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/documents/${id}`, { headers: this.getHeaders() });
  }

  downloadDocument(id: string): Observable<Blob> {
    const token = this.tokenSubject.value;
    const headers = new HttpHeaders({
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
    return this.http.get(`${this.baseUrl}/documents/${id}/download`, { 
      headers, 
      responseType: 'blob' 
    });
  }

  getDocumentCategories(familyId: string): Observable<ApiResponse<DocumentCategory[]>> {
    return this.http.get<ApiResponse<DocumentCategory[]>>(`${this.baseUrl}/documents/family/${familyId}/categories`, { headers: this.getHeaders() });
  }

  getDocumentStats(familyId: string): Observable<ApiResponse<DocumentStats>> {
    return this.http.get<ApiResponse<DocumentStats>>(`${this.baseUrl}/documents/family/${familyId}/stats`, { headers: this.getHeaders() });
  }

  getRecentDocuments(familyId: string, limit: number = 10): Observable<ApiResponse<Document[]>> {
    return this.http.get<ApiResponse<Document[]>>(`${this.baseUrl}/documents/family/${familyId}/recent?limit=${limit}`, { headers: this.getHeaders() });
  }
}
