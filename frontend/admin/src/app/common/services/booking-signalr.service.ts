import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from 'src/environments/environment';
import { NewBookingPayload } from '@models';

@Injectable({ providedIn: 'root' })
export class BookingSignalRService implements OnDestroy {
  private hubConnection: signalR.HubConnection | null = null;

  private newBookingSubject = new Subject<NewBookingPayload>();
  readonly newBooking$ = this.newBookingSubject.asObservable();

  isConnected = false;

  private get hubUrl(): string {
    const base = environment.apiUrl.replace(/\/api\/?$/, '');
    return `${base}/hubs/booking`;
  }

  connect(): void {
    if (this.hubConnection && this.isConnected) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, { withCredentials: true })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('NewBookingCreated', (payload: NewBookingPayload) => {
      this.newBookingSubject.next(payload);
    });

    this.hubConnection.onclose(() => (this.isConnected = false));
    this.hubConnection.onreconnected(() => (this.isConnected = true));
    this.hubConnection.onreconnecting(() => (this.isConnected = false));

    this.hubConnection
      .start()
      .then(() => (this.isConnected = true))
      .catch((err) => console.error('[BookingSignalR] connection error:', err));
  }

  disconnect(): void {
    this.hubConnection?.stop().catch(() => {});
    this.isConnected = false;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.newBookingSubject.complete();
  }
}