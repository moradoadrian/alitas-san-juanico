import { Routes } from '@angular/router';
import { HomeComponent } from './home/home/home.component';
import { MisPedidosComponent } from './components/mis-pedidos/mis-pedidos.component';
import { SeguimientoComponent } from './components/seguimineto/seguimineto.component';

export const routes: Routes = [
  { path: 'inicio', component: HomeComponent },
  { path: 'mi-pedido', component: MisPedidosComponent },
  { path: 'seguimiento/:id', component: SeguimientoComponent }, // 👈 con parámetro para trackId
  { path: '**', redirectTo: 'inicio' } // siempre al final
];
