import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LoadingService } from '../services/loading.service';
import { loadingInterceptor } from './loading.interceptor';

describe('Global HTTP loading', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });
  afterEach(() => requests.verify());

  it('remains visible until all concurrent requests finish', () => {
    http.get('/accounts').subscribe();
    http.get('/customers').subscribe();
    expect(loading.isLoading()).toBe(true);
    requests.expectOne('/accounts').flush([]);
    expect(loading.isLoading()).toBe(true);
    requests.expectOne('/customers').flush([]);
    expect(loading.isLoading()).toBe(false);
  });

  it('resets after a server error', () => {
    http.get('/accounts').subscribe({ error: () => undefined });
    requests
      .expectOne('/accounts')
      .flush('Unavailable', { status: 503, statusText: 'Unavailable' });
    expect(loading.isLoading()).toBe(false);
  });

  it('resets and aborts the request when unsubscribed', () => {
    const subscription = http.get('/chatStream').subscribe();
    const request = requests.expectOne('/chatStream');
    subscription.unsubscribe();
    expect(request.cancelled).toBe(true);
    expect(loading.isLoading()).toBe(false);
  });
});
