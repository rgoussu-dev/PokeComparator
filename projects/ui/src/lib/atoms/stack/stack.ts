import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

@Component({
  selector: 'pc-stack',
  imports: [],
  templateUrl: './stack.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'stack' }
})
export class Stack implements OnInit, OnChanges, OnDestroy {
  @Input() space: Size | string = 's1';
  @Input() recursive = false;
  @Input() splitAfter: number | null = null;

  ident?: string;
  config: { space: string; recursive: boolean; splitAfter: number | null } | null = null;

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['space'] || changes['recursive']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    const space = ALL_SIZES.includes(this.space as Size) ? `var(--${this.space})` : sanitizeCssValue(this.space as string);
    const splitAfter = this.splitAfter != null ? Math.max(1, Math.floor(Number(this.splitAfter) || 1)) : null;
    this.config = {
      space,
      recursive: !!this.recursive,
      splitAfter: splitAfter
    };

    const signature = `pc-stack-${generateSignature(this.config)}`;
    this.ident = signature;

    const host = this.el.nativeElement as HTMLElement;
    host.classList.add('stack');
    host.setAttribute('data-pc-stack', signature);
  }

  ngOnDestroy(): void {
    try {
      const host = this.el.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-stack');
      host.classList.remove('stack');
    } catch {
      console.warn('Could not clean up Stack attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { space: string; recursive: boolean, splitAfter: number | null }): string {
    const { space, recursive, splitAfter } = config;
    return `
    .stack[data-pc-stack="${signature}"] {
      display: flex;
      flex-direction: column;
          justify-content: flex-start;
    }

    .stack[data-pc-stack="${signature}"] > * {
        margin-block: 0;
    }
    
    ${recursive ? `
    .stack[data-pc-stack="${signature}"] * + * {
      margin-block-start: ${space};
    }
    ` : ` 
    .stack[data-pc-stack="${signature}"] > * + * {
      margin-block-start: ${space};
    }`}

    ${splitAfter ? `
    .stack[data-pc-stack="${signature}"]:only-child {
      block-size: 100%;
    } 
    .stack[data-pc-stack="${signature}"] > :nth-child(${splitAfter}){
      margin-block-end: auto;
    }
    ` : ``  }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle("pc-stack",this.ident, style);
  }
}
