import { Component, Input } from '@angular/core';

@Component({
  selector: 'pc-button',
  templateUrl: './button.html',
  styleUrls: ['./button.css'],
  host: { 'data-pc-component': 'button' }
})
export class Button {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() ariaLabel?: string;
  @Input() fullWidth = false;
  @Input() rounded = false;
  
}
