import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Size, ALL_SIZES } from '../../types/size';
import { generateSignature, injectStyle, sanitizeCssValue } from '../helpers/atom-config-helper';

/**
 * Box component that provides padding, border, background color, and text color styling.
 * The style is dynamically generated and injected based on the component's configuration.
 * To avoid style conflicts, each unique configuration generates a unique signature used in the CSS class and data attribute.
 * This ensures that multiple instances of the Box component with different configurations can coexist without style interference.
 * But also allows style reuse when multiple instances share the same configuration.
 * 
 * To optimize performance, the component only updates the injected style when relevant input properties change.
 * This minimizes unnecessary style recalculations and injections.
 * 
 * In the case of the box component, the template is a simple div wrapper with a class of "box" and a data attribute for identification. 
 * It is necessary to have that div so the styles can be applied correctly.
 * 
 * The view encapsulation is set to None to allow the injected styles to apply correctly to children component, since 
 * the styles are injected globally.
 */

@Component({
  selector: 'pc-box',
  imports: [],
  template: ` <ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'box' }
})
export class Box implements OnInit, OnChanges {
  @Input() padding: Size | string = 's1';
  @Input() borderWidth: Size | string | null = null;
  @Input() borderRadius: Size | string | null = null;
  @Input() backgroundColor: string | null = null;
  @Input() color?: string = undefined;

  ident?: string;
  config: { padding: string; borderWidth: string | null; backgroundColor: string; borderRadius: string | null; color: string } | null = null;

  private readonly el = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['padding'] || changes['borderWidth'] || changes['backgroundColor'] || changes['color']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-box', this.ident, style);
    const host = this.el.nativeElement as HTMLElement;
    host.classList.add('box');
    host.setAttribute('data-pc-box', this.ident);
  }

  private updateConfigAndSignature() {
    const padding = ALL_SIZES.includes(this.padding as Size) 
    ? `var(--${this.padding})` 
    : sanitizeCssValue(this.padding);
    const borderWidth = this.borderWidth != null ? (ALL_SIZES.includes(this.borderWidth as Size) 
    ? `var(--${this.borderWidth})`
     : sanitizeCssValue(this.borderWidth as string)) 
     : null;
    const borderRadius = this.borderRadius != null ? (ALL_SIZES.includes(this.borderRadius as Size) 
    ? `var(--${this.borderRadius})`
    : sanitizeCssValue(this.borderRadius as string)) 
    : null;
    const backgroundColor = sanitizeCssValue(this.backgroundColor || 'transparent');
    const color = sanitizeCssValue(this.color || 'inherit');

    this.config = {
      padding,
      borderWidth,
      backgroundColor,
      borderRadius,
      color
    };

    const signature = `pc-box-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  // We add display block and unicode-bidi isolate to allow padding to work correctly and align the native element 
  // set up by angular to work as a div
  private generateStyle(signature: string, config: { 
    padding: string; 
    borderWidth: string | null; 
    borderRadius: string | null;
    backgroundColor: string; 
    color: string }): string {

    const { padding, borderWidth, borderRadius, backgroundColor, color } = config;
    return `
      .box[data-pc-box="${signature}"] { 
          display: block;
          unicode-bidi: isolate;
          padding: ${padding};
          ${backgroundColor != null && `background-color: ${backgroundColor};`}
          ${color != null && `color: ${color};`}
          ${borderWidth != null && borderWidth !== '0' &&  `border: ${borderWidth} solid;`}
          ${borderWidth == null || borderWidth === '0' 
            ? `border: 0 solid; outline: var(--s-1) solid transparent; outline-offset: calc(var(--s-1) * -1);` : ``}  
          ${borderRadius != null && `border-radius: ${borderRadius};`}      
      }
      .box[data-pc-box="${signature}"] * {
        color: inherit;
      }`; 
  }
}
