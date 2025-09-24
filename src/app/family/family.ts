import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService, FamilyRecord } from '../services/data.service';
import { ApiService, Family as FamilyApi } from '../services/api.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './family.html',
  styleUrl: './family.css'
})
export class Family implements OnInit {
  protected readonly data = inject(DataService);
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly mode = signal<'list' | 'new' | 'detail'>('list');
  protected readonly families = signal<FamilyApi[]>([]);
  protected readonly loading = signal(false);
  protected family: FamilyRecord = { familyid: '', name: '', description: '', timezone: '', currency: '' };

  ngOnInit() {
    this.loadFamilies();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (this.router.url.endsWith('/new')) {
        this.mode.set('new');
        this.family = { familyid: '', name: '', description: '', timezone: '', currency: '' };
      } else if (id) {
        this.mode.set('detail');
        const found = this.families().find(f => f.id === id);
        this.family = found ? { 
          familyid: found.id, 
          name: found.name, 
          description: found.description || '', 
          timezone: found.timezone || '', 
          currency: found.currency || '' 
        } : { familyid: id, name: '', description: '', timezone: '', currency: '' };
      } else {
        this.mode.set('list');
      }
    });
  }

  private loadFamilies() {
    this.loading.set(true);
    this.apiService.getFamilies().subscribe({
      next: (response) => {
        if (response.success) {
          this.families.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading families:', error);
        this.loading.set(false);
      }
    });
  }

  protected goTo(id: string) { this.router.navigate(['/family', id]); }
  
  protected showCreateForm() {
    this.mode.set('new');
    this.family = { familyid: '', name: '', description: '', timezone: '', currency: '' };
  }

  protected saveFamily() {
    this.loading.set(true);
    const familyData = {
      name: this.family.name,
      description: this.family.description,
      timezone: this.family.timezone,
      currency: this.family.currency
    };

    if (this.family.familyid) {
      // Update existing family
      this.apiService.updateFamily(this.family.familyid, familyData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadFamilies();
            this.mode.set('list');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error updating family:', error);
          this.loading.set(false);
        }
      });
    } else {
      // Create new family
      this.apiService.createFamily(familyData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadFamilies();
            this.mode.set('list');
          }
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error creating family:', error);
          this.loading.set(false);
        }
      });
    }
  }

  protected cancel() { 
    this.mode.set('list');
    this.family = { familyid: '', name: '', description: '', timezone: '', currency: '' };
  }
}
