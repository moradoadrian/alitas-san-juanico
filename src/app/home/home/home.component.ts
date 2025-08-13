import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  whatsAppUrl() {
    const text = encodeURIComponent(this.buildMessage());
    return `https://wa.me/${this.whatsappNumber}?text=${text}`;
  }

  abrirWhatsApp() {
    if (!this.puedeEnviar) return;
    window.open(this.whatsAppUrl(), '_blank');
  }
}
