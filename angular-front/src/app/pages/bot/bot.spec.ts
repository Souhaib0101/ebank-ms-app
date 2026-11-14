import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMarkdown } from 'ngx-markdown';
import { loadingInterceptor } from '../../interceptors/loading.interceptor';
import { API } from '../../services/api';
import { LoadingService } from '../../services/loading.service';
import { Bot } from './bot';

describe('Chat interface', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
        provideMarkdown(),
      ],
    }),
  );
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('cancels the stream and allows the next question', async () => {
    const fixture = TestBed.createComponent(Bot);
    await fixture.whenStable();
    const query: HTMLInputElement = fixture.nativeElement.querySelector('#query');
    query.value = 'Liste des clients';
    query.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
    const request = TestBed.inject(HttpTestingController).expectOne(
      (req) => req.url === `${API.bot}/chatStream`,
    );
    expect(TestBed.inject(LoadingService).isLoading()).toBe(true);
    const cancel: HTMLButtonElement = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Arrêter'))!;
    cancel.click();
    await fixture.whenStable();
    expect(request.cancelled).toBe(true);
    expect(TestBed.inject(LoadingService).isLoading()).toBe(false);
    expect(query.disabled).toBe(false);
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBe(false);
  });
});
