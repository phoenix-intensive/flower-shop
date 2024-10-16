import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {catchError, finalize, Observable, switchMap, throwError} from "rxjs";
import {AuthService} from "./auth.service";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {LoginResponseType} from "../../../../types/login-response.type";
import {LoaderService} from "../../shared/services/loader.service";

@Injectable()

export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router, private loaderService: LoaderService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    //когда осуществляется любой запрос на бэкенд то будет отображаться лоадер
    this.loaderService.show();


    const tokens = this.authService.getTokens();
    if (tokens.accessToken) {
      const authReq = req.clone({
        headers: req.headers.set('x-access-token', tokens.accessToken)
      });
      return next.handle(authReq)
        .pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !authReq.url.includes('/login') && !authReq.url.includes('/refresh')) {
              return this.handle401Error(authReq, next);
            }
            return throwError(() => error)
          }),
          //выключаем лоадер, неважно это ошибка или успешно
          finalize(() => this.loaderService.hide())
        );
    }
    //выключаем лоадер, неважно это ошибка или успешно
    return next.handle(req)
       .pipe(
         finalize(() => this.loaderService.hide())
       );
  }

  handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    return this.authService.refresh()
      .pipe(
        switchMap((result: DefaultResponseType | LoginResponseType) => {
          let error: string = '';
          if ((result as DefaultResponseType).error !== undefined) {
            error = ((result as DefaultResponseType).message);
          }

          const refreshResult = result as LoginResponseType;
          if (!refreshResult.accessToken || !refreshResult.refreshToken || !refreshResult.userId) {
            error = ((result as DefaultResponseType).message);
          }

          if (error) {
            return throwError(() => Error(error));
          }


          if (refreshResult && !error && refreshResult.accessToken && refreshResult.refreshToken) {
            this.authService.setTokens(refreshResult.accessToken, refreshResult.refreshToken);

            const authReq = req.clone({
              headers: req.headers.set('x-access-token', refreshResult.accessToken)
            });
            return next.handle(authReq)
          } else {
            return throwError(() => new Error('Repeat request Error'))
          }
        }),
        catchError(error => {
          this.authService.removeTokens();
          this.router.navigate(['/']);
          return throwError(() => error);
        })
      )
  }
}
