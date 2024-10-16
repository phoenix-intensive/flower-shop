import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {CategoryWithTypeType} from "../../../../../types/category-with-type.type";
import {CartService} from "../../services/cart.service";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {ProductService} from "../../services/product.service";
import {ProductType} from "../../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {FormControl} from "@angular/forms";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{

  showedSearch: boolean = false;
  isLogged: boolean = false;
  count: number = 0;
  serverStaticPath: string = environment.serverStaticPath;
  products: ProductType[] = [];
  searchField = new FormControl();


  @Input() categories: CategoryWithTypeType[] = [];

  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar,
              private cartService: CartService, private productService: ProductService) {
    this.isLogged = this.authService.getLoggedIn();

  }

  ngOnInit(): void {
    //Функция поиска товаров по сайту и скрытия блока с товарами поиска
    // this.searchField.valueChanges - подписываемся на изменение значения в инпуте
    this.searchField.valueChanges
      .pipe(
        //debounceTime - функция которая дает задержку при обработке запросов, чтобы не нагружать приложение
        //моментальными запросами на каждое действие (пример: ввод букв в поиск, пока полз.вводит одну букву
        //в ответ на каждую введенную букву приходит ответ и чтобы такого не было применяется задержка запросов)
        debounceTime(500)
      )
      .subscribe(value => {
        if (value && value.length > 2) {
          this.productService.searchProducts(value)
            .subscribe((data: ProductType[]): void => {
              this.products = data;
            })
        } else {
          this.products = [];
        }
      });



    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean): void => {
        this.isLogged = isLoggedIn;
        if (isLoggedIn) {
          this.updateCartCount();
        } else {
          this.count = 0;
        }
      });

    if (this.isLogged) {
      this.updateCartCount();
    }
  }

  updateCartCount(): void {
    this.cartService.getCartCount()
      .subscribe((data: { count: number } | DefaultResponseType): void => {
        if ('error' in data) {
          throw new Error(data.message);
        } else {
          this.count = (data as { count: number }).count;
        }
      });

    // Подписка на изменение актуального кол-ва товаров в корзине
    this.cartService.count$
      .subscribe((count: number): void => {
        this.count = count;
      });
  }


  logout(): void {
    this.authService.logout()
      .subscribe({
        next: (): void => {
          this.doLogout();
        },
        error: (): void => {
          this.doLogout();
        }
      });
  }

  doLogout(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this._snackBar.open('Вы успешно вышли из системы');
    this.count = 0;
    this.router.navigate(['/']);
  }


  //Функция поиска товаров по сайту
  // changedSearchValue(newValue: string): void {
  //   this.searchValue = newValue;
  //
  //   if (this.searchValue && this.searchValue.length > 2) {
  //     this.productService.searchProducts(this.searchValue)
  //       .subscribe((data: ProductType[]): void => {
  //         this.products = data;
  //       })
  //   } else {
  //     this.products = [];
  //   }
  // }


  //Функция перехода на товар из поиска и очищения инпута писка и скрытия блока с товарами поиска
  selectProduct(url: string): void {
    this.router.navigate(['/product/' + url]);
    //Очищение инпута
    this.searchField.setValue('');
    //Присваивание пустого массива, чтобы блок по условию скрылся
    this.products = [];
  }


  //Функция скрытия блока с товарами поиска при потере фокуса инпута при нажатии на любое место браузера
  changeShowedSearch(value: boolean): void {
    //Делаем задержку для того чтобы фокус не сразу срабатывал и мы успели по нажатию на товар перейти на него!!!
    setTimeout((): void => {
      this.showedSearch = value;
    }, 100);
  }

}
