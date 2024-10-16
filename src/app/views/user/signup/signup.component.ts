import {Component, OnInit} from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {LoginResponseType} from "../../../../../types/login-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    passwordRepeat: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)]],
    agree: [false, Validators.requiredTrue]
  });

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
  }


  signup(): void {
    if (this.signupForm.valid && this.signupForm.value.email && this.signupForm.value.password && this.signupForm.value.passwordRepeat && this.signupForm.value.agree) {
      this.authService.signup(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.passwordRepeat)
        .subscribe({
          next: (data: DefaultResponseType | LoginResponseType): void => {
            let error = null;
            if ((data as DefaultResponseType).error !== undefined) {
              error = (data as DefaultResponseType).message;
            }

            const signupResponse: LoginResponseType = data as LoginResponseType;

            if (!signupResponse.accessToken || !signupResponse.refreshToken || !signupResponse.userId) {
              error = 'Ошибка при авторизации';
            }

            if (error) {
              this._snackBar.open(error);
              throw new Error(error);
            }


            this.authService.setTokens(signupResponse.accessToken, signupResponse.refreshToken);
            this.authService.userId = signupResponse.userId;


            this._snackBar.open('Вы успешно зарегистрировались');
            this.router.navigate(['/']);

          },
          error: (errorResponse: HttpErrorResponse): void => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка при авторизации');
            }
          }
        })
    }
  }
}
