
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { ALL_SIZES, Size } from '../../types/size';

@Component({
  selector: 'pc-sidebar',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sidebar implements OnInit, OnChanges, OnDestroy {
  @Input() side: 'left' | 'right' = 'left';
  @Input() sideWidth: Size | string | null = null;
  @Input() contentMin: string = '50%';
  @Input() space: Size | string = 's2';
  @Input() noStretch: boolean = false;

  ident?: string;
  config: { side: string; sideWidth: string | null; contentMin: string; space: string; noStretch: boolean } | null = null;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['side'] || changes['sideWidth'] || changes['contentMin'] || changes['space'] || changes['noStretch']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const side = this.side === 'right' ? 'right' : 'left';
    const sideWidth = this.sideWidth ? sanitizeCssValue(this.sideWidth) : null;
    const contentMin = sanitizeCssValue(this.contentMin);
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space);
    const noStretch = !!this.noStretch;
    this.config = { side, sideWidth, contentMin, space, noStretch };
    const signature = `pc-sidebar-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-sidebar');
      host.classList.remove('with-sidebar');
    } catch (_e) {
      console.warn('Could not clean up Sidebar attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { side: string; sideWidth: string | null; contentMin: string; space: string; noStretch: boolean }): string {
    const { side, sideWidth, contentMin, space, noStretch } = config;
    // Determine selectors based on side
    const sidebarSelector = side === 'right' ? '> :last-child' : '> :first-child';
    const contentSelector = side === 'right' ? '> :first-child' : '> :last-child';
    // Sidebar width fallback
    const sidebarBasis = sideWidth ? sideWidth : 'auto';
    // Content min width
    const contentMinInline = contentMin || '50%';
    // Flex align
    const align = noStretch ? 'flex-start' : 'stretch';
    return `
      .with-sidebar[data-pc-sidebar="${signature}"] {
        display: flex;
        flex-wrap: wrap;
        gap: ${space};
        align-items: ${align};
      }
      .with-sidebar[data-pc-sidebar="${signature}"] ${sidebarSelector} {
        ${sideWidth ? `flex-basis: ${sideWidth};` : ''}
        flex-grow: 1;
      }
      .with-sidebar[data-pc-sidebar="${signature}"] ${contentSelector} {
        flex-basis: 0;
        flex-grow: 999;
        min-inline-size: ${contentMinInline};
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-sidebar', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('with-sidebar');
    host.setAttribute('data-pc-sidebar', this.ident);
  }
}
