import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../service/pedido.service';
import { firstValueFrom } from 'rxjs';
type Paquete = {
  name: string;
  price: number;
  emoji: string;
  desc: string;
  includes: string;
  qty: number;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Cambia aquí tu número (52 + 10 dígitos, sin '+', sin '1')
  readonly whatsappNumber = '524611504199';

  paquete: Paquete = {
    name: 'Alitas adobadas',
    price: 300,
    emoji: '🍗',
    desc: 'Al carbón, jugosas y con ese toque casero 🔥',
    includes: 'Incluye zanahoria y pepino',
    qty: 0
  };

  // Envío (si activas delivery en el template)
  deliveryFeeFlat = 25;
  freeShippingThreshold = 600;

  // Form
  nombreCliente = '';
  metodoEntrega: 'pickup' | 'delivery' = 'pickup';
  direccion = '';
  nota = '';

  // UI auxiliar
  showQr = false;
  toastMsg = '';

  // --- Derivados ---
  get subtotal() { return this.paquete.qty * this.paquete.price; }
  get envioGratis() { return this.freeShippingThreshold > 0 && this.subtotal >= this.freeShippingThreshold; }
  get deliveryFee(): number {
    if (this.metodoEntrega !== 'delivery') return 0;
    return this.envioGratis ? 0 : this.deliveryFeeFlat;
  }
  get total() { return this.subtotal + this.deliveryFee; }
  get puedeEnviar() { return this.paquete.qty > 0; }
  get canSend() { return this.puedeEnviar && this.nombreCliente.trim().length > 0; }
  get piezasMin() { return this.paquete.qty * 18; }
  get piezasMax() { return this.paquete.qty * 20; }
  get envioProgressPct() {
    if (this.freeShippingThreshold <= 0) return 0;
    return Math.min(100, Math.round((this.subtotal / this.freeShippingThreshold) * 100));
  }
  get faltaParaGratis() {
    if (this.freeShippingThreshold <= 0 || this.subtotal >= this.freeShippingThreshold) return 0;
    return this.freeShippingThreshold - this.subtotal;
  }

  inc() { this.paquete.qty++; }
  dec() { if (this.paquete.qty > 0) this.paquete.qty--; }

  private mxn(n: number) {
    return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  // --- Mensaje WhatsApp (sin emojis raros) ---
  private buildParts(): string[] {
    const partes = [
      `*Nuevo pedido* - Purple Wings`,
      `• Nombre: ${this.nombreCliente?.trim() || '—'}`,
      `• Paquetes: ${this.paquete?.qty || 0}`,
      `• Subtotal: ${this.mxn(this.subtotal)}`,
      this.metodoEntrega === 'delivery'
        ? `• Envío: ${this.deliveryFee === 0 ? 'GRATIS' : this.mxn(this.deliveryFee)}`
        : `• Entrega: Recoger en tienda`,
      `• Total: ${this.mxn(this.total)}`
    ];
    if (this.nota?.trim()) partes.push(`• Nota: ${this.nota.trim()}`);
    if (this.metodoEntrega === 'delivery' && this.direccion?.trim()) {
      partes.push(`• Dirección: ${this.direccion.trim()}`);
    }
    return partes;
  }

  private buildWhatsUrl(tel: string, text: string) {
    const encoded = encodeURIComponent(text.replace(/\r?\n/g, '\n').trim());
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const base = isMobile ? 'https://api.whatsapp.com/send' : 'https://web.whatsapp.com/send';
    return `${base}?phone=${tel}&text=${encoded}&app_absent=0`;
  }

  whatsAppUrl(): string {
    const tel = this.whatsappNumber;
    const text = this.buildParts().join('\n');
    return this.buildWhatsUrl(tel, text);
  }

  // Fallback corto (por si el web no abre)
  get fallbackWaLink(): string {
    const tel = this.whatsappNumber;
    const text = encodeURIComponent(this.buildParts().join('\n'));
    return `https://wa.me/${tel}?text=${text}`;
  }

// Preferible: el mismo texto que ya armas
private get messageText(): string {
  return this.buildParts().join('\n');
}

// 1) Deep link que abre la app nativa (si está instalada)
get whatsappDeepLink(): string {
  const tel = this.whatsappNumber;
  const text = encodeURIComponent(this.messageText);
  // Deep link nativo
  return `whatsapp://send?phone=${tel}&text=${text}`;
}

// 2) Link web (handoff a app cuando el navegador lo permite)
get whatsappHttpLink(): string {
  const tel = this.whatsappNumber;
  const text = encodeURIComponent(this.messageText);
  // api.whatsapp.com hace mejor handoff que wa.me en varios dispositivos
  return `https://api.whatsapp.com/send?phone=${tel}&text=${text}&app_absent=0`;
}

// 3) QR: usa el link HTTP (los lectores de QR prefieren http/https)
get qrSrc(): string {
  const data = encodeURIComponent(this.whatsappHttpLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${data}`;
}

// 4) Detección de in-app browser (IG/FB/TikTok) o WebView
get isInAppBrowser(): boolean {
  const ua = navigator.userAgent || '';
  return /(FBAN|FBAV|Instagram|Line|WeChat|MicroMessenger|TikTok|Twitter|Snapchat|wv)/i.test(ua)
      || /\bVersion\/[\d.]+ Mobile\/\S+ Safari\/\S+.*(FB_IAB|FBAN|FBAV)/i.test(ua);
}

// 5) Botón que intenta deep link y, si falla, muestra aviso
openNativeWhatsApp() {
  const deep = this.whatsappDeepLink;
  const fallback = this.whatsappHttpLink;

  // Intentar abrir la app
  const now = Date.now();
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = deep;
  document.body.appendChild(iframe);

  // Si en ~1200ms no cambia de contexto, usar fallback web
  setTimeout(() => {
    document.body.removeChild(iframe);
    // En in-app browsers, es mejor abrir una NUEVA pestaña
    window.open(fallback, '_blank', 'noopener');
  }, 1200);
}


  copyLink() {
    if (!this.canSend) return;
    const url = this.whatsAppUrl();
    // Clipboard API
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url).then(() => this.showToast('Enlace copiado ✅'))
        .catch(() => this.fallbackCopy(url));
    } else {
      this.fallbackCopy(url);
    }
  }

  private fallbackCopy(text: string) {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    this.showToast('Enlace copiado ✅');
  }

  openQr() { if (this.canSend) this.showQr = true; }
  closeQr() { this.showQr = false; }

  private showToast(msg: string) {
    this.toastMsg = msg;
    setTimeout(() => this.toastMsg = '', 2200);
  }

  // ------------ (Opcional) Pedido directo / Ticket ------------
  mostrandoTicket = false;
  ticket: {
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
  } | null = null;

  horaProgramada = ''; // HH:mm

  private estimarHoraListo(): string {
    const now = new Date();
    const addMin = this.metodoEntrega === 'pickup' ? 18 : 40;
    if (this.horaProgramada) {
      const [h, m] = this.horaProgramada.split(':').map(Number);
      const prog = new Date();
      prog.setHours(h, m || 0, 0, 0);
      if (!isNaN(prog.getTime())) return prog.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
    now.setMinutes(now.getMinutes() + addMin);
    return now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  private generarId(): string {
    const d = new Date();
    const fecha = d.toISOString().slice(2, 10).replace(/-/g, ''); // yyMMdd
    const hora = d.toTimeString().slice(0, 8).replace(/:/g, '');  // HHmmss
    const rnd = Math.random().toString(16).slice(2, 4).toUpperCase();
    return `SJ-${fecha}-${hora}-${rnd}`;
  }

  private pedidoService = inject(PedidoService);

  pedirDirecto() {
    if (!this.puedeEnviar) return;

    const data = {
      id: this.generarId(),
      fecha: new Date().toLocaleString('es-MX'),
      listoA: this.estimarHoraListo(),
      total: this.total,
      subtotal: this.subtotal,
      envio: this.deliveryFee,
      qty: this.paquete.qty,
      nombre: this.nombreCliente || '',
      metodo: this.metodoEntrega,
      direccion: this.metodoEntrega === 'delivery' ? (this.direccion || '') : ''
    };

    // Ticket optimista
    this.ticket = data;
    this.mostrandoTicket = true;

    // Guardar en Firestore vía servicio
    this.pedidoService.crearPedido(data).subscribe({
      next: () => console.log('Pedido guardado en Firestore'),
      error: (e) => console.error('Error al guardar en Firestore', e)
    });

    // Historial local
    const key = 'sanJua_pedidos';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(data);
    localStorage.setItem(key, JSON.stringify(arr));
  }

  cerrarTicket() { this.mostrandoTicket = false; }

  

  imprimirTicket() {
    if (!this.ticket) return;
    const w = window.open('', '_blank'); if (!w) return;
    const t = this.ticket;
    w.document.write(`
      <html><head><title>Ticket ${t.id}</title>
      <style>
        body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:20px}
        .tag{display:inline-block;padding:2px 8px;border-radius:9999px;background:#7c3aed;color:white;font-weight:600}
        .row{display:flex;justify-content:space-between;margin:6px 0}
        hr{border:none;border-top:1px solid #e5e7eb;margin:12px 0}
      </style></head><body>
        <h2>Purple Wings</h2>
        <div class="tag">Pedido directo</div>
        <p><strong>Ticket:</strong> ${t.id}<br>
           <strong>Fecha:</strong> ${t.fecha}<br>
           <strong>Listo aprox.:</strong> ${t.listoA}</p>
        <hr>
        <div class="row"><span>${t.qty} × Alitas adobadas</span><span>${(t.subtotal).toLocaleString('es-MX')}</span></div>
        <div class="row"><span>Envío</span><span>${t.envio === 0 ? 'GRATIS' : t.envio.toLocaleString('es-MX')}</span></div>
        <div class="row" style="font-weight:800"><span>Total</span><span>${t.total.toLocaleString('es-MX')}</span></div>
        <hr>
        <p><strong>Método:</strong> ${t.metodo === 'pickup' ? 'Recoger en tienda' : 'Domicilio'}</p>
        ${t.direccion ? `<p><strong>Dirección:</strong> ${t.direccion}</p>` : ''}
        ${t.nombre ? `<p><strong>Cliente:</strong> ${t.nombre}</p>` : ''}
        <p>Gracias por tu pedido ❤️</p>
        <script>window.print();</script>
      </body></html>
    `);
    w.document.close();
  }
  
async enviarYGuardar(ev: Event) {
  ev.preventDefault();
  if (!this.canSend) return;

  // Construye el documento igual que en pedirDirecto()
  const data = {
    id: this.generarId(),
    fecha: new Date().toLocaleString('es-MX'),
    listoA: this.estimarHoraListo(),
    total: this.total,
    subtotal: this.subtotal,
    envio: this.deliveryFee,
    qty: this.paquete.qty,
    nombre: this.nombreCliente || '',
    metodo: this.metodoEntrega,
    direccion: this.metodoEntrega === 'delivery' ? (this.direccion || '') : '',
    // puedes mandar status aquí si quieres otro valor
  };

  try {
    // Espera a que se guarde (rápido). Si prefieres “fire-and-forget”, quita el await.
    await firstValueFrom(this.pedidoService.crearPedido(data));
  } catch (e) {
    console.error('No se pudo guardar en Firestore', e);
    // Opcional: muestra toast y AÚN ASÍ abre WhatsApp para no perder la venta
    this.showToast('No se guardó en la nube, pero te abrimos WhatsApp');
  } finally {
    // Abre WhatsApp (elige tu preferido)
    // window.open(this.whatsAppUrl(), '_blank', 'noopener');            // web/desktop
    window.open(this.whatsappHttpLink, '_blank', 'noopener');            // http que hace mejor handoff en móvil
    // o: this.openNativeWhatsApp();                                     // deep link nativo
  }

  // Opcional: también guarda en localStorage como historial
  const key = 'sanJua_pedidos';
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  arr.unshift(data);
  localStorage.setItem(key, JSON.stringify(arr));
}
}
