import { HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../Services/token.service';
import { environment } from '../../environments/environment';
import { catchError, switchMap, throwError, of } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const apiUrl = environment.apiUrl;

  // Se for uma requisição de login ou registro, não adiciona o token
  if (req.url === `${apiUrl}login` || req.url === `${apiUrl}register`) {
    return next(req);
  } else {
    // Se o token de acesso estiver presente, adiciona o Authorization header
    const accessToken = tokenService.getAccessToken();

    if (accessToken) {
      const newReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return next(newReq).pipe(
        catchError((error) => {
          // Se o erro for de token expirado (401), tenta fazer o refresh
          if (error.status === 401) {
            return tokenService.newAccessToken().pipe(
              switchMap((success) => {
                if (success) {
                  // Se o refresh for bem-sucedido, reenvia a requisição com o novo token
                  const newAccessToken = tokenService.getAccessToken();
                  const clonedRetryRequest = req.clone({
                    setHeaders: { Authorization: `Bearer ${newAccessToken}` },
                  });
                  return next(clonedRetryRequest);
                } else {
                  // Se o refresh falhar, redireciona para o login
                  console.log('Erro ao renovar o token. Redirecionando para login.');
                  return throwError(() => new Error('Token expirado'));
                }
              })
            );
          }
          // Se o erro não for de token expirado, apenas propaga o erro
          return throwError(() => error);
        })
      );
    } else {
      // Se não houver token de acesso, apenas propaga a requisição sem autorização
      return next(req);
    }
  }
};
