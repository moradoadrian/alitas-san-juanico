import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../../../service/pedido.service';




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
  whatsappNumber = '524614210058';

  paquete: Paquete = {
    name: 'Alitas adobadas',
    price: 300,
    emoji: '🍗',
    desc: 'Al carbón, jugosas y con ese toque casero 🔥',
    includes: 'Incluye zanahoria y pepino',
    qty: 0
  };

  deliveryFeeFlat = 25;
  freeShippingThreshold = 600;

  nombreCliente = '';
  metodoEntrega: 'pickup' | 'delivery' = 'pickup';
  direccion = '';
  nota = '';

  // Derivados
  get subtotal() { return this.paquete.qty * this.paquete.price; }
  get envioGratis() { return this.freeShippingThreshold > 0 && this.subtotal >= this.freeShippingThreshold; }
  get deliveryFee(): number {
    if (this.metodoEntrega !== 'delivery') return 0;
    return this.envioGratis ? 0 : this.deliveryFeeFlat;
  }
  get total() { return this.subtotal + this.deliveryFee; }
  get puedeEnviar() { return this.paquete.qty > 0; }
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

  private buildMessage() {
    const linea = `- ${this.paquete.qty} × ${this.paquete.name} (${this.mxn(this.paquete.price)} c/u) = ${this.mxn(this.subtotal)}`;

    const entrega = this.metodoEntrega === 'pickup'
      ? 'Entrega: Recoger en tienda'
      : `Entrega: A domicilio
   Dirección: ${this.direccion || '(pendiente)'}
   Envío: ${this.deliveryFee === 0 ? 'GRATIS' : this.mxn(this.deliveryFee)}`;

    const nombre = this.nombreCliente ? `Cliente: ${this.nombreCliente}\n` : '';
    const nota = this.nota ? `\nNota: ${this.nota}` : '';
    const piezas = this.paquete.qty > 0 ? `\nAproximado de piezas: ${this.piezasMin}–${this.piezasMax}` : '';

    return (
`¡Hola! Quiero hacer un pedido:
${linea}
Incluye: ${this.paquete.includes}${piezas}
Subtotal: ${this.mxn(this.subtotal)}
${entrega}
Total: ${this.mxn(this.total)}

${nombre}¿Me confirmas tiempo y total, por favor?${nota}`
    );
  }

  whatsAppUrl(): string {
    const tel = '524614210058'; // tu número en formato internacional sin '+'
    const partes = [
      `*Nuevo pedido* ☠️ Purple Wings`,
      `• Nombre: ${this.nombreCliente?.trim() || '—'}`,
      `• Paquetes: ${this.paquete?.qty || 0}`,
      this.nota?.trim() ? `• Nota: ${this.nota.trim()}` : null,
      `• Total: ${this.total | 0} MXN`
    ].filter(Boolean);
  
    const text = encodeURIComponent(partes.join('\n'));
    return `https://wa.me/${tel}?text=${text}`;
  }
  

  abrirWhatsApp() {
    if (!this.puedeEnviar) return;
    window.open(this.whatsAppUrl(), '_blank');
  }
   // ---- NUEVO: estado de pedido directo ----
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
 
   horaProgramada = ''; // HH:mm (opcional)
 
   // Estimación simple: pickup 15–20 min, delivery 35–45 min
   private estimarHoraListo(): string {
     const now = new Date();
     const addMin = this.metodoEntrega === 'pickup' ? 18 : 40;
     // Si el usuario programó hora válida, respétala
     if (this.horaProgramada) {
       const [h, m] = this.horaProgramada.split(':').map(Number);
       const prog = new Date();
       prog.setHours(h, m || 0, 0, 0);
       if (!isNaN(prog.getTime())) return prog.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
     }
     now.setMinutes(now.getMinutes() + addMin);
     return now.toLocaleTimeString('es-MX', {hour: '2-digit', minute: '2-digit'});
   }
 
   private generarId(): string {
     // ej. SJ-250812-203045-7F
     const d = new Date();
     const fecha = d.toISOString().slice(2,10).replace(/-/g,''); // yyMMdd
     const hora = d.toTimeString().slice(0,8).replace(/:/g,'');  // HHmmss
     const rnd = Math.random().toString(16).slice(2,4).toUpperCase();
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
  
    // 🔥 Guardar en Firestore vía Cloud Function
    this.pedidoService.crearPedido(data).subscribe({
      next: () => console.log('Pedido guardado en Firestore'),
      error: (e) => console.error('Error al guardar en Firestore', e)
    });
  
    // Historial local (opcional)
    const key = 'sanJua_pedidos';
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.unshift(data);
    localStorage.setItem(key, JSON.stringify(arr));
  }
 
   // util para ver historial (opcional)
   get historial(): any[] {
     return JSON.parse(localStorage.getItem('sanJua_pedidos') || '[]');
   }
 
   cerrarTicket() { this.mostrandoTicket = false; }
 
   imprimirTicket() {
     // Abre ventana con ticket bonito para imprimir
     if (!this.ticket) return;
     const w = window.open('', '_blank');
     if (!w) return;
     const t = this.ticket;
     w.document.write(`
       <html><head><title>Ticket ${t.id}</title>
       <style>
         body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:20px}
         .tag{display:inline-block;padding:2px 8px;border-radius:9999px;background:#f97316;color:white;font-weight:600}
         .row{display:flex;justify-content:space-between;margin:6px 0}
         hr{border:none;border-top:1px solid #e5e7eb;margin:12px 0}
       </style></head><body>
         <h2>Purple Wings</h2>
         <div class="tag">Pedido directo</div>
         <p><strong>Ticket:</strong> ${t.id}<br>
            <strong>Fecha:</strong> ${t.fecha}<br>
            <strong>Listo aprox.:</strong> ${t.listoA}</p>
         <hr>
         <div class="row"><span>${t.qty} × Alitas adobadas</span><span>$${(t.subtotal).toLocaleString('es-MX')}</span></div>
         <div class="row"><span>Envío</span><span>${t.envio === 0 ? 'GRATIS' : '$'+t.envio.toLocaleString('es-MX')}</span></div>
         <div class="row" style="font-weight:800"><span>Total</span><span>$${t.total.toLocaleString('es-MX')}</span></div>
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
 
}
