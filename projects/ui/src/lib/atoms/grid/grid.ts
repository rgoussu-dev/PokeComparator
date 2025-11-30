import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { Size, ALL_SIZES } from '../../types/size';

@Component({
  selector: 'pc-grid',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Grid implements OnInit, OnChanges, OnDestroy {
  @Input() min: Size | string = '250px';
  @Input() space: Size | string = 's1';

  ident?: string;
  config: { min: string; space: string } | null = null;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['min'] || changes['space']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const min = sanitizeCssValue(this.min);
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    this.config = { min, space };
    const signature = `pc-grid-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-grid');
      host.classList.remove('grid');
    } catch (_e) {
      console.warn('Could not clean up Grid attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { min: string; space: string }): string {
    const { min, space } = config;
    return `
      .grid[data-pc-grid="${signature}"] {
        display: grid;
        grid-gap: ${space};
      }
      @supports (width: min(${min}, 100%)) {
        .grid[data-pc-grid="${signature}"] {
          grid-template-columns: repeat(auto-fit, minmax(min(${min}, 100%), 1fr));
        }
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-grid', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('grid');
    host.setAttribute('data-pc-grid', this.ident);
  }
}
