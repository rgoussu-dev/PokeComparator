import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

@Component({
  selector: 'pc-imposter',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'imposter' }
})
export class Imposter implements OnInit, OnChanges, OnDestroy {
  @Input() breakout = false;
  @Input() margin = '0';
  @Input() fixed = false;

  ident?: string;
  config: { breakout: boolean; margin: string; fixed: boolean } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['breakout'] || changes['margin'] || changes['fixed']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const breakout = !!this.breakout;
    const margin = sanitizeCssValue(this.margin);
    const fixed = !!this.fixed;
    this.config = { breakout, margin, fixed };
    const signature = `pc-imposter-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-imposter');
      host.classList.remove('imposter');
      host.classList.remove('contain');
    } catch {
      console.warn('Could not clean up Imposter attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { breakout: boolean; margin: string; fixed: boolean }): string {
    const { margin, fixed } = config;
    const position = fixed ? 'fixed' : 'absolute';
    return `
      .imposter[data-pc-imposter="${signature}"] {
        position: ${position};
        inset-block-start: 50%;
        inset-inline-start: 50%;
        transform: translate(-50%, -50%);
      }
      .imposter[data-pc-imposter="${signature}"].contain {
        --margin: ${margin};
        overflow: auto;
        max-inline-size: calc(100% - (var(--margin) * 2));
        max-block-size: calc(100% - (var(--margin) * 2));
      }
      .imposter[data-pc-imposter="${signature}"].breakout {
        /* No containment, allow breakout */
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-imposter', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('imposter');
    host.setAttribute('data-pc-imposter', this.ident);
    if (this.breakout) {
      host.classList.add('breakout');
      host.classList.remove('contain');
    } else {
      host.classList.add('contain');
      host.classList.remove('breakout');
    }
  }
}
