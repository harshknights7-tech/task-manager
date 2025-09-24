import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, FamilyMember } from '../../services/api.service';

@Component({
  selector: 'app-searchable-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchable-dropdown.component.html',
  styleUrl: './searchable-dropdown.component.css'
})
export class SearchableDropdownComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search and select...';
  @Input() selectedValue: string | null | undefined = null;
  @Input() disabled = false;
  @Output() selectionChange = new EventEmitter<FamilyMember | null>();

  protected isOpen = signal(false);
  protected searchTerm = signal('');
  protected filteredOptions = signal<FamilyMember[]>([]);
  protected selectedMember = signal<FamilyMember | null>(null);
  protected isLoading = signal(false);

  private allOptions: FamilyMember[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadFamilyMembers();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private loadFamilyMembers() {
    this.isLoading.set(true);
    this.apiService.getFamilyMembers().subscribe({
      next: (response) => {
        if (response.success) {
          this.allOptions = response.data;
          this.filteredOptions.set(response.data);
          this.setSelectedMember();
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading family members:', error);
        this.isLoading.set(false);
      }
    });
  }

  private setSelectedMember() {
    if (this.selectedValue) {
      const member = this.allOptions.find(m => m.id === this.selectedValue);
      this.selectedMember.set(member || null);
    } else {
      this.selectedMember.set(null);
    }
  }

  protected onSearchChange(searchTerm: string) {
    this.searchTerm.set(searchTerm);
    this.filterOptions();
  }

  private filterOptions() {
    const term = this.searchTerm().toLowerCase();
    const filtered = this.allOptions.filter(member =>
      member.fullname.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.mobile?.toLowerCase().includes(term)
    );
    this.filteredOptions.set(filtered);
  }

  protected selectMember(member: FamilyMember) {
    this.selectedMember.set(member);
    this.selectedValue = member.id;
    this.isOpen.set(false);
    this.searchTerm.set('');
    this.filterOptions();
    this.selectionChange.emit(member);
  }

  protected clearSelection() {
    this.selectedMember.set(null);
    this.selectedValue = null;
    this.selectionChange.emit(null);
  }

  protected toggleDropdown() {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
      if (this.isOpen()) {
        this.searchTerm.set('');
        this.filterOptions();
      }
    }
  }

  protected onBlur() {
    // Delay closing to allow for clicks on options
    setTimeout(() => {
      this.isOpen.set(false);
    }, 200);
  }

  protected getDisplayText(): string {
    const member = this.selectedMember();
    if (member) {
      return `${member.fullname}${member.email ? ` (${member.email})` : ''}`;
    }
    return this.placeholder;
  }
}
