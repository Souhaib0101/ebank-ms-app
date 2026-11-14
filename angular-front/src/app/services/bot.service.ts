import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { ChatState } from '../models/chat.model';
import { errorMessage } from '../models/request-state.model';
import { API } from './api';

@Injectable({ providedIn: 'root' })
export class BotService {
  private readonly http = inject(HttpClient);

  ask(query: string): Observable<ChatState> {
    const params = new HttpParams().set('query', query);
    return this.http.get(`${API.bot}/chat`, { params, responseType: 'text' }).pipe(
      map((content): ChatState => ({ type: 'RESPONSE', content, complete: true })),
      catchError((error: unknown) =>
        of<ChatState>({ type: 'ERROR', content: '', errorMessage: errorMessage(error) }),
      ),
      startWith({ type: 'SENT', content: '' } as ChatState),
    );
  }
}
