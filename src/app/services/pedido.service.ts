import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
  CollectionReference,
  DocumentData,
  doc,
  updateDoc,
  setDoc,
  docData,
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { Pedido } from './pedidos-admin.service';

export type PedidoStatus = 'nuevo'|'confirmado'|'preparando'|'listo'|'entregado'|'cancelado';

export type PedidoDoc = {
  id: string; fecha: string; listoA?: string;
  total: number; subtotal: number; envio: number; qty: number;
  nombre?: string; telefono?: string;
  metodo: 'pickup'|'delivery'; direccion?: string; nota?: string;
  status?: PedidoStatus; origin?: 'web'; createdAt?: any;
  trackId?: string;
};

export type SeguimientoPublico = {
  id?: string;
  pedidoDocId: string;
  idFolio: string;
  status: PedidoStatus;
  qty: number;
  total: number;
  metodo: 'pickup'|'delivery';
  listoA?: string;
  createdAt?: any;
  updatedAt?: any;
};

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly fs = inject(Firestore);
  private readonly injector = inject(Injector);

  private readonly pedidosCol: CollectionReference<DocumentData> =
    collection(this.fs, 'pedidos');

  /** CREA pedido (envolviendo addDoc en injection context) */
  crearPedido(pedido: PedidoDoc): Observable<any> {
    const payload = {
      ...pedido,
      status: (pedido.status ?? 'nuevo') as PedidoStatus,
      origin: 'web',
      createdAt: serverTimestamp() as any,
    };
    return from(
      runInInjectionContext(this.injector, () =>
        addDoc(this.pedidosCol, payload)
      )
    );
  }

  /** UPSERT a /seguimiento/{trackId} (envolviendo setDoc) */
  upsertSeguimiento(trackId: string, data: Omit<SeguimientoPublico,'updatedAt'>): Observable<void> {
    const ref = doc(this.fs, 'seguimiento', trackId);
    return from(
      runInInjectionContext(this.injector, () =>
        setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true })
      )
    ) as unknown as Observable<void>;
  }

  /** LECTURA reactiva del seguimiento (envolviendo docData) */
  getSeguimiento$(trackId: string): Observable<SeguimientoPublico | undefined> {
    const ref = doc(this.fs, 'seguimiento', trackId);
    return runInInjectionContext(this.injector, () =>
      docData(ref, { idField: 'id' }) as Observable<SeguimientoPublico | undefined>
    );
  }

  /** UPDATE de status en /pedidos y espejo en /seguimiento (envolviendo updateDoc) */
  async actualizarStatus(idDoc: string, status: Pedido['status'], trackId?: string) {
    const ref = doc(this.fs, 'pedidos', idDoc);
    await runInInjectionContext(this.injector, () =>
      updateDoc(ref, { status, updatedAt: serverTimestamp() })
    );

    if (trackId) {
      const segRef = doc(this.fs, 'seguimiento', trackId);
      await runInInjectionContext(this.injector, () =>
        updateDoc(segRef, { status, updatedAt: serverTimestamp() })
      );
    }
  }
}
