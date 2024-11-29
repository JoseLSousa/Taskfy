import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Observable } from 'rxjs';
import { TokenService } from '../../Services/token.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  currentState: string = 'description'
  registerForm!: FormGroup
  loginForm!: FormGroup


  constructor(private fb: FormBuilder, private authService: AuthService, private tokenService: TokenService, private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]]
    }),

      this.loginForm = this.fb.group({
        email: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]]
      })
  }
  changeState(state: string): void {
    this.currentState = state
  }

  register(): void {
    if (this.registerForm.invalid) {
      alert('Erro')
      return
    }
    this.authService.register(this.registerForm.value).subscribe(
      (res) => {
        alert('Cadastrado com sucesso!')
        this.currentState = 'login'
      },
      (err) => {
        const validationErrors = err.error?.errors

        if (validationErrors) {
          const errorMessages = Object.values(validationErrors)
          .flat()
          .join('\n')
          alert(errorMessages)
          
        }else {
          alert("Ocorreu um erro. Tente novamente mais tarde.")
        }
       }
    )
  }

  login(): void {
    if (this.loginForm.invalid) {
      alert('erro')
      return
    }
    this.authService.login(this.loginForm.value).subscribe(
      (res) => {
        this.tokenService.saveAcessToken(res.accessToken)
        this.tokenService.saveRefreshToken(res.refreshToken)
        this.router.navigate(["/dashboard"])
      },
      (err) => {
        alert('verifique suas credenciais',)
        console.log(err.status)
        this.currentState = "login"
      }

    )
  }
}
