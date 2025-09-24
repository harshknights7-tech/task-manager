import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService, Task } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { FormWindowComponent } from '../shared/form-window/form-window.component';
import { SearchableDropdownComponent } from '../shared/searchable-dropdown/searchable-dropdown.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, FormWindowComponent, SearchableDropdownComponent],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class Tasks implements OnInit {
  protected readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected task: Partial<Task> = { title: '', description: '', status: 'open', priority: 'medium', assigned_to: null };
  protected tasks = signal<Task[]>([]);
  protected filter = signal<'all'|'open'|'in_progress'|'completed'>('all');
  protected sort = signal<'priority'|'due_on'|'none'>('none');
  protected isLoading = signal(false);
  protected showFormWindow = signal(false);
  protected formTitle = signal('');

  ngOnInit() {
    this.loadTasks();
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

  private loadTasks() {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    const familyId = currentFamily?.id;
    
    this.apiService.getTasks(familyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.tasks.set(response.data);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadTask(id: string) {
    this.isLoading.set(true);
    this.apiService.getTask(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.task = response.data;
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading task:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected goTo(id: string): void {
    this.openEditForm(id);
  }

  protected openNewForm(): void {
    this.task = { title: '', description: '', status: 'open', priority: 'medium', assigned_to: null };
    this.formTitle.set('Create New Task');
    this.showFormWindow.set(true);
    this.mode.set('new');
  }

  protected openEditForm(id: string): void {
    this.loadTask(id);
    this.formTitle.set('Edit Task');
    this.showFormWindow.set(true);
    this.mode.set('detail');
  }

  protected onFormClose(): void {
    this.showFormWindow.set(false);
    this.router.navigate(['/tasks']);
  }

  protected onFormSave(): void {
    this.saveTask();
  }

  protected onFormCancel(): void {
    this.onFormClose();
  }

  protected onFamilyMemberSelect(member: any): void {
    this.task.assigned_to = member?.id || null;
  }

  protected saveTask(): void {
    this.isLoading.set(true);
    const currentFamily = this.authService.getCurrentFamily();
    if (!currentFamily) {
      console.error('No family selected');
      this.isLoading.set(false);
      return;
    }

    const taskData = {
      ...this.task,
      family_id: currentFamily.id
    };

    const operation = this.task.id 
      ? this.apiService.updateTask(this.task.id, taskData)
      : this.apiService.createTask(taskData);

    operation.subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
          this.onFormClose();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error saving task:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected cancel(): void {
    this.router.navigate(['/tasks']);
  }

  protected deleteTask(id: string): void {
    this.isLoading.set(true);
    this.apiService.deleteTask(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error deleting task:', error);
        this.isLoading.set(false);
      }
    });
  }

  protected updateStatus(id: string, status: string): void {
    this.apiService.updateTaskStatus(id, status).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadTasks();
        }
      },
      error: (error) => {
        console.error('Error updating status:', error);
      }
    });
  }

  protected filteredTasks() {
    let list = this.tasks();
    const f = this.filter();
    if (f !== 'all') list = list.filter(t => (t.status || 'open') === f);
    const s = this.sort();
    if (s === 'priority') {
      const order: Record<string, number> = { low: 0, medium: 1, high: 2 } as const;
      list = [...list].sort((a,b) => (order[a.priority || 'medium'] ?? 1) - (order[b.priority || 'medium'] ?? 1));
    } else if (s === 'due_on') {
      list = [...list].sort((a,b) => new Date(a.due_on || 0).getTime() - new Date(b.due_on || 0).getTime());
    }
    return list;
  }
}
