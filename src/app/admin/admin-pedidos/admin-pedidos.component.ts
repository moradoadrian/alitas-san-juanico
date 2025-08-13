import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidosAdminService, Pedido } from '../../services/pedidos-admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <section class="max-w-5xl mx-auto p-4">
    <header class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-bold">Pedidos en tiempo real</h1>
      <label class="inline-flex items-center gap-2 text-sm">
      <input
  type="checkbox"
  [(ngModel)]="soloAbiertos"
  (ngModelChange)="reload()" />

        Mostrar solo abiertos
      </label>
    </header>

    <div class="overflow-x-auto border rounded-2xl">
      <table class="min-w-full text-sm">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="p-3">Hora</th>
            <th class="p-3">Cliente</th>
            <th class="p-3">Detalle</th>
            <th class="p-3">Total</th>
            <th class="p-3">Método</th>
            <th class="p-3">Estatus</th>
            <th class="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of pedidos" class="border-t">
            <td class="p-3 whitespace-nowrap">
              <div class="font-mono">{{ horaDe(p) }}</div>
              <div class="text-xs text-gray-500">{{ p.id }}</div>
            </td>

            <td class="p-3">{{ p.nombre || '—' }}</td>

            <td class="p-3">
              {{ p.qty }} × Alitas adobadas
              <div *ngIf="p.direccion" class="text-xs text-gray-500 max-w-xs truncate">
                📍 {{ p.direccion }}
              </div>
            </td>

            <td class="p-3 font-semibold">
              {{ p.total | currency:'MXN':'symbol-narrow' }}
            </td>

            <td class="p-3">
              {{ p.metodo === 'pickup' ? 'Recoger' : 'Domicilio' }}
            </td>

            <td class="p-3">
              <span class="px-2 py-1 rounded-full text-xs font-semibold"
                [ngClass]="{
                  'bg-gray-200 text-gray-800': p.status==='nuevo',
                  'bg-blue-100 text-blue-800': p.status==='confirmado',
                  'bg-amber-100 text-amber-800': p.status==='en_camino',
                  'bg-green-100 text-green-800': p.status==='entregado',
                  'bg-red-100 text-red-800': p.status==='cancelado'
                }">{{ p.status }}</span>
            </td>

            <td class="p-3">
              <div class="flex flex-wrap gap-2">
                <button (click)="set(p,'confirmado')"
                  class="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Confirmar</button>
                <button (click)="set(p,'en_camino')"
                  class="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white">En camino</button>
                <button (click)="set(p,'entregado')"
                  class="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white">Entregado</button>
                <button (click)="set(p,'cancelado')"
                  class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white">Cancelar</button>
              </div>
            </td>
          </tr>

          <tr *ngIf="pedidos.length === 0">
            <td colspan="7" class="p-6 text-center text-gray-500">Sin pedidos aún.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  `
})
export class AdminPedidosComponent {
  private svc = inject(PedidosAdminService);
  pedidos: Pedido[] = [];
  soloAbiertos = true;

  constructor() { this.reload(); }

  reload() {
    this.svc.getUltimosPedidos$(this.soloAbiertos).subscribe(list => this.pedidos = list);
  }

  set(p: Pedido, status: Pedido['status']) {
    this.svc.cambiarStatus(p.id, status);
  }

  // --- Helpers de formateo ---
  horaDe(p: any): string {
    const d = p?.creadoEn?.toDate ? p.creadoEn.toDate() : (p?.fecha ? new Date(p.fecha) : null);
    return d
      ? d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      : '—';
  }
}
