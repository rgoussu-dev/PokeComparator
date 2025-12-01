/**
 * Container Layout (Every Layout)
 *
 * The Container is a meta-layout utility for establishing CSS containers, enabling container queries for responsive design.
 *
 * - Use container-type: inline-size to make an element a queryable container.
 * - Optionally set container-name for named containers, allowing queries from any descendant.
 * - Containers can be nested; queries target the closest ancestor by default, or a named ancestor if specified.
 * - Container queries allow styles to adapt to the container's dimensions, not just the viewport.
 * - This approach complements intrinsic layouts and provides an escape hatch for cases where intrinsic solutions aren't enough.
 *
 * Example usage:
 *   <pc-container name="myContainer">
 *     ...
 *   </pc-container>
 *
 * CSS:
 *   .container {
 *     container-type: inline-size;
 *     container-name: myContainer;
 *   }
 * 
 * inside another style :
 *   @container myContainer (min-width: 400px) {
 *     ...
 *   }
 *
 * For more, see Every Layout: https://every-layout.dev/layouts/container/
 */
import { ChangeDetectionStrategy, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { generateSignature, injectStyle } from '../helpers/atom-config-helper';

@Component({
  selector: 'pc-container',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-pc-component': 'container' }
})
export class Container implements OnInit, OnChanges, OnDestroy {
  @Input() name?: string;

  ident?: string;
  config: { name?: string } | null = null;

  private readonly element = inject(ElementRef);

  ngOnInit(): void {
    this.updateConfigAndSignature();
    this.updateStyle();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.ident) return;
    if (changes['name']) {
      this.updateConfigAndSignature();
      this.updateStyle();
    }
  }

  updateConfigAndSignature() {
    this.config = { name: this.name };
    const signature = `pc-container-${generateSignature(this.config)}`;
    this.ident = signature;
  }

  ngOnDestroy(): void {
    try {
      const host = this.element.nativeElement as HTMLElement;
      host.removeAttribute('data-pc-container');
      host.classList.remove('container');
    } catch {
      console.warn('Could not clean up Container attributes on destroy');
    }
  }

  private generateStyle(signature: string, config: { name?: string }): string {
    const { name } = config;
    return `
      .container[data-pc-container="${signature}"] {
        ${name ? `container-name: ${name};` : ''}
        container-type: inline-size;
       
      }
    `;
  }

  private updateStyle(): void {
    if (!this.config || !this.ident) return;
    const style = this.generateStyle(this.ident, this.config);
    injectStyle('pc-container', this.ident, style);
    const host = this.element.nativeElement as HTMLElement;
    host.classList.add('container');
    host.setAttribute('data-pc-container', this.ident);
  }
}
