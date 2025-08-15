// src/app/service/pedido-storage.service.ts
import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadString } from '@angular/fire/storage'; // ⬅️ Storage (token), no getStorage

export type PedidoJson = {
  id: string;
  fecha: string;
  listoA?: string;
  telefono?: string;
  total: number;
  subtotal: number;
  envio: number;
  qty: number;
  nombre?: string;
  metodo: 'pickup' | 'delivery';
  direccion?: string;
  note?: string;
};

@Injectable({ providedIn: 'root' })
export class PedidoStorageService {
  private storage = inject(Storage); // ⬅️ así sí lo resuelve el DI

  async guardarPedido(pedido: PedidoJson): Promise<string> {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const folder = `${y}-${m}-${day}`;

    const path = `pedidos/${folder}/${pedido.id}.json`;
    const r = ref(this.storage, path);

    const json = JSON.stringify({ ...pedido, savedAt: new Date().toISOString() });
    await uploadString(r, json, 'raw', { contentType: 'application/json; charset=utf-8' });
    return path;
  }
}
