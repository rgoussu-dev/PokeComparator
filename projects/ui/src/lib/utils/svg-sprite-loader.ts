/**
 * Injects the SVG sprite into the document for icon usage.
 * Uses document.baseURI to resolve the path correctly regardless of deployment context.
 * 
 * @param spritePath - Relative path to the sprite file (default: './assets/ui/sprite.svg')
 */
export function injectSvgSprite(spritePath = './assets/ui/sprite.svg'): void {
  const spriteUrl = new URL(spritePath, document.baseURI).href;
  
  fetch(spriteUrl)
    .then(response => response.text())
    .then(svg => {
      const container = document.createElement('div');
      container.style.display = 'none';
      container.id = 'svg-sprite-container';
      container.innerHTML = svg;
      document.body.insertBefore(container, document.body.firstChild);
    })
    .catch(() => {
      /* Silent fallback - icons will show fallback state */
    });
}
