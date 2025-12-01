import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'pc-theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.getInitialTheme());
  
  /** Current theme as a readonly signal */
  readonly theme = this.themeSignal.asReadonly();
  
  /** Whether dark mode is active */
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  constructor() {
    // Apply theme on service initialization
    this.applyTheme(this.themeSignal());
    
    // Listen for system theme changes
    this.listenToSystemThemeChanges();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Set a specific theme
   */
  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    this.applyTheme(theme);
    this.persistTheme(theme);
  }

  /**
   * Get the initial theme from storage or system preference
   */
  private getInitialTheme(): Theme {
    // Check localStorage first
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    }
    
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }
    
    return 'light';
  }

  /**
   * Apply the theme to the document
   */
  private applyTheme(theme: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  /**
   * Persist theme choice to localStorage
   */
  private persistTheme(theme: Theme): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }

  /**
   * Listen for system theme preference changes
   */
  private listenToSystemThemeChanges(): void {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (!stored) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
}
