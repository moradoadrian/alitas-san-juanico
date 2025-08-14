// src/app/service/pedido.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, serverTimestamp,
  CollectionReference, DocumentData
} from '@angular/fire/firestore';
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

  // 👇 en español, como en tu componente
  nota?: string;

  // metadatos
  createdAt?: any;
  status?: 'nuevo' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  origin?: 'web';
};

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly firestore = inject(Firestore);

  private pedidosCol(): CollectionReference<DocumentData> {
    return collection(this.firestore, 'pedidos');
  }

  crearPedido(pedido: PedidoDoc): Observable<any> {
    const payload: PedidoDoc = {
      ...pedido,
      status: pedido.status ?? 'nuevo',
      origin: 'web',
      createdAt: serverTimestamp() as any
    };
    return from(addDoc(this.pedidosCol(), payload));
  }
}
