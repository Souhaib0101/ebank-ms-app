import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { ChatState } from '../../models/chat.model';
import { BotService } from '../../services/bot.service';

@Component({
  selector: 'app-bot',
  imports: [AsyncPipe, FormsModule],
  templateUrl: './bot.html',
})
export class Bot {
  private readonly bot = inject(BotService);
  protected query = '';
  protected readonly busy = signal(false);
  protected readonly askedQuery = signal('');
  protected response$?: Observable<ChatState>;

  protected ask(): void {
    const query = this.query.trim();
    if (!query || this.busy()) return;
    this.askedQuery.set(query);
    this.busy.set(true);
    this.response$ = this.bot.ask(query).pipe(finalize(() => this.busy.set(false)));
  }

  protected cancel(): void {
    // Removing the AsyncPipe subscription also aborts the HTTP request.
    this.response$ = undefined;
  }
}
