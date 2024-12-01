import { inject, Injectable } from '@angular/core';
import * as CryptoJs from 'crypto-js';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private refreshTokenTimeout: any; // Armazena o timeout do agendamento
  private secretKey = environment.secretKey;
  private apiUrl = environment.apiUrl;

  constructor(private cookieService: CookieService, private http: HttpClient, private router: Router) {}

  // Salva o token de acesso criptografado no localStorage
  saveAcessToken(accessToken: string, expiresIn: number) {
    const encrypted = CryptoJs.AES.encrypt(accessToken, this.secretKey).toString();
    localStorage.setItem('User', encrypted);

    // Calcula o horário exato de expiração baseado no tempo atual
    const expirationTime = Date.now() + expiresIn * 1000; // `expiresIn` está em segundos
    localStorage.setItem('TokenExpiration', expirationTime.toString());

    console.info('Token de acesso salvo com sucesso');
    this.scheduleSilentRefresh(expiresIn);
  }

  // Recupera o token de acesso criptografado do localStorage
  getAccessToken(): string | null {
    const encryptedToken = localStorage.getItem('User');
    if (!encryptedToken) return null;

    try {
      const decrypted = CryptoJs.AES.decrypt(encryptedToken, this.secretKey).toString(CryptoJs.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar o token', error);
      return null;
    }
  }

  // Salva o refresh token criptografado no cookie
  saveRefreshToken(refreshToken: string) {
    const encrypted = CryptoJs.AES.encrypt(refreshToken, this.secretKey).toString();
    this.cookieService.set('applicationCookie', encrypted, {
      secure: true, // Apenas envia o cookie por HTTPS
      sameSite: 'Strict', // Impede o envio do cookie em contextos de cross-site
    });
    console.log('Refresh token salvo com sucesso!');
  }

  // Verifica se o usuário está logado
  isLoggedIn(): Observable<boolean> {
    const accessToken = this.getAccessToken();
    const expirationTime = localStorage.getItem('TokenExpiration');
    const refreshToken = this.cookieService.get('applicationCookie');

    if (!accessToken || !refreshToken || !expirationTime) return of(false);

    const isExpired = Date.now() > parseInt(expirationTime, 10);

    if (isExpired) {
      // Se o token estiver expirado, tenta renová-lo
      return this.newAccessToken();
    }

    // Token ainda é válido
    return of(true);
  }

  // Realiza a renovação do token de acesso usando o refresh token
  newAccessToken(): Observable<boolean> {
    const refreshToken = CryptoJs.AES.decrypt(this.cookieService.get('applicationCookie'), this.secretKey).toString(CryptoJs.enc.Utf8);
    if (!refreshToken) {
      console.warn('Nenhum refresh token encontrado.');
      return of(false);
    }

    const body = { refreshToken };

    return this.http.post<any>(`${this.apiUrl}refresh`, body, { observe: 'response' }).pipe(
      switchMap((response) => {
        if (response?.status === 200 && response.body?.accessToken && response.body?.expiresIn) {
          this.saveAcessToken(response.body.accessToken, response.body.expiresIn); // Salva o novo token
          return of(true);
        }
        console.error('Falha na renovação do token');
        return of(false);
      }),
      catchError((error) => {
        console.error('Erro ao renovar o token', error);
        return of(false);
      })
    );
  }

  // Redireciona para a página de login
  redirectToLogin() {
    this.router.navigate(['']);
  }

  // Agendamento de silent refresh
  private scheduleSilentRefresh(expiresIn: number) {
    const refreshTime = expiresIn * 1000 - 60000; // Agendado para 1 minuto antes da expiração

    if (refreshTime > 0) {
      this.clearRefreshTokenTimeout(); // Limpa qualquer timeout anterior
      this.refreshTokenTimeout = setTimeout(() => {
        this.newAccessToken().subscribe((success) => {
          if (success) {
            console.log('Token renovado via silent refresh');
          } else {
            this.redirectToLogin();
          }
        });
      }, refreshTime);
    } else {
      console.warn('O token já está expirado ou próximo de expirar.');
      this.redirectToLogin();
    }
  }

  // Limpa o timeout do silent refresh
  private clearRefreshTokenTimeout() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
      this.refreshTokenTimeout = null;
    }
  }

  // Logout do usuário
  logout() {
    this.clearRefreshTokenTimeout();
    localStorage.removeItem('User');
    localStorage.removeItem('TokenExpiration');
    this.cookieService.delete('applicationCookie');
    this.redirectToLogin();
  }
}
