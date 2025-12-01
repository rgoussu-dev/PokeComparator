import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { ALL_SIZES, Size } from '../../types/size';

@Component({
  selector: 'pc-icon',
  template: `
    <span class="with-icon" [attr.data-pc-icon]="ident" [attr.aria-label]="label ? label : null" [attr.role]="label ? 'img' : null">
      <svg class="icon" [attr.data-pc-icon]="ident">
        <use [attr.href]="iconHref"></use>
      </svg>
    </span>
    <ng-content></ng-content>
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'icon' }
})
export class Icon implements OnInit, OnChanges, OnDestroy {
  @Input() space: Size | string | null = null;
  @Input() label: string | null = null;
  @Input() iconHref = '';

  ident?: string;
  config: { space: string | null; label: string | null } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['space'] || changes['label']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const space = this.space === null ? null:  ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    const label = this.label;
    this.config = { space, label };
    const signature = `pc-icon-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-icon');
      host.classList.remove('with-icon');
    } catch {
      console.warn('Could not clean up Icon attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { space: string | null; label: string | null }): string {
    const { space } = config;
    return `
        .icon[data-pc-icon="${signature}"] {
        width: 0.75em;
        width: 1cap;
        height: 0.75em;
        height: 1cap;
        ${space !== null ? `margin-inline-end: ${space};` : ''}
      }
      .with-icon[data-pc-icon="${signature}"] {
        display: inline-flex;
        align-items: baseline;
      }
 
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-icon', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('with-icon');
    host.setAttribute('data-pc-icon', this.ident);
  }
}
