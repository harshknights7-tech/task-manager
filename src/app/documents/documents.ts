import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { AuthService } from '../auth/auth.service';
import { SearchableDropdownComponent } from '../shared/searchable-dropdown/searchable-dropdown.component';

interface Document {
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

interface DocumentStats {
  total_documents: number;
  total_size: number;
  categories_count: number;
  members_with_documents: number;
}

interface DocumentCategory {
  category: string;
  count: number;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableDropdownComponent],
  templateUrl: './documents.html',
  styleUrl: './documents.css'
})
export class Documents implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);

  protected documents = signal<Document[]>([]);
  protected filteredDocuments = signal<Document[]>([]);
  protected familyMembers = signal<any[]>([]);
  protected categories = signal<DocumentCategory[]>([]);
  protected stats = signal<DocumentStats | null>(null);
  protected isLoading = signal(false);
  protected isUploading = signal(false);
  protected searchTerm = signal('');
  protected selectedCategory = signal('');
  protected selectedMember = signal<string | null>(null);
  protected showUploadForm = signal(false);

  // Upload form data
  protected uploadData = {
    title: '',
    description: '',
    category: '',
    family_member_id: '',
    document: null as File | null
  };

  protected readonly documentCategories = [
    'ID Proofs',
    'Medical Reports',
    'Receipts',
    'Bills',
    'Insurance',
    'Educational',
    'Legal',
    'Financial',
    'Travel',
    'Other'
  ];

  ngOnInit() {
    this.ensureFamilySelected();
    this.loadFamilyMembers();
    this.loadDocuments();
    this.loadCategories();
    this.loadStats();
  }

  private async ensureFamilySelected() {
    let currentFamily = this.authService.getCurrentFamily();
    
    if (!currentFamily) {
      try {
        // Try to get user's families first
        const userFamiliesResponse = await this.authService.getUserFamilies().toPromise();
        
        if (userFamiliesResponse?.success && userFamiliesResponse.data.length > 0) {
          // User is a member of families, select the first one
          const firstFamilyMember = userFamiliesResponse.data[0];
          currentFamily = {
            id: firstFamilyMember.family_id,
            name: firstFamilyMember.family_name || firstFamilyMember.fullname,
            description: firstFamilyMember.family_description || '',
            timezone: 'UTC',
            currency: 'USD',
            created_at: firstFamilyMember.created_at,
            updated_at: firstFamilyMember.updated_at
          };
          this.authService.setCurrentFamily(currentFamily);
        } else {
          // User is not a member of any families, try to get all families (admin access)
          const response = await this.apiService.getFamilies().toPromise();
          
          if (response?.success && response.data.length > 0) {
            currentFamily = response.data[0];
            this.authService.setCurrentFamily(currentFamily);
          } else {
            // Create default family
            const defaultFamily = {
              name: 'My Family',
              description: 'Default family',
              timezone: 'UTC',
              currency: 'USD'
            };
            const createResponse = await this.apiService.createFamily(defaultFamily).toPromise();
            
            if (createResponse?.success) {
              currentFamily = createResponse.data;
              this.authService.setCurrentFamily(currentFamily);
            }
          }
        }
      } catch (error) {
        console.error('Error ensuring family is selected:', error);
      }
    }
  }

  private async loadFamilyMembers() {
    try {
      const response = await this.apiService.getFamilyMembers().toPromise();
      if (response?.success) {
        this.familyMembers.set(response.data);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  }

  private async loadDocuments() {
    this.isLoading.set(true);
    try {
      await this.ensureFamilySelected();
      
      const currentFamily = this.authService.getCurrentFamily();
      if (!currentFamily) {
        console.error('No family selected');
        return;
      }

      const response = await this.apiService.getDocumentsByFamily(currentFamily.id).toPromise();
      if (response?.success) {
        this.documents.set(response.data);
        this.applyFilters();
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadCategories() {
    try {
      await this.ensureFamilySelected();
      
      const currentFamily = this.authService.getCurrentFamily();
      if (!currentFamily) return;

      const response = await this.apiService.getDocumentCategories(currentFamily.id).toPromise();
      if (response?.success) {
        this.categories.set(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  private async loadStats() {
    try {
      await this.ensureFamilySelected();
      
      const currentFamily = this.authService.getCurrentFamily();
      if (!currentFamily) return;

      const response = await this.apiService.getDocumentStats(currentFamily.id).toPromise();
      if (response?.success) {
        this.stats.set(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  protected onSearchChange() {
    this.applyFilters();
  }

  protected onCategoryChange() {
    this.applyFilters();
  }

  protected onMemberSelect(member: any) {
    this.selectedMember.set(member?.id || null);
    this.uploadData.family_member_id = member?.id || '';
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.documents()];

    // Filter by search term
    const searchTerm = this.searchTerm().toLowerCase();
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description?.toLowerCase().includes(searchTerm) ||
        doc.file_name.toLowerCase().includes(searchTerm) ||
        doc.member_name?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by category
    const selectedCategory = this.selectedCategory();
    if (selectedCategory) {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    // Filter by family member
    const selectedMember = this.selectedMember();
    if (selectedMember) {
      filtered = filtered.filter(doc => doc.family_member_id === selectedMember);
    }

    this.filteredDocuments.set(filtered);
  }

  protected onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadData.document = file;
      // Auto-fill title if empty
      if (!this.uploadData.title) {
        this.uploadData.title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      }
    }
  }

  protected async uploadDocument() {
    if (!this.uploadData.document || !this.uploadData.title || !this.uploadData.category) {
      alert('Please fill in all required fields and select a file');
      return;
    }

    this.isUploading.set(true);
    try {
      // Ensure family is selected before uploading
      await this.ensureFamilySelected();
      
      const currentFamily = this.authService.getCurrentFamily();
      if (!currentFamily) {
        alert('Unable to select a family. Please try again or contact support.');
        return;
      }

      const formData = new FormData();
      formData.append('document', this.uploadData.document);
      formData.append('title', this.uploadData.title);
      formData.append('description', this.uploadData.description);
      formData.append('category', this.uploadData.category);
      formData.append('family_id', currentFamily.id);
      formData.append('family_member_id', this.uploadData.family_member_id);

      const response = await this.apiService.uploadDocument(formData).toPromise();
      if (response?.success) {
        alert('Document uploaded successfully!');
        this.resetUploadForm();
        this.loadDocuments();
        this.loadCategories();
        this.loadStats();
      } else {
        alert('Failed to upload document. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Error uploading document. Please try again.');
    } finally {
      this.isUploading.set(false);
    }
  }

  protected async downloadDocument(document: Document) {
    try {
      const response = await this.apiService.downloadDocument(document.id).toPromise();
      if (response) {
        // Create blob and download
        const blob = new Blob([response], { type: document.file_type });
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.file_name;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    }
  }

  protected async deleteDocument(document: Document) {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      const response = await this.apiService.deleteDocument(document.id).toPromise();
      if (response?.success) {
        alert('Document deleted successfully!');
        this.loadDocuments();
        this.loadCategories();
        this.loadStats();
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document. Please try again.');
    }
  }

  protected toggleUploadForm() {
    this.showUploadForm.update(v => !v);
    if (!this.showUploadForm()) {
      this.resetUploadForm();
    }
  }

  resetUploadForm() {
    this.uploadData = {
      title: '',
      description: '',
      category: '',
      family_member_id: '',
      document: null
    };
    this.showUploadForm.set(false);
  }

  protected formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  protected formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  protected getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'ID Proofs': '🆔',
      'Medical Reports': '🏥',
      'Receipts': '🧾',
      'Bills': '💸',
      'Insurance': '🛡️',
      'Educational': '🎓',
      'Legal': '⚖️',
      'Financial': '💰',
      'Travel': '✈️',
      'Other': '📄'
    };
    return icons[category] || '📄';
  }

  protected clearFilters() {
    this.searchTerm.set('');
    this.selectedCategory.set('');
    this.selectedMember.set(null);
    this.uploadData.family_member_id = '';
    this.applyFilters();
  }
}
