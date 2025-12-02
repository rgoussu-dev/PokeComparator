import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

/**
 * A vertical layout primitive for stacking elements with consistent spacing.
 *
 * @description
 * The Stack component provides a vertical flexbox layout that spaces child elements
 * consistently using margin-block-start. It's based on the Stack primitive from
 * Every Layout and supports both direct children and recursive spacing modes.
 *
 * Key features:
 * - Vertical layout with configurable spacing between children
 * - Optional recursive mode for spacing all nested elements
 * - Split-after feature for pushing elements to the bottom
 * - Performance-optimized with dynamic style generation
 * - Automatic cleanup on component destroy
 * - Supports size tokens and custom spacing values
 *
 * The component uses flexbox with flex-direction: column and applies spacing
 * through margin-block-start, which respects writing modes and is more
 * maintainable than gap in some scenarios.
 *
 * @example
 * Basic vertical stack:
 * ```html
 * <pc-stack space="s-2">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </pc-stack>
 * ```
 *
 * @example
 * Recursive stack (spaces all nested elements):
 * ```html
 * <pc-stack space="s-3" [recursive]="true">
 *   <div>
 *     <p>Paragraph 1</p>
 *     <p>Paragraph 2</p>
 *   </div>
 *   <div>
 *     <p>Paragraph 3</p>
 *   </div>
 * </pc-stack>
 * ```
 *
 * @example
 * Stack with split-after (pushes remaining items to bottom):
 * ```html
 * <pc-stack space="s-2" [splitAfter]="2">
 *   <header>Header</header>
 *   <main>Main content</main>
 *   <footer>Footer (pushed to bottom)</footer>
 * </pc-stack>
 * ```
 *
 * @example
 * Stack with custom spacing:
 * ```html
 * <pc-stack space="32px">
 *   <section>Section 1</section>
 *   <section>Section 2</section>
 * </pc-stack>
 * ```
 *
 * @usageNotes
 * - Use for vertical layouts where consistent spacing is needed
 * - The first child never gets top margin (follows the lobotomized owl selector pattern)
 * - Use `recursive` mode when you need consistent spacing throughout nested content
 * - The `splitAfter` feature is useful for sticky footers or pushing items to the end
 * - When splitAfter is used and stack is the only child, it takes 100% block-size
 * - Size tokens (s-0 through s-6) provide consistent spacing aligned with your design system
 * - Custom values like '24px' or '2rem' are also supported
 * - Combine with Box for padded containers
 *
 * @see {@link Box} for adding padding around stack
 * @see {@link Cluster} for horizontal wrapping layout
 * @see {@link Size} for available size tokens
 *
 * @publicApi
 */
@Component({
  selector: 'pc-stack',
  imports: [],
  templateUrl: './stack.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'stack' }
})
export class Stack implements OnInit, OnChanges, OnDestroy {
  /** 
   * Spacing between stacked elements.
   * Can be a Size token (s-0 through s-6) or a custom CSS value.
   */
  @Input() space: Size | string = 's1';
  
  /** 
   * Whether to apply spacing recursively to all nested elements.
   * When false, only direct children are spaced. When true, all descendant elements are spaced.
   */
  @Input() recursive = false;
  
  /** 
   * Index after which to add auto margin-block-end (for pushing remaining items to bottom).
   * Useful for sticky footers or separating content groups. Minimum value is 1.
   */
  @Input() splitAfter: number | null = null;

  /** Unique identifier for this stack instance, generated from configuration. @internal */
  ident?: string;
  
  /** Current configuration object used for style generation. @internal */
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

  /**
   * Updates configuration and generates unique signature for this stack instance.
   * @internal
   */
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

  /**
   * Generates CSS styles for this stack instance.
   * Applies spacing using margin-block-start to respect writing modes.
   * @param signature - Unique identifier for this configuration
   * @param config - Configuration object with spacing and layout properties
   * @returns CSS string
   * @internal
   */
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
