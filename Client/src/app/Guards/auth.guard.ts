import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from '../Services/token.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  // Verifique se o usuário está autenticado
  const isLoggedIn = await tokenService.isLoggedIn();

  if (isLoggedIn) {
    return true;  // Se estiver autenticado, permite o acesso
  }

  // Se não estiver autenticado, redireciona para o login
  router.navigate([''], { queryParams: { returnUrl: state.url } });
  return false;
};
