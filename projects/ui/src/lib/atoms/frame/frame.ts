import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle } from '../helpers/atom-config-helper';

const parseRatio = (ratio: string): { n: number; d: number } => {
  const [n, d] = ratio.split(':').map(Number);
  return {
    n: isNaN(n) ? 16 : n,
    d: isNaN(d) ? 9 : d,
  };
}

@Component({
  selector: 'pc-frame',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'frame' }
})
export class Frame implements OnInit, OnChanges, OnDestroy {
  @Input() ratio = '16:9';

  ident?: string;
  config: { n: number; d: number } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['ratio']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const { n, d } = parseRatio(this.ratio);
    this.config = { n, d };
    const signature = `pc-frame-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-frame');
      host.classList.remove('frame');
    } catch {
      console.warn('Could not clean up Frame attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { n: number; d: number }): string {
    const { n, d } = config;
    return `
      .frame[data-pc-frame="${signature}"] {
        --n: ${n};
        --d: ${d};
        aspect-ratio: var(--n) / var(--d);
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .frame[data-pc-frame="${signature}"] > img,
      .frame[data-pc-frame="${signature}"] > video {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-frame', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('frame');
    host.setAttribute('data-pc-frame', this.ident);
  }
}
