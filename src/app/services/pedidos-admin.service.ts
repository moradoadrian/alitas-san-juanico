// import { Injectable, inject } from '@angular/core';
// import { Firestore, collection, query, orderBy, limit, collectionData, doc, updateDoc, where } from '@angular/fire/firestore';
// import { Observable } from 'rxjs';

// export type Pedido = {
//   id: string;           // id del doc
//   fecha: string;
//   listoA?: string;
//   total: number;
//   subtotal: number;
//   envio: number;
//   qty: number;
//   nombre?: string;
//   metodo: 'pickup' | 'delivery';
//   direccion?: string;
//   status: 'nuevo' | 'confirmado' | 'en_camino' | 'entregado' | 'cancelado';
//   creadoEn?: any; // Timestamp
// };

// @Injectable({ providedIn: 'root' })
// export class PedidosAdminService {
//   private fs = inject(Firestore);

//   getUltimosPedidos$(onlyOpen = false): Observable<Pedido[]> {
//     const ref = collection(this.fs, 'pedidos');
//     const base = onlyOpen
//       ? query(ref, where('status', 'in', ['nuevo','confirmado','en_camino']), orderBy('creadoEn', 'desc'), limit(50))
//       : query(ref, orderBy('creadoEn', 'desc'), limit(50));
//     return collectionData(base, { idField: 'id' }) as Observable<Pedido[]>;
//   }

//   cambiarStatus(id: string, status: Pedido['status']) {
//     const d = doc(this.fs, 'pedidos', id);
//     return updateDoc(d, { status });
//   }
// }
