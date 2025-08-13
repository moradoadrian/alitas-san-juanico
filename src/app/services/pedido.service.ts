import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, serverTimestamp, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';

export type PedidoDoc = {
  id: string;
  fecha: string;
  listoA?: string;
  total: number;
  subtotal: number;
  envio: number;
  qty: number;
  nombre?: string;
  metodo: 'pickup' | 'delivery';
  direccion?: string;
  createdAt?: any;
  status?: 'nuevo'|'confirmado'|'preparando'|'listo'|'entregado'|'cancelado';
  origin?: 'web';
  note?: string;
};

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly firestore = inject(Firestore);
  private readonly pedidosCol: CollectionReference<DocumentData> = collection(this.firestore, 'pedidos');

  crearPedido(pedido: PedidoDoc): Observable<any> {
    const payload = { ...pedido, status: pedido.status ?? 'nuevo', origin: 'web', createdAt: serverTimestamp() };
    return from(addDoc(this.pedidosCol, payload));
  }
}
