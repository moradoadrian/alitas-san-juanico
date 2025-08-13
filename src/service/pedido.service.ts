import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PedidoService {
  constructor(
    private http: HttpClient,
    private firestore: Firestore, // ← inyección por constructor (segura)
  ) {}

  // Para datos de prueba (JSON local). OJO con la ruta para GitHub Pages
  obtenerPedidos(): Observable<any[]> {
    return this.http.get<any[]>('assets/pedidos.json'); // sin “/” inicial
  }

  // Guarda en Firestore
  agregarPedido(pedido: { nombre: string; cantidad: number; sabor: string }) {
    const pedidosRef = collection(this.firestore, 'pedidos');
    return addDoc(pedidosRef, {
      ...pedido,
      createdAt: serverTimestamp(),
      status: 'nuevo'
    });
  }
}
