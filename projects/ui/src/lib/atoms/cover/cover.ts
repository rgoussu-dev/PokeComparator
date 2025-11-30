import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { Size, ALL_SIZES } from '../../types/size';

@Component({
  selector: 'pc-cover',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cover implements OnInit, OnChanges, OnDestroy {
  @Input() centered: string = 'h1';
  @Input() space: Size | string = 's1';
  @Input() minHeight: Size | string = 'measure';
  @Input() noPad: boolean = false;

  ident?: string;
  config: { centered: string; space: string; minHeight: string; noPad: boolean } | null = null;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['centered'] || changes['space'] || changes['minHeight'] || changes['noPad']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const centered = this.centered || 'h1';
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    const minHeight = ALL_SIZES.includes(this.minHeight as Size) ? `var(--${this.minHeight})` : sanitizeCssValue(this.minHeight as string);
    const noPad = !!this.noPad;
    this.config = { centered, space, minHeight, noPad };
    const signature = `pc-cover-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-cover');
      host.classList.remove('cover');
    } catch (_e) {
      console.warn('Could not clean up Cover attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { centered: string; space: string; minHeight: string; noPad: boolean }): string {
    const { centered, space, minHeight, noPad } = config;
    // Remove selector dots if present for tag selectors
    const centeredSelector = centered.startsWith('.') ? centered : centered;
    return `
      .cover[data-pc-cover="${signature}"] {
        display: flex;
        flex-direction: column;
        min-block-size: ${minHeight};
        padding: ${noPad ? '0' : space};
      }
      .cover[data-pc-cover="${signature}"] > * {
        margin-block: ${space};
      }
      .cover[data-pc-cover="${signature}"] > :first-child:not(${centeredSelector}) {
        margin-block-start: 0;
      }
      .cover[data-pc-cover="${signature}"] > :last-child:not(${centeredSelector}) {
        margin-block-end: 0;
      }
      .cover[data-pc-cover="${signature}"] > ${centeredSelector} {
        margin-block: auto;
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-cover', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('cover');
    host.setAttribute('data-pc-cover', this.ident);
  }
}
