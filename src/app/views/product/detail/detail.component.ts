import {Component, Input, OnInit} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {ProductType} from "../../../../../types/product.type";
import {ProductService} from "../../../shared/services/product.service";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  recommendedProducts: ProductType[] = [];
  product!: ProductType;
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
  isLogged: boolean = false;

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 24,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      },
      940: {
        items: 4
      }
    },
    nav: false
  }

  constructor(private productService: ProductService, private activatedRoute: ActivatedRoute, private cartService: CartService,
              private favoriteService: FavoriteService, private _snackBar: MatSnackBar, private authService: AuthService) {
    this.isLogged = this.authService.getLoggedIn();
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      //Запрашиваем продукт, чтобы отрисовать актуальное состояние страницы с продуктом
      this.productService.getProduct(params['url'])
        .subscribe((data: ProductType): void => {
          this.product = data;
          //Запрашиваем состояние корзины, чтобы отрисовать актуальное состояние кнопки с корзиной(товар в корзине уже или нет)
          //и актуальное кол-во товара, если товар в корзине
          this.cartService.getCart()
            .subscribe((cartData: CartType | DefaultResponseType): void => {
              if ((cartData as DefaultResponseType).error !== undefined) {
                throw new Error((cartData as DefaultResponseType).message);
              }

              const cartDataResponse: CartType = cartData as CartType

              if (cartDataResponse) {
                const productInCart = cartDataResponse.items.find(item => item.product.id === this.product.id);
                if (productInCart) {
                  this.product.countInCart = productInCart.quantity;
                  this.count = this.product.countInCart;
                }
              }
            });

          //Запрашиваем состояние избранного, чтобы отрисовать актуальное состояние кнопки с иконкой избранные(товар в избранном уже или нет)
          if (this.authService.getLoggedIn()) {
            this.favoriteService.getFavorites()
              .subscribe((data: FavoriteType[] | DefaultResponseType): void => {
                if ((data as DefaultResponseType).error !== undefined) {
                  const error: string = (data as DefaultResponseType).message;
                  throw new Error();
                }
                const products: FavoriteType[] = data as FavoriteType[];
                const currentProductExists: FavoriteType | undefined = products.find((item: FavoriteType): boolean => item.id === this.product.id);
                if (currentProductExists) {
                  this.product.isInFavorite = true;
                }
              });
          }
        })
    });

    //Запрашиваем рекомендуемые товары, чтобы отрисовать на странице блок с рекомендуемыми товарами
    this.productService.getBestProducts()
      .subscribe((data: ProductType[]): void => {
        this.recommendedProducts = data;
      })

    this.authService.isLogged$
      .subscribe((isLoggedIn: boolean): void => {
        this.isLogged = isLoggedIn;
      })
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.product.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.product.countInCart = this.count;
        })
    }
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = this.count;
      })
  }


  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.product.countInCart = 0;
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
}
