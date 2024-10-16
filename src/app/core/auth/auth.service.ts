import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {LoginResponseType} from "../../../../types/login-response.type";
import {environment} from "../../../environments/environment";
import {Observable, Subject} from "rxjs";
import {DefaultResponseType} from "../../../../types/default-response.type";



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public accessTokenKey: string = 'accessToken';
  private refreshTokenKey: string = 'refreshToken';
  private userIdKey: string = 'userId';


  public isLogged$: Subject<boolean> = new Subject<boolean>();

  private isLogged: boolean = false;

  constructor(private http: HttpClient) {
    this.isLogged = !!localStorage.getItem(this.accessTokenKey);
  }

  public getLoggedIn(): boolean {
    return this.isLogged;
  }


  login(email: string, password: string, rememberMe: boolean): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'login', {
      email,
      password,
      rememberMe
    });
  }


  signup(email: string, password: string, passwordRepeat: string): Observable<DefaultResponseType | LoginResponseType> {
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'signup', {
      email,
      password,
      passwordRepeat
    });
  }


  logout(): Observable<DefaultResponseType> {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<DefaultResponseType>(environment.api + 'logout', {
      refreshToken
    });
  }


  refresh(): Observable<DefaultResponseType | LoginResponseType>  {
    const refreshToken: string | null = localStorage.getItem(this.refreshTokenKey);
    return this.http.post<DefaultResponseType | LoginResponseType>(environment.api + 'refresh', {refreshToken})
  }


  public setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.isLogged = true;
    this.isLogged$.next(true);
  }


  public removeTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.isLogged = false;
    this.isLogged$.next(false);
  }


  public getTokens(): { accessToken: string | null, refreshToken: string | null } {
    return {
      accessToken: localStorage.getItem(this.accessTokenKey),
      refreshToken: localStorage.getItem(this.refreshTokenKey)
    }
  }

  get userId(): null | string {
    return localStorage.getItem(this.userIdKey);
  }

  set userId(id: string | null) {
    if (id) {
      localStorage.setItem(this.userIdKey, id);
    } else {
      localStorage.removeItem(this.userIdKey)
    }
  }
}
