import { Component } from '@angular/core';
import { PedidoService } from '../../../service/pedido.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pedidos',
  imports: [FormsModule, CommonModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent {
  pedido = { nombre: '', cantidad: 1, sabor: 'BBQ' };
  constructor(private pedidoService: PedidoService) {}
    hacerPedido() {
    if (!this.pedido.nombre) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    this.pedidoService.agregarPedido(this.pedido)
      .then(() => {
        alert('Pedido realizado con éxito 🍗');
        this.pedido = { nombre: '', cantidad: 1, sabor: 'BBQ' };
      })
      .catch(err => console.error(err));
  }


}
