import { inject, Injectable } from '@angular/core';
import * as CryptoJs from 'crypto-js';
import { environment } from '../../environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private secretKey = environment.secretKey;
  private apiUrl = environment.apiUrl;

  constructor(private cookieService: CookieService, private http: HttpClient) { }

  // Salva o token de acesso criptografado no localStorage
  saveAcessToken(accessToken: string) {
    const encrypted = CryptoJs.AES.encrypt(accessToken, this.secretKey).toString();
    localStorage.setItem('User', encrypted);
    console.info('Token de acesso salvo com sucesso');
  }

  // Recupera o token de acesso criptografado do localStorage
  getAccessToken() {
    const accessToken = localStorage.getItem('User');
    if (!accessToken) return null;

    try {
      const decrypted = CryptoJs.AES.decrypt(accessToken, this.secretKey).toString(CryptoJs.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error('Erro ao descriptografar o token', error);
      return null;
    }
  }

  // Salva o refresh token criptografado no cookie
  saveRefreshToken(refreshToken: string) {
    const encrypted = CryptoJs.AES.encrypt(refreshToken, this.secretKey).toString();
    this.cookieService.set('applicationCookie', encrypted);
    console.log('Refresh token salvo com sucesso!');
  }

  // Verifica se o usuário está logado
  async isLoggedIn(): Promise<boolean> {
    const accessToken = localStorage.getItem('User');
    const refreshToken = this.cookieService.get('applicationCookie');

    if (accessToken && refreshToken) {
      console.log('Tokens de acesso e refresh presentes');

      // Tenta renovar o token de acesso se necessário
      const newTokenObtained = await this.newAccessToken();
      if (newTokenObtained) {
        return true;  // Sucesso na renovação do token
      } else {
        return false; // Falha na renovação
      }
    }
    return false; // Nenhum token encontrado
  }

  // Realiza a renovação do token de acesso usando o refresh token
  newAccessToken(): Observable<boolean> {
    const refreshToken = this.cookieService.get('applicationCookie');
    const body = { refreshToken };

    return this.http
      .post<any>(`${this.apiUrl}refresh`, body, { observe: 'response' })
      .pipe(
        switchMap((response) => {
          if (response?.status === 200 && response?.body?.accessToken) {
            this.saveAcessToken(response.body.accessToken); // Salva o novo accessToken
            return of(true);
          }
          return of(false);
        }),
        catchError(() => of(false))
      );
  }


}
