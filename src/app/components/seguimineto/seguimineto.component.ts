import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { timer, switchMap } from 'rxjs';
import { PedidoService } from '../../services/pedido.service';

type PedidoStatus = 'nuevo'|'confirmado'|'preparando'|'listo'|'entregado'|'cancelado';

@Component({
  standalone: true,
  selector: 'app-seguimiento',
  imports: [CommonModule],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css']
})
export class SeguimientoComponent {
  private route = inject(ActivatedRoute);
  private srv = inject(PedidoService);

  trackId = signal<string>('');
  data = signal<any | null>(null);

  // UI helpers existentes/previos
  private readonly order: ReadonlyArray<PedidoStatus> = ['nuevo','confirmado','preparando','listo','entregado','cancelado'];
  readonly steps: ReadonlyArray<Exclude<PedidoStatus,'cancelado'>> = ['nuevo','confirmado','preparando','listo','entregado'];

  // Toast simple
  toast = signal<{ show: boolean; text: string }>({ show: false, text: '' });
  private toastTimer?: number;

  // Recordar status previo para trigger de confetti
  private prevStatus = signal<PedidoStatus | null>(null);

  // Efecto: cuando cambie el status a "listo" → confetti
  private statusWatcher = effect(() => {
    const s = (this.data()?.status ?? null) as PedidoStatus | null;
    const prev = this.prevStatus();
    if (s && s !== prev) {
      if (s === 'listo') this.fireConfetti();
      this.prevStatus.set(s);
    }
  });

  // % de avance por status (igual que tenías)
  progressFor(s: PedidoStatus): number {
    const orden: PedidoStatus[] = ['nuevo','confirmado','preparando','listo','entregado'];
    const i = Math.max(0, orden.indexOf(s));
    return Math.round((i / (orden.length - 1)) * 100);
  }

  isReached(step: PedidoStatus, current?: PedidoStatus | null): boolean {
    if (!current) return false;
    return this.order.indexOf(current) >= this.order.indexOf(step);
  }

  badgeClass(status?: PedidoStatus | null): string {
    const base = 'ring-1';
    const map: Record<PedidoStatus, string> = {
      nuevo:      'bg-zinc-900 text-zinc-200 ring-zinc-700/60',
      confirmado: 'bg-purple-900/30 text-purple-200 ring-purple-700/50',
      preparando: 'bg-fuchsia-900/30 text-fuchsia-200 ring-fuchsia-700/50',
      listo:      'bg-emerald-900/30 text-emerald-200 ring-emerald-700/50',
      entregado:  'bg-emerald-900/30 text-emerald-200 ring-emerald-700/50',
      cancelado:  'bg-red-900/30 text-red-200 ring-red-700/50',
    };
    return `${base} ${map[(status || 'nuevo') as PedidoStatus]}`;
  }

  dotClass(status?: PedidoStatus | null): string {
    const map: Record<PedidoStatus, string> = {
      nuevo:      'bg-zinc-300',
      confirmado: 'bg-purple-400',
      preparando: 'bg-fuchsia-400',
      listo:      'bg-emerald-400',
      entregado:  'bg-emerald-400',
      cancelado:  'bg-red-400',
    };
    return map[(status || 'nuevo') as PedidoStatus];
  }

  // Acciones
  verTicket(): void {
    console.debug('verTicket ->', this.data()?.idFolio);
  }

  waLink(d: any): string {
    const folio = encodeURIComponent(d?.idFolio ?? '');
    const status = encodeURIComponent(d?.status ?? '');
    const txt = `Pedido%20${folio}%20(%20${status}%20)`;
    return `https://wa.me/?text=${txt}`;
  }

  sharePedido(d: any): void {
    const title = 'Alitas La SanJua';
    const text  = `Mi pedido ${d?.idFolio ?? ''} está en estado ${d?.status ?? ''}.`;
    if (navigator.share) {
      navigator.share({ title, text })
        .then(() => this.showToast('Compartido'))
        .catch(() => {/* usuario canceló, sin drama */});
    } else {
      navigator.clipboard.writeText(`${title} - ${text}`)
        .then(() => this.showToast('Copiado al portapapeles'));
    }
  }

  // --- Confetti minimalista (sin dependencias) ---
  private fireConfetti(): void {
    const colors = ['#a855f7','#d946ef','#f5f3ff','#22c55e','#60a5fa'];
    const count = 120;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      const size = 6 + Math.random() * 6; // 6-12px
      const left = Math.random() * 100;   // vw
      const rot  = Math.random() * 360;
      const dur  = 1200 + Math.random() * 1200; // 1.2-2.4s

      piece.style.width = `${size}px`;
      piece.style.height = `${size * 1.6}px`;
      piece.style.left = `${left}vw`;
      piece.style.background = colors[i % colors.length];
      piece.style.transform = `rotate(${rot}deg)`;
      piece.style.animationDuration = `${dur}ms`;

      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove());
    }
  }

  // --- Toast simple ---
  private showToast(msg: string, ms = 2200): void {
    this.toast.set({ show: true, text: msg });
    if (this.toastTimer) window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => this.toast.set({ show: false, text: '' }), ms);
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.trackId.set(id);

    // Polling cada 5 s (intacto)
    timer(0, 5000).pipe(
      switchMap(() => this.srv.getSeguimiento$(id))
    ).subscribe(v => this.data.set(v || null));
  }
}
