import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In — RxJS Operator Studio'
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./core/layout/app-shell/app-shell.component').then(m => m.AppShellComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-page/dashboard-page.component').then(m => m.DashboardPageComponent),
        title: 'RxJS Operator Studio — Dashboard'
      },
      {
        path: 'catalog',
        loadComponent: () => import('./features/operators/operator-catalog/operator-catalog.component').then(m => m.OperatorCatalogComponent),
        title: 'Operator Explorer — RxJS Operator Studio'
      },
      {
        path: 'operators/:id',
        loadComponent: () => import('./features/operators/operator-detail/operator-detail-host.component').then(m => m.OperatorDetailHostComponent),
        title: 'Operator Lab — RxJS Operator Studio'
      },
      {
        path: 'scenarios',
        loadComponent: () => import('./features/scenarios/scenarios-overview/scenarios-overview.component').then(m => m.ScenariosOverviewComponent),
        title: 'Enterprise Scenarios — RxJS Operator Studio'
      },
      {
        path: 'scenarios/search-autocomplete',
        loadComponent: () => import('./features/scenarios/search-autocomplete-scenario/search-autocomplete-scenario.component').then(m => m.SearchAutocompleteScenarioComponent),
        title: 'Scenario A: Search Autocomplete — RxJS Operator Studio'
      },
      {
        path: 'scenarios/api-dashboard',
        loadComponent: () => import('./features/scenarios/api-dashboard-scenario/api-dashboard-scenario.component').then(m => m.ApiDashboardScenarioComponent),
        title: 'Scenario B: Multi-Source API Dashboard — RxJS Operator Studio'
      },
      {
        path: 'scenarios/order-workflow',
        loadComponent: () => import('./features/scenarios/order-workflow-scenario/order-workflow-scenario.component').then(m => m.OrderWorkflowScenarioComponent),
        title: 'Scenario C: Order Workflow — RxJS Operator Studio'
      },
      {
        path: 'scenarios/reliable-api-client',
        loadComponent: () => import('./features/scenarios/reliable-api-scenario/reliable-api-scenario.component').then(m => m.ResilientApiScenarioComponent),
        title: 'Scenario D: Reliable API Client — RxJS Operator Studio'
      },
      {
        path: 'scenarios/live-activity-feed',
        loadComponent: () => import('./features/scenarios/live-activity-feed-scenario/live-activity-feed-scenario.component').then(m => m.LiveActivityFeedScenarioComponent),
        title: 'Scenario E: Live Real-Time Activity Feed — RxJS Operator Studio'
      },
      {
        path: 'scenarios/caching-layer',
        loadComponent: () => import('./features/scenarios/caching-scenario/caching-scenario.component').then(m => m.CachingScenarioComponent),
        title: 'Scenario F: Client-Side Multi-Subscriber Cache — RxJS Operator Studio'
      },
      {
        path: 'scenarios/reactive-forms',
        loadComponent: () => import('./features/scenarios/reactive-form-scenario/reactive-form-scenario.component').then(m => m.ReactiveFormScenarioComponent),
        title: 'Scenario G: Reactive Form Async Validation — RxJS Operator Studio'
      },
      {
        path: 'subjects',
        loadComponent: () => import('./features/subjects/subjects-overview/subjects-overview.component').then(m => m.SubjectsOverviewComponent),
        title: 'Subjects & Primitives Lab — RxJS Operator Studio'
      },
      {
        path: '**',
        redirectTo: ''
      }
    ]
  }
];

