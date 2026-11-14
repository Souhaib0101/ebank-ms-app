import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { finalize, Observable } from 'rxjs';
import { ChatMode, ChatState } from '../../models/chat.model';
import { BotService } from '../../services/bot.service';

@Component({
  selector: 'app-bot',
  imports: [AsyncPipe, FormsModule, MarkdownComponent],
  templateUrl: './bot.html',
})
export class Bot {
  private readonly bot = inject(BotService);
  protected query = '';
  protected mode: ChatMode = 'stream';
  protected readonly busy = signal(false);
  protected readonly askedQuery = signal('');
  protected response$?: Observable<ChatState>;

  protected ask(): void {
    const query = this.query.trim();
    if (!query || this.busy()) return;
    this.askedQuery.set(query);
    this.busy.set(true);
    this.response$ = this.bot.ask(query, this.mode).pipe(finalize(() => this.busy.set(false)));
  }

  protected cancel(): void {
    // Removing the AsyncPipe subscription also aborts the HTTP request.
    this.response$ = undefined;
  }
}
