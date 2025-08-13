import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private http = inject(HttpClient);

  // 👇 PON AQUÍ TU URL REAL (región+proyecto)
  private baseUrl = 'https://us-central1-alitas-app-63d93.cloudfunctions.net';

  crearPedido(data: any) {
    return this.http.post(`${this.baseUrl}/crearPedido`, data);
  }
}
