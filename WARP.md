# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AgroConecta is an Angular 17 frontend application built with the standalone components architecture. The project uses Angular CLI for scaffolding and build processes, with Angular Material for UI components and SCSS for styling.

## Development Commands

### Core Development
- `npm start` - Start development server (localhost:4200)
- `npm run build` - Build for production
- `npm run watch` - Build with watch mode for development
- `npm test` - Run unit tests with Karma
- `npm run ng` - Access Angular CLI commands directly

### Angular CLI Commands
- `ng generate component <name>` - Generate new component with SCSS styling
- `ng generate service <name>` - Generate new service
- `ng generate module <name>` - Generate new module
- `ng build --configuration development` - Development build
- `ng build --configuration production` - Production build with optimization

### Testing
- `ng test` - Run all tests
- `ng test --watch=false` - Run tests once without watch mode
- `ng test --code-coverage` - Run tests with coverage report

## Architecture

### Project Structure
- Uses Angular 17 standalone components architecture
- Modern component-first approach without traditional NgModules
- Routing configured with functional guards and providers
- Strict TypeScript configuration enabled

### Key Technologies
- **Angular 17.3**: Core framework with latest features
- **Angular Material 20.2**: UI component library
- **Angular CDK 20.2**: Component dev kit for advanced UI patterns
- **SCSS**: Styling with component-level and global styles
- **RxJS 7.8**: Reactive programming
- **Karma + Jasmine**: Testing framework

### Application Bootstrap
The app uses `bootstrapApplication()` instead of traditional NgModule bootstrap:
- Main entry point: `src/main.ts`
- App configuration: `src/app/app.config.ts`
- Root component: `src/app/app.component.ts`

### Component Architecture
- **Standalone Components**: All components are standalone by default
- **Component prefix**: `app-` for all generated components
- **Styling**: SCSS files with component-scoped styles
- **Template**: Inline or separate HTML files

### Routing
- Functional routing with `provideRouter()`
- Routes defined in `src/app/app.routes.ts`
- Currently empty - ready for feature route definitions

### Build Configuration
- **Production**: Optimized builds with output hashing
- **Development**: Source maps enabled, no optimization
- **Bundle budgets**: 500kb warning, 1MB error for initial bundle
- **Assets**: Favicon and assets folder included in builds

## Development Guidelines

### Component Generation
When creating components, the CLI is configured to:
- Use SCSS for styling by default
- Generate standalone components
- Apply the `app-` prefix

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- ES2022 target with modern JavaScript features
- Experimental decorators enabled for Angular

### Testing Strategy
- Unit tests for all components using Jasmine/Karma
- Default test setup includes component creation and basic functionality tests
- Coverage reports available

### Build Process
- Development builds include source maps and no optimization
- Production builds are fully optimized with tree shaking
- Assets are automatically hashed in production builds

## Project State

This is a newly initialized Angular project with:
- Default Angular welcome page as placeholder
- Empty routing configuration ready for feature development
- Material Design components available but not yet implemented
- Clean project structure ready for feature development

The application is in early development stage with standard Angular CLI scaffolding in place.
