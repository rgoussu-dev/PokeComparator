export const sanitizeCssValue = (val: string | undefined): string => {
    if (!val) return '';
    // Allow alphanum, unit chars and common calc operators/parentheses/space
    return String(val).replace(/[^0-9a-zA-Z().% \-+*/]/g, '');
};

export const generateSignature = (config: Record<string, unknown>): string => {
    const entries = Object.entries(config)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
        .map(([key, value]) => `${key}:${value}`);
    return hashString(entries.join('|'));
};

export const hashString = (s: string): string => {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = (h * 33) ^ s.charCodeAt(i);
    }
    // convert to positive 32-bit and base36
    return (h >>> 0).toString(36);
}

// Might want to be able to remove old styles if no longer used, but for now just inject and dedupe
export const injectStyle = (component: string, signature: string, style: string) => {
        // dedupe by signature in document head
    const selector = `style[data-generated-by="${component}"][data-signature="${signature}"]`;
    let headStyle = document.head.querySelector(selector) as HTMLStyleElement | null;
    if (!headStyle) {
      headStyle = document.createElement('style');
      headStyle.setAttribute('data-generated-by', component);
      headStyle.setAttribute('data-signature', signature);
      headStyle.textContent = style;
      document.head.appendChild(headStyle);
    } else {
      // ensure content is up-to-date (in case first instance used slightly different sanitization)
      headStyle.textContent = style;
    }
}