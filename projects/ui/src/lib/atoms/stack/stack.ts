import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'stack',
  imports: [],
    templateUrl: './stack.html',
    styleUrl: './stack.css',
  encapsulation: ViewEncapsulation.None
})
export class Stack {
  @Input() space: string = '--s-1';
}
