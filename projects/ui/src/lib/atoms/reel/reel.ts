
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';


@Component({
  selector: 'pc-reel',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reel implements OnInit, OnChanges, OnDestroy {
  @Input() itemWidth: string = 'auto';
  @Input() space: string = 'var(--s0)';
  @Input() height: string = 'auto';
  @Input() noBar: boolean = false;
  @Input() role: string = '';

  ident?: string;
  config: {
    itemWidth: string;
    space: string;
    height: string;
    noBar: boolean;
    role: string;
  } | null = null;

  private resizeObserver?: ResizeObserver;
  private mutationObserver?: MutationObserver;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
    this.setupObservers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['itemWidth'] || changes['space'] || changes['height'] || changes['noBar'] || changes['role']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.mutationObserver?.disconnect();
  }

  private updateConfigAndSignature() {
    this.config = {
      itemWidth: sanitizeCssValue(this.itemWidth),
      space: sanitizeCssValue(this.space),
      height: sanitizeCssValue(this.height),
      noBar: this.noBar,
      role: this.role
    };
    this.ident = `pc-reel-${generateSignature(this.config)}`;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-reel', this.ident, style);
    const host = this.el.nativeElement as HTMLElement;
    host.classList.add('reel');
    host.setAttribute('data-pc-reel', this.ident);
    if (this.role) {
      host.setAttribute('role', this.role);
    } else {
      host.removeAttribute('role');
    }
  }

  private generateStyle(signature: string, config: {
    itemWidth: string;
    space: string;
    height: string;
    noBar: boolean;
    role: string;
  }): string {
    const { itemWidth, space, height, noBar } = config;
    return `
      .reel[data-pc-reel="${signature}"] {
        display: flex;
        unicode-bidi: isolate;
        block-size: ${height};
        overflow-x: ${noBar ? 'hidden' : 'auto'};
        overflow-y: hidden;
        scrollbar-color: #fff #000;
      }
      .reel[data-pc-reel="${signature}"]::-webkit-scrollbar {
        block-size: 1rem;
      }
      .reel[data-pc-reel="${signature}"]::-webkit-scrollbar-track {
        background-color: #000;
      }
      .reel[data-pc-reel="${signature}"]::-webkit-scrollbar-thumb {
        background-color: #000;
        background-image: linear-gradient(#000 0, #000 0.25rem, #fff 0.25rem, #fff 0.75rem, #000 0.75rem);
      }
      .reel[data-pc-reel="${signature}"] > * {
        flex: 0 0 ${itemWidth};
        margin: ${space};
        margin-inline-end: 0;
      }
      .reel[data-pc-reel="${signature}"] > img {
        block-size: 100%;
        flex-basis: auto;
        width: auto;
      }
      .reel[data-pc-reel="${signature}"] > * + * {
        margin-inline-start: ${space};
      }
      .reel[data-pc-reel="${signature}"].overflowing {
        padding-block-end: 1rem;
      }
    `;
  }

  private setupObservers() {
    const host = this.el.nativeElement as HTMLElement;
    const toggleOverflowClass = () => {
      if (host.scrollWidth > host.clientWidth) {
        host.classList.add('overflowing');
      } else {
        host.classList.remove('overflowing');
      }
    };
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => toggleOverflowClass());
      this.resizeObserver.observe(host);
    }
    if ('MutationObserver' in window) {
      this.mutationObserver = new MutationObserver(() => toggleOverflowClass());
      this.mutationObserver.observe(host, { childList: true });
    }
    setTimeout(toggleOverflowClass, 0);
  }
}
