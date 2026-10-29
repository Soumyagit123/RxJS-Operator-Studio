import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface SearchResultItem {
  id: string;
  title: string;
  category: string;
  snippet: string;
  matchScore: number;
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Engineer' | 'Manager';
  status: 'Active' | 'Offline';
}

export interface OrderRecord {
  id: string;
  customer: string;
  amount: number;
  status: 'Pending' | 'Processed' | 'Shipped' | 'Cancelled';
  createdAt: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeSockets: number;
  requestsPerSecond: number;
  serverStatus: 'Healthy' | 'Degraded';
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private readonly articles: SearchResultItem[] = [
    { id: '1', title: 'RxJS Concurrency Patterns in Angular', category: 'Architecture', snippet: 'Comparing switchMap, mergeMap, concatMap, and exhaustMap in real applications.', matchScore: 98 },
    { id: '2', title: 'Mastering switchMap for Typeaheads', category: 'Search', snippet: 'How in-flight request cancellation avoids race conditions in search inputs.', matchScore: 95 },
    { id: '3', title: 'State Management with BehaviorSubject', category: 'State', snippet: 'Designing predictable single-source-of-truth services with RxJS.', matchScore: 92 },
    { id: '4', title: 'HTTP Error Recovery Strategies', category: 'Resilience', snippet: 'Using catchError, retry, and throwIfEmpty with clean user messaging.', matchScore: 89 },
    { id: '5', title: 'Memory Leak Prevention in Angular', category: 'Performance', snippet: 'Teardown strategies: takeUntil vs takeUntilDestroyed in modern Angular.', matchScore: 87 },
    { id: '6', title: 'Multi-stream Dashboards with combineLatest', category: 'Dashboard', snippet: 'Coordinating filters, search terms, and paginated HTTP payloads cleanly.', matchScore: 85 },
    { id: '7', title: 'Client-side Response Caching with shareReplay', category: 'Performance', snippet: 'Understanding refCount: true and cache invalidation policies.', matchScore: 84 },
    { id: '8', title: 'Reactive Forms Asynchronous Validation', category: 'Forms', snippet: 'Checking server username uniqueness without race conditions.', matchScore: 81 }
  ];

  private readonly users: UserSummary[] = [
    { id: 'u1', name: 'Sarah Chen', email: 'sarah.chen@enterprise.io', role: 'Admin', status: 'Active' },
    { id: 'u2', name: 'Marcus Vance', email: 'marcus.v@enterprise.io', role: 'Engineer', status: 'Active' },
    { id: 'u3', name: 'Elena Rostova', email: 'e.rostova@enterprise.io', role: 'Manager', status: 'Offline' },
    { id: 'u4', name: 'Devon Miles', email: 'devon.m@enterprise.io', role: 'Engineer', status: 'Active' }
  ];

  private readonly orders: OrderRecord[] = [
    { id: 'ORD-901', customer: 'Acme Cloud', amount: 14200, status: 'Shipped', createdAt: '10 mins ago' },
    { id: 'ORD-902', customer: 'Globex Corp', amount: 8450, status: 'Processed', createdAt: '25 mins ago' },
    { id: 'ORD-903', customer: 'Soylent Ltd', amount: 3100, status: 'Pending', createdAt: '1 hour ago' },
    { id: 'ORD-904', customer: 'Initech Systems', amount: 24900, status: 'Shipped', createdAt: '2 hours ago' }
  ];

  /**
   * Simulates remote debounced search query.
   * Can simulate simulated server latency and simulated network failures.
   */
  searchArticles(query: string, simulateFailure = false): Observable<SearchResultItem[]> {
    if (simulateFailure) {
      return throwError(() => new Error('Remote Search Cluster Unavailable (HTTP 503)')).pipe(delay(250));
    }

    const clean = query.trim().toLowerCase();
    if (!clean) {
      return of([]).pipe(delay(100));
    }

    const matches = this.articles.filter(item =>
      item.title.toLowerCase().includes(clean) ||
      item.snippet.toLowerCase().includes(clean) ||
      item.category.toLowerCase().includes(clean)
    );

    return of(matches).pipe(delay(300));
  }

  getUsers(shouldFail = false): Observable<UserSummary[]> {
    if (shouldFail) {
      return throwError(() => new Error('User Directory Service 500 Failure')).pipe(delay(200));
    }
    return of([...this.users]).pipe(delay(350));
  }

  getOrders(shouldFail = false): Observable<OrderRecord[]> {
    if (shouldFail) {
      return throwError(() => new Error('Order Billing Service 502 Failure')).pipe(delay(200));
    }
    return of([...this.orders]).pipe(delay(450));
  }

  getSystemMetrics(shouldFail = false): Observable<SystemMetrics> {
    if (shouldFail) {
      return throwError(() => new Error('Telemetry Metrics Engine 504 Timeout')).pipe(delay(200));
    }
    const metrics: SystemMetrics = {
      cpuUsage: Math.floor(Math.random() * 30) + 40,
      memoryUsage: Math.floor(Math.random() * 20) + 65,
      activeSockets: Math.floor(Math.random() * 200) + 1400,
      requestsPerSecond: Math.floor(Math.random() * 500) + 3200,
      serverStatus: 'Healthy'
    };
    return of(metrics).pipe(delay(250));
  }

  submitOrder(order: { customer: string; amount: number; itemsCount: number }, latencyMs = 600, shouldFail = false): Observable<OrderRecord> {
    if (shouldFail) {
      return throwError(() => new Error('Payment Gateway Rejected Transaction (HTTP 402)')).pipe(delay(latencyMs));
    }
    const record: OrderRecord = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: order.customer,
      amount: order.amount,
      status: 'Processed',
      createdAt: 'Just now'
    };
    return of(record).pipe(delay(latencyMs));
  }

  checkUsernameAvailable(username: string, latencyMs = 350): Observable<{ available: boolean; reason?: string }> {
    const reserved = ['admin', 'root', 'superuser', 'system', 'enterprise', 'rxjs'];
    const clean = username.trim().toLowerCase();
    const isTaken = reserved.includes(clean);
    return of({
      available: !isTaken,
      reason: isTaken ? `Username "${clean}" is reserved by the organization` : undefined
    }).pipe(delay(latencyMs));
  }
}
