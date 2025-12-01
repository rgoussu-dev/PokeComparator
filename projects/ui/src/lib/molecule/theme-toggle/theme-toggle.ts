import { Component, EventEmitter, Input, output, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Button } from '../../atoms/button/button';
import { Icon } from '../../atoms/icon/icon';

@Component({
  selector: 'pc-theme-toggle',
  standalone: true,
  imports: [CommonModule, Button, Icon],
  templateUrl: './theme-toggle.html',
  styleUrls: ['./theme-toggle.css']
})
export class ThemeToggle {
  @Input() isDark: boolean = false;
  isDarkChange = output<boolean>();

  onToggle() {
    this.isDark = !this.isDark;
    this.isDarkChange.emit(this.isDark);
  }
}
