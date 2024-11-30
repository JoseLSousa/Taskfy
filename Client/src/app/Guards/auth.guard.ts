import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../Services/token.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Mostra algum tipo de carregamento ou espera enquanto verifica a autenticação
  const isLoggedIn = await tokenService.isLoggedIn().toPromise();  // Aguarda a resolução

  if (isLoggedIn) {
    return true;  // Se estiver autenticado, permite o acesso
  }

  // Se não estiver autenticado, redireciona para o login
  router.navigate([''], { queryParams: { returnUrl: state.url } });

  return false;
};
