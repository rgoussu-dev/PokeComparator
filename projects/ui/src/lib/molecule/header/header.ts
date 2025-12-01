import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Label } from '../../atoms/label/label';
import { CommonModule } from '@angular/common';
import { Box } from '../../atoms/box/box';
import { Cluster } from '../../atoms/cluster/cluster';
import { Frame } from '../../atoms/frame/frame';
import { Button } from '../../atoms/button/button';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'pc-header',
  imports: [CommonModule, Label, Box, Cluster, Frame, ThemeToggle, Button],
  templateUrl: './header.html',
  styleUrls: ['./header.css'],
  host: { 'data-pc-component': 'header' }
})
export class Header {
  @Input() title: string | null = null;
  @Input() logoSrc: string | null = null; // image source for the logo
  @Input() links: { label: string; href: string, callback: () => void }[] = [];
  @Input() subtitle: string | null = null;
  @Output() logoClick: EventEmitter<void> = new EventEmitter<void>();

  readonly navigationService = inject(NavigationService);

  onLogoClick(): void {
    this.logoClick.emit();
  }
}
