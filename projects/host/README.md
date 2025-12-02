# Host Application

The **Host** application is the shell/container application that orchestrates all microfrontends in the Pokecomparator system. It provides the main layout, navigation, and dynamically loads remote modules using **Webpack Module Federation**.

## Purpose

The host application serves as:
- **Entry point** - Main application users access at `localhost:4200`
- **Shell** - Provides common layout, header, and navigation
- **Orchestrator** - Dynamically loads and coordinates microfrontend modules
- **Router** - Manages top-level routing and lazy-loads remote modules

## Key Concepts

### Microfrontend Architecture

The host uses **Module Federation** to:
1. Share common dependencies (Angular, RxJS, domain library)
2. Dynamically load remote modules at runtime
3. Enable independent deployment of features
4. Allow separate development workflows

### Shell Application Pattern

The host is a "thin" shell that:
- Contains minimal feature code
- Delegates features to remote modules
- Provides shared UI elements (header, footer)
- Manages global state (if any)

## Directory Structure

```
projects/host/src/
├── app/
│   ├── app.ts                    # Root component
│   ├── app.html                  # Root template
│   ├── app.css                   # Root styles
│   ├── app.config.ts             # Application configuration
│   ├── app.routes.ts             # Route definitions (loads remotes)
│   └── components/
│       ├── home/                 # Landing page component
│       └── not-found/            # 404 page component
├── environments/
│   ├── environment.ts            # Dev environment (localhost URLs)
│   └── environment.prod.ts       # Production environment
└── main.ts                       # Bootstrap file
```

## Module Federation Configuration

### Webpack Config

Located in `projects/host/webpack.config.js`:

```javascript
withModuleFederationPlugin({
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
  sharedMappings: ['@ui', '@domain', '@infra'],
});
```

**Key Settings:**
- **singleton**: Ensures only one instance of shared libs
- **strictVersion**: Enforces version compatibility
- **sharedMappings**: Maps local libraries to be shared across remotes

### Environment Configuration

Remote URLs are configured in `environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  remotes: {
    catalog: 'http://localhost:4210/remoteEntry.js',
    detail: 'http://localhost:4220/remoteEntry.js',
    compare: 'http://localhost:4230/remoteEntry.js',
  }
};
```

**Port Assignment:**
- Host: `4200`
- Remote Catalog: `4210`
- Remote Detail: `4220`
- Remote Compare: `4230`

## Routes

The host defines top-level routes that lazy-load microfrontends:

```typescript
export const APP_ROUTES: Routes = [
  {
    title: 'Home',
    path: '',
    component: HomeComponent
  },
  {
    title: 'Pokemon Catalog',
    path: 'catalog',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.catalog,
      exposedModule: './CatalogModule'
    }).then(m => m.CatalogModule)
  },
  {
    title: 'Detail',
    path: 'detail',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.detail,
      exposedModule: './DetailModule'
    }).then(m => m.DetailModule)
  },
  {
    title: 'Comparator',
    path: 'compare',
    loadChildren: () => loadRemoteModule({
      type: 'module',
      remoteEntry: environment.remotes.compare,
      exposedModule: './CompareModule'
    }).then(m => m.CompareModule)
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];
```

### Route Mapping

| URL Path | Remote | Module Loaded |
|----------|--------|---------------|
| `/` | (local) | HomeComponent |
| `/catalog` | remote-catalog:4210 | CatalogModule |
| `/detail/:id` | remote-detail:4220 | DetailModule |
| `/compare?pokemon1=X&pokemon2=Y` | remote-compare:4230 | CompareModule |
| `/**` | (local) | NotFoundComponent |

## Components

### HomeComponent

Landing page displaying:
- Welcome message
- Feature highlights
- Navigation links to catalog

**Location:** `components/home/`

### NotFoundComponent

404 error page displayed when route doesn't match.

**Location:** `components/not-found/`

## Running the Application

### Development Mode

Start the host application:

```bash
ng serve host
```

Access at: `http://localhost:4200`

> **Note:** The host requires remote modules to be running. Use `npm run run:all` to start all applications.

### Running All Microfrontends

```bash
npm run run:all
```

This starts:
- Host at `:4200`
- Remote Catalog at `:4210`
- Remote Detail at `:4220`
- Remote Compare at `:4230`

## Building

### Development Build

```bash
ng build host
```

### Production Build

```bash
ng build host --configuration production
```

The production build uses `environment.prod.ts` with production remote URLs.

## Standalone Mode

The host can operate in **standalone mode** where it doesn't require remote modules to be running. This is useful for:
- Local development
- Demo purposes
- CI/CD pipelines

### Enabling Standalone Mode

Set the `STANDALONE_MODE` feature flag in the environment:

```typescript
export const environment = {
  production: false,
  standaloneMode: true, // Enable standalone
  remotes: { /* ... */ }
};
```

In standalone mode, the host can:
- Show placeholder content for missing remotes
- Use mock implementations
- Display error states gracefully

> **Note:** See `docs/features/standalone-mode-feature-flags.md` for implementation details.

## Shared Dependencies

The host shares these libraries with all remotes:

| Library | Version Strategy | Purpose |
|---------|------------------|---------|
| **@angular/core** | Singleton | Angular framework |
| **@angular/router** | Singleton | Routing |
| **rxjs** | Singleton | Reactive programming |
| **@domain** | Shared mapping | Business logic |
| **@infra** | Shared mapping | Adapters |
| **@ui** | Shared mapping | UI components |

## Deployment

### Static Hosting

The host and remotes can be deployed to separate static hosting services (Netlify, Vercel, S3, etc.).

**Requirements:**
1. Update `environment.prod.ts` with production remote URLs
2. Build all projects with production flag
3. Deploy each build artifact to its hosting location
4. Ensure CORS is properly configured

### Example Production URLs

```typescript
export const environment = {
  production: true,
  remotes: {
    catalog: 'https://catalog.pokecomparator.app/remoteEntry.js',
    detail: 'https://detail.pokecomparator.app/remoteEntry.js',
    compare: 'https://compare.pokecomparator.app/remoteEntry.js',
  }
};
```

## Testing

Run unit tests:

```bash
ng test host
```

Run e2e tests:

```bash
ng e2e host
```

## Troubleshooting

### Remote Module Not Loading

**Symptoms:** Blank page or error when navigating to a route

**Solutions:**
1. Verify the remote is running at the correct port
2. Check browser console for CORS errors
3. Verify `remoteEntry.js` is accessible
4. Check webpack configuration in both host and remote

### Version Mismatch Errors

**Symptoms:** "Shared module is not available" errors

**Solutions:**
1. Ensure all projects use same Angular version
2. Delete `node_modules` and reinstall
3. Clear webpack cache: `rm -rf .angular/cache`
4. Verify `strictVersion` settings in webpack config

### Port Already in Use

**Symptoms:** "Port 4200 is already in use"

**Solutions:**
```bash
# Kill process using the port
lsof -ti:4200 | xargs kill -9

# Or use a different port
ng serve host --port 4201
```

## Related Documentation

- [Module Federation Guide](../../docs/architecture/microfrontend-setup.md)
- [Remote Catalog](../remote-catalog/README.md)
- [Remote Detail](../remote-detail/README.md)
- [Remote Compare](../remote-compare/README.md)
- [Standalone Mode Feature](../../docs/features/standalone-mode-feature-flags.md)
