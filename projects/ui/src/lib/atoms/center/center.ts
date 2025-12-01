import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, SimpleChanges, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { ALL_SIZES, Size } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

@Component({
  selector: 'pc-center',
  imports: [],
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'center' }
})
export class Center implements OnInit, OnChanges {
  @Input() maxWidth: Size | null = null;
  @Input() centerText = false;
  @Input() intrinsic = false;
  @Input() gutterWidth: Size | null = null;

  ident: string | null = null;
  config: { maxWidth: string  | null; centerText: boolean; intrinsic: boolean; gutterWidth: string | null; } 
  | null = null;

  private readonly element = inject(ElementRef);
  
  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['maxWidth'] || changes['centerText'] || changes['intrinsic'] || changes['gutterWidth']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateStyle() {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-center', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('center');
    host.setAttribute('data-pc-center', this.ident);

  }
  updateConfigAndSignature() {
    this.config = {
      maxWidth: this.maxWidth == null ? null : ALL_SIZES.includes(this.maxWidth) ? `var(--${this.maxWidth})` : sanitizeCssValue(this.maxWidth),
      centerText: this.centerText,
      intrinsic: this.intrinsic,
      gutterWidth: this.gutterWidth == null ? null : ALL_SIZES.includes(this.gutterWidth) ? `var(--${this.gutterWidth})` : sanitizeCssValue(this.gutterWidth),
    };

    const signature = `pc-center-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  private generateStyle(signature: string, config: { maxWidth: string | null; centerText: boolean; intrinsic: boolean; gutterWidth: string | null; }): string {
    const { maxWidth, centerText, intrinsic, gutterWidth } = config;
    return `
    .center[data-pc-center="${signature}"] {
        display: block;
        unicode-bidi: isolate;
        box-sizing: content-box;
        margin-inline: auto;
        ${maxWidth != null ? `max-inline-size: ${maxWidth};` : ''}
        ${centerText ? 'text-align: center;' : ''}
        ${intrinsic ? '    display:flex; flex-direction: column; align-items: center;' : ''}
        ${gutterWidth != null ? `padding-inline-start: ${gutterWidth}; padding-inline-end: ${gutterWidth};` : ''}
  }
    `;
  }
}
