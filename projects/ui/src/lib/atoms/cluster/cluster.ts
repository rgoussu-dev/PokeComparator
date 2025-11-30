import { ChangeDetectionStrategy, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';
import { JustifyContent, AlignItems, ALL_JUSTIFY_CONTENT, ALL_ALIGN_ITEMS } from '../../types/alignement';

@Component({
  selector: 'pc-cluster',
  imports: [],
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Cluster implements OnInit, OnChanges, OnDestroy {
  @Input() justify: JustifyContent = 'flex-start';
  @Input() align: AlignItems = 'flex-start';
  @Input() space: Size | string = 's1';

  ident?: string;
  config: { space: string; justify: string; align: string } | null = null;

  constructor(private element: ElementRef) {}

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['space'] || changes['justify'] || changes['align']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    const justify = ALL_JUSTIFY_CONTENT.includes(this.justify as JustifyContent) ? this.justify : sanitizeCssValue(this.justify as string);
    const align = ALL_ALIGN_ITEMS.includes(this.align as AlignItems) ? this.align : sanitizeCssValue(this.align as string);

    this.config = { space, justify, align };

    const signature = `pc-cluster-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-cluster');
      host.classList.remove('cluster');
    } catch (_e) {
      console.warn('Could not clean up Cluster attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { space: string; justify: string; align: string }): string {
    const { space, justify, align } = config;
    return `
    .cluster[data-pc-cluster="${signature}"] {
      unicode-bidi: isolate;
      display: flex;
      flex-wrap: wrap;
      gap: ${space || 'var(--space, 1rem)'};
      justify-content: ${justify || 'flex-start'};
      align-items: ${align || 'flex-start'};
    }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-cluster', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('cluster');
    host.setAttribute('data-pc-cluster', this.ident);
  }
}
