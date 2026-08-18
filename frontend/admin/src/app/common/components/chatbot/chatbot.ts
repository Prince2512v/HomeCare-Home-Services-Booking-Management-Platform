import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CHAT_INTENTS,
  FALLBACK_RESPONSE,
  FALLBACK_QUICK_REPLIES,
  WELCOME_MESSAGE,
  SUGGESTED_QUESTIONS,
} from './chatbot.responses';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  quickReplies?: string[];
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.css'],
})
export class Chatbot implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  isOpen = false;
  isTyping = false;
  userInput = '';
  messages: ChatMessage[] = [];
  suggestedQuestions = SUGGESTED_QUESTIONS;
  hasInteracted = false;
  private shouldScrollToBottom = false;

  ngOnInit(): void {
    this.addBotMessage(WELCOME_MESSAGE, SUGGESTED_QUESTIONS);
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.shouldScrollToBottom = true;
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  sendMessage(text?: string): void {
    const messageText = (text ?? this.userInput).trim();
    if (!messageText) return;

    this.hasInteracted = true;
    this.addUserMessage(messageText);
    this.userInput = '';
    this.isTyping = true;
    this.shouldScrollToBottom = true;

    const delay = 250 + Math.random() * 300;
    setTimeout(() => {
      const response = this.generateResponse(messageText);
      this.isTyping = false;
      this.addBotMessage(response.text, response.quickReplies);
      this.shouldScrollToBottom = true;
    }, delay);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  trackByMessage(_: number, msg: ChatMessage): string {
    return msg.id;
  }

  private generateResponse(input: string): { text: string; quickReplies?: string[] } {
    const lower = input.toLowerCase();

    for (const intent of CHAT_INTENTS) {
      if (intent.keywords.some((kw) => lower.includes(kw))) {
        return { text: intent.response, quickReplies: intent.quickReplies };
      }
    }

    return {
      text: `${FALLBACK_RESPONSE}\n\n• Booking management\n• Customer & partner management\n• Payment transactions\n• Support tickets\n• Offers & discounts\n• Service management\n• Dashboard & analytics`,
      quickReplies: FALLBACK_QUICK_REPLIES,
    };
  }

  private addUserMessage(text: string): void {
    this.messages.push({
      id: this.generateId(),
      text,
      sender: 'user',
      timestamp: new Date(),
    });
  }

  private addBotMessage(text: string, quickReplies?: string[]): void {
    this.messages.push({
      id: this.generateId(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      quickReplies,
    });
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  private generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  formatMessage(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
