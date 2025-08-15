// src/app/service/pedido.service.ts
import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, serverTimestamp,
  CollectionReference, DocumentData
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
export type PedidoStatus = 'nuevo'|'confirmado'|'preparando'|'listo'|'entregado'|'cancelado';
export type PedidoDoc = {
  id: string;           // folio legible (tu SJ-yyMMdd…)
  fecha: string;
  listoA?: string;
  total: number; subtotal: number; envio: number; qty: number;
  nombre?: string; telefono?: string;
  metodo: 'pickup'|'delivery'; direccion?: string; nota?: string;
  status?: PedidoStatus;
  origin?: 'web';
  createdAt?: any;
  trackId?: string;      // 👈 nuevo (público)
};

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly fs = inject(Firestore);

  private pedidosCol(): CollectionReference<DocumentData> {
    return collection(this.fs, 'pedidos');
  }
  private segCol(): CollectionReference<DocumentData> {
    return collection(this.fs, 'seguimiento');
  }

  crearPedido(pedido: PedidoDoc) {
    const payload: PedidoDoc = {
      ...pedido,
      status: pedido.status ?? 'nuevo',
      origin: 'web',
      createdAt: serverTimestamp() as any
    };
    return from(addDoc(this.pedidosCol(), payload)); // Observable<DocumentReference>
  }

  // Crea/actualiza doc público minimal por trackId
  async upsertSeguimiento(trackId: string, data: {
    pedidoDocId: string;
    idFolio: string;
    status: PedidoStatus;
    qty: number;
    total: number;
    metodo: 'pickup'|'delivery';
    listoA?: string;
    createdAt?: any;
  }) {
    const { doc, setDoc, serverTimestamp } = (await import('@angular/fire/firestore')) as any;
    const ref = doc(this.fs, 'seguimiento', trackId);
    return from(setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true }));
  }

  // Leer doc público por trackId
  async getSeguimiento$(trackId: string): Promise<Observable<any | undefined>> {
    const { doc, docData } = (await import('@angular/fire/firestore')) as any;
    const ref = doc(this.fs, 'seguimiento', trackId);
    return docData(ref, { idField: 'id' });
  }

  // Util para admin al cambiar status
  async updateSeguimientoStatus(trackId: string, status: PedidoStatus) {
    const { doc, updateDoc, serverTimestamp } = (await import('@angular/fire/firestore')) as any;
    const ref = doc(this.fs, 'seguimiento', trackId);
    return from(updateDoc(ref, { status, updatedAt: serverTimestamp() }));
  }
}