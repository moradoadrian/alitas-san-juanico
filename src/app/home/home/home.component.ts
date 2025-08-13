import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type Sabor = { name: string; price: number; emoji: string; desc: string; qty: number };

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  // Tu WhatsApp en formato internacional SIN + ni espacios (México=52)
  // Ejemplo: 524614210058
  whatsappNumber = '524614210058';

  // Catálogo (precio por ORDEN de 10 alitas)
  sabores: Sabor[] = [
    { name: 'BBQ',            price: 139, emoji: '🍖', desc: 'Clásica, dulce y ahumada', qty: 0 },
    { name: 'Buffalo',        price: 139, emoji: '🌶️', desc: 'Picante y adictiva',       qty: 0 },
    { name: 'Lemon Pepper',   price: 139, emoji: '🍋', desc: 'Cítrica con pimienta',      qty: 0 },
    { name: 'Mango Habanero', price: 149, emoji: '🥭', desc: 'Dulce… y luego te alcanza', qty: 0 }
  ];

  // Envío SIMPLE (sin CP): envío fijo o gratis desde cierto subtotal
  deliveryFeeFlat = 25;     // costo fijo de envío
  freeShippingThreshold = 399; // envío gratis desde este subtotal (0 = desactivar)

  // Datos del pedido
  nombreCliente = '';
  metodoEntrega: 'pickup' | 'delivery' = 'pickup';
  direccion = '';
  nota = '';

  // Cálculos
  get seleccionados() { return this.sabores.filter(s => s.qty > 0); }
  get subtotal() { return this.seleccionados.reduce((acc, s) => acc + s.qty * s.price, 0); }

  get deliveryFee(): number {
    if (this.metodoEntrega !== 'delivery') return 0;
    if (this.freeShippingThreshold > 0 && this.subtotal >= this.freeShippingThreshold) return 0;
    return this.deliveryFeeFlat;
  }

  get total() { return this.subtotal + this.deliveryFee; }
  get puedeEnviar() { return this.seleccionados.length > 0; }

  inc(s: Sabor) { s.qty++; }
  dec(s: Sabor) { if (s.qty > 0) s.qty--; }

  private mxn(n: number) {
    return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  private buildMessage() {
    const lines = this.seleccionados
      .map(s => `- ${s.qty} × ${s.name} (${this.mxn(s.price)} c/u) = ${this.mxn(s.qty * s.price)}`)
      .join('\n');

    const entrega = this.metodoEntrega === 'pickup'
      ? 'Recoger en tienda'
      : `Entrega a domicilio
   Dirección: ${this.direccion || '(pendiente)'}
   Envío: ${this.deliveryFee === 0 ? 'GRATIS' : this.mxn(this.deliveryFee)}`;

    const nombre = this.nombreCliente ? `Cliente: ${this.nombreCliente}\n` : '';
    const nota = this.nota ? `\nNota: ${this.nota}` : '';

    return (
`¡Hola! Quiero hacer un pedido de alitas:
${lines}
Subtotal: ${this.mxn(this.subtotal)}
${entrega}
Total: ${this.mxn(this.total)}

${nombre}¿Me confirmas tiempo y total, por favor?${nota}`
    );
  }

  whatsAppUrl() {
    const text = encodeURIComponent(this.buildMessage());
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  }

  abrirWhatsApp() {
    if (!this.puedeEnviar) return;
    window.open(this.whatsAppUrl(), '_blank');
  }
}
