import * as signalR from '@microsoft/signalr';

class SignalRService {
  private connection: signalR.HubConnection | null = null;

  public async startConnection(accessToken: string): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('/notificationHub', { accessTokenFactory: () => accessToken })
      .withAutomaticReconnect()
      .build();

    try {
      await this.connection.start();
      console.log('SignalR Connected');
    } catch (err) {
      console.error('Error while establishing connection: ', err);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  public onNotification(callback: (notifications: any) => void): void {
    if (this.connection) {
      this.connection.on('Notification', callback);
    }
  }

  public offNotification(callback: (notifications: any) => void): void {
    if (this.connection) {
      this.connection.off('Notification', callback);
    }
  }
}

export const signalRService = new SignalRService();