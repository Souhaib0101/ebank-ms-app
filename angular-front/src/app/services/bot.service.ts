import { HttpClient, HttpEventType, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, filter, map, Observable, of, startWith } from 'rxjs';
import { ChatMode, ChatState } from '../models/chat.model';
import { errorMessage } from '../models/request-state.model';
import { API } from './api';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly http = inject(HttpClient);

  ask(query: string, mode: ChatMode): Observable<ChatState> {
    const params = new HttpParams().set('query', query);
    const response$: Observable<ChatState> =
      mode === 'stream'
        ? this.http
            .get(`${API.bot}/chatStream`, {
              params,
              responseType: 'text',
              observe: 'events',
              reportProgress: true,
            })
            .pipe(
              filter(
                (event) =>
                  event.type === HttpEventType.DownloadProgress ||
                  event.type === HttpEventType.Response,
              ),
              map((event) =>
                event.type === HttpEventType.Response
                  ? { type: 'RESPONSE', content: event.body ?? '', complete: true }
                  : { type: 'RESPONSE', content: event.partialText ?? '', complete: false },
              ),
            )
        : this.http
            .get(`${API.bot}/chat`, { params, responseType: 'text' })
            .pipe(map((content) => ({ type: 'RESPONSE', content, complete: true })));
    return response$.pipe(
      catchError((error: unknown) =>
        of<ChatState>({ type: 'ERROR', content: '', errorMessage: errorMessage(error) }),
      ),
      startWith({ type: 'SENT', content: '' } as ChatState),
    );
  }
}
