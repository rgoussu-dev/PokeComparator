import { Injectable, signal, computed } from '@angular/core';

export interface NavLink {
  label: string;
  callback: () => void;
  icon?: string;
}

// Global state key for cross-microfrontend communication
const NAV_STATE_KEY = '__pc_navigation_state__';

interface GlobalNavState {
  breadcrumbs: NavLink[];
  listeners: Set<(links: NavLink[]) => void>;
}

interface WindowWithNavState extends Window {
  [NAV_STATE_KEY]?: GlobalNavState;
}

// Initialize global state
function getGlobalState(): GlobalNavState {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithNavState;
    if (!win[NAV_STATE_KEY]) {
      win[NAV_STATE_KEY] = {
        breadcrumbs: [],
        listeners: new Set()
      };
    }
    return win[NAV_STATE_KEY];
  }
  return { breadcrumbs: [], listeners: new Set() };
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly breadcrumbsSignal = signal<NavLink[]>(getGlobalState().breadcrumbs);
  
  /** Current breadcrumb links as a readonly signal */
  readonly breadcrumbs = this.breadcrumbsSignal.asReadonly();
  
  /** Whether there are any breadcrumbs */
  readonly hasBreadcrumbs = computed(() => this.breadcrumbsSignal().length > 0);

  constructor() {
    // Register as a listener to global state changes
    const globalState = getGlobalState();
    const updateLocal = (links: NavLink[]) => {
      this.breadcrumbsSignal.set(links);
    };
    globalState.listeners.add(updateLocal);
    
    // Sync initial state
    this.breadcrumbsSignal.set(globalState.breadcrumbs);
  }

  /**
   * Set the current breadcrumb trail
   * @param links Array of navigation links to display
   */
  setBreadcrumbs(links: NavLink[]): void {
    this.updateGlobalState([...links]);
  }

  /**
   * Add a single breadcrumb to the trail
   * @param link Navigation link to add
   */
  addBreadcrumb(link: NavLink): void {
    const current = getGlobalState().breadcrumbs;
    this.updateGlobalState([...current, link]);
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.updateGlobalState([]);
  }

  /**
   * Set a single "back" link (convenience method)
   * @param label The label for the back link
   * @param callback The function to call when clicked
   */
  setBackLink(label: string, callback: () => void): void {
    this.updateGlobalState([{ label, callback, icon: 'arrow-left' }]);
  }

  private updateGlobalState(links: NavLink[]): void {
    const globalState = getGlobalState();
    globalState.breadcrumbs = links;
    
    // Notify all listeners (including this instance)
    globalState.listeners.forEach(listener => listener(links));
  }
}
