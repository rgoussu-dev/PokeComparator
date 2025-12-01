import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pc-input',
  templateUrl: './input.html',
  styleUrls: ['./input.css'],
  host: { 'data-pc-component': 'input' }
})
export class InputAtom {
  @Input() value = '';
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() type = 'text';
  @Input() ariaLabel = '';
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.valueChange.emit(input.value);
  }
}
