import {Component, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartType} from "../../../../../types/cart.type";
import {CartService} from "../../../shared/services/cart.service";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {

  productsFavorite: FavoriteType[] = [];
  serverStaticPath: string = environment.serverStaticPath;
  count: number = 1;
  cart: CartType | null = null;


  constructor(private favoriteService: FavoriteService, private cartService: CartService) {
  }


  ngOnInit(): void {
    //Запрашиваем избранные товары, чтобы отрисовать актуальное состояние страницы с добавленными товарами в избранном
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          const error: string = (data as DefaultResponseType).message;
          throw new Error();
        }
        this.productsFavorite = data as FavoriteType[];


        //Запрашиваем состояние корзины, чтобы отрисовать актуальное состояние кнопки с корзиной(товар в корзине уже или нет)
        //и актуальное кол-во товара, если товар в корзине
        this.cartService.getCart()
          .subscribe((data: CartType | DefaultResponseType): void => {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }
            this.cart = data as CartType;

            const cartDataResponse: CartType = data as CartType

            if (cartDataResponse) {
              const productsInCart = cartDataResponse.items.filter(item =>
                this.productsFavorite.find((favorite: FavoriteType): boolean => favorite.id === item.product.id)
              );

              this.productsFavorite.forEach((product: FavoriteType): void => {
                const itemInCart = productsInCart.find(item => item.product.id === product.id);
                product.countInCart = itemInCart ? itemInCart.quantity : 0;
              });
            }
          })
      });
  }


  updateCount(id: string, count: number): void {
    if (this.cart) {
      this.cartService.updateCart(id, count)
        .subscribe((data: CartType | DefaultResponseType): void => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          this.cart = data as CartType;
        })
    }
  }


  removeFromFavorites(id: string): void {
    this.favoriteService.removeFavorites(id)
      .subscribe((data: DefaultResponseType): void => {
        if (data.error) {
          throw new Error(data.message);
        }

        this.productsFavorite = this.productsFavorite.filter((item: FavoriteType): boolean => item.id !== id);
      })
  }

  addToCart(product: FavoriteType): void {
    this.cartService.updateCart(product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        // Обновляем товар в списке избранного
        product.countInCart = this.count;

        // Обновляем корзину локально
        if (this.cart) {
          const existingCartItem = this.cart.items.find(item => item.product.id === product.id);

          if (existingCartItem) {
            // Обновляем количество, если товар уже в корзине
            existingCartItem.quantity = this.count;
          } else {
            this.cart.items.push({
              product: product,
              quantity: this.count
            });
          }
        }
      });
  }

}
