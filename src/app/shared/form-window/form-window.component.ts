import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-window',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-window.component.html',
  styleUrl: './form-window.component.css'
})
export class FormWindowComponent {
  @Input() isOpen = signal(false);
  @Input() title = '';
  @Input() isLoading = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
