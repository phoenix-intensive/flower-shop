import {Component, Input, OnInit} from '@angular/core';
import {ProductType} from "../../../../../types/product.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {CartType} from "../../../../../types/cart.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {FavoriteType} from "../../../../../types/favorite.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";
import {FavoriteService} from "../../services/favorite.service";
import {Router} from "@angular/router";

@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {

  @Input() product!: ProductType;
  @Input() isLight: boolean = false;
  @Input() countInCart: number | undefined = 0;
  isLogged: boolean = false;

  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;


  constructor(private cartService: CartService, private favoriteService: FavoriteService, private _snackBar: MatSnackBar, private authService: AuthService,
              private router: Router) {
    this.isLogged = this.authService.getLoggedIn();
  }

  ngOnInit(): void {
    if (this.countInCart && this.countInCart > 1) {
      this.count = this.countInCart;
    }

    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean): void => {
        this.isLogged = isLoggedIn;
      })
  }

  addToCart(): void {
    if (!this.isLogged) {
      // Уведомление об авторизации
      this._snackBar.open('Пожалуйста, авторизуйтесь, чтобы добавлять товары в корзину.');
      return;
    }

    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      })
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.countInCart = this.count;
        })
    }
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
        this.count = 1;
      })
  }




  updateFavorite(): void {
    if (!this.authService.getLoggedIn()) {
      this._snackBar.open('Для добавления товара в избранное необходимо авторизоваться');
      return;
    }
    if (this.product.isInFavorite) {
      this.favoriteService.removeFavorites(this.product.id)
        .subscribe((data: DefaultResponseType): void => {
          if (data.error) {
            throw new Error(data.message);
          }
          this.product.isInFavorite = false;
        })
    } else {
      this.favoriteService.addFavorites(this.product.id)
        .subscribe((data: FavoriteType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            const error: string = (data as DefaultResponseType).message;
            throw new Error();
          }
          this.product.isInFavorite = true;
        })
    }
  }


  navigate(): void {
    if (this.isLight) {
      this.router.navigate(['/product/' + this.product.url]);
    }
  }

}
