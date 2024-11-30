import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../Services/token.service';
import { environment } from '../../environments/environment';
import { catchError, switchMap, throwError, of } from 'rxjs';

let isRefreshing = false; // Flag para garantir que a renovação do token ocorra uma vez por vez

// Função auxiliar para adicionar o token de autorização
function addAuthHeader(req: any, token: string | null) {
  if (token) {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  return req; // Se não houver token, retorna a requisição sem o cabeçalho
}

// Função auxiliar para verificar se a URL não exige autenticação
function isPublicUrl(reqUrl: string, apiUrl: string) {
  return reqUrl === `${apiUrl}login` || reqUrl === `${apiUrl}register`;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const apiUrl = environment.apiUrl;

  // Se for uma requisição pública (login ou registro), não adiciona o token
  if (isPublicUrl(req.url, apiUrl)) {
    return next(req);
  }

  // Obtém o token de acesso
  const accessToken = tokenService.getAccessToken();
  const newReq = addAuthHeader(req, accessToken); // Chama a função que adiciona o token, ou retorna a requisição original

  return next(newReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        tokenService.redirectToLogin()
      }
      // Se o erro não for de token expirado, apenas propaga o erro
      return throwError(() => error);
    })
  );
};
