import { Component, Input } from '@angular/core';

@Component({
  selector: 'pc-label',
  templateUrl: './label.html',
  styleUrls: ['./label.css'],
  host: { 'data-pc-component': 'label' }
})
export class Label {
  @Input() text = '';
  @Input() for = '';
  @Input() required = false;
}
