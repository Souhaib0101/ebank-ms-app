import { HttpEventType, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ChatState } from '../models/chat.model';
import { API } from './api';
import { BotService } from './bot.service';

describe('BotService', () => {
  let service: BotService;
  let requests: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BotService);
    requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());

  it('sends the complete query as a parameter and accepts plain Markdown', () => {
    const states: ChatState[] = [];
    service
      .ask('Comptes épargne & client #1 ?', 'standard')
      .subscribe((state) => states.push(state));
    const request = requests.expectOne((req) => req.url === `${API.bot}/chat`);
    expect(request.request.params.get('query')).toBe('Comptes épargne & client #1 ?');
    expect(request.request.responseType).toBe('text');
    request.flush('**Deux comptes**');
    expect(states).toEqual([
      { type: 'SENT', content: '' },
      { type: 'RESPONSE', content: '**Deux comptes**', complete: true },
    ]);
  });

  it('replaces cumulative partial text instead of duplicating chunks', () => {
    const states: ChatState[] = [];
    service.ask('Liste des comptes', 'stream').subscribe((state) => states.push(state));
    const request = requests.expectOne((req) => req.url === `${API.bot}/chatStream`);
    expect(request.request.reportProgress).toBe(true);
    request.event({ type: HttpEventType.DownloadProgress, loaded: 3, partialText: 'Les' });
    request.event({ type: HttpEventType.DownloadProgress, loaded: 11, partialText: 'Les comptes' });
    request.flush('Les comptes bancaires');
    expect(states).toEqual([
      { type: 'SENT', content: '' },
      { type: 'RESPONSE', content: 'Les', complete: false },
      { type: 'RESPONSE', content: 'Les comptes', complete: false },
      { type: 'RESPONSE', content: 'Les comptes bancaires', complete: true },
    ]);
  });

  it('turns HTTP failures into a displayable error', () => {
    const states: ChatState[] = [];
    service.ask('Bonjour', 'stream').subscribe((state) => states.push(state));
    requests
      .expectOne((req) => req.url === `${API.bot}/chatStream`)
      .flush('Failed', { status: 500, statusText: 'Error' });
    expect(states.at(-1)).toMatchObject({
      type: 'ERROR',
      errorMessage: expect.stringContaining('500'),
    });
  });
});
