import {Component, HostListener, OnInit} from '@angular/core';
import {ProductService} from "../../../shared/services/product.service";
import {ProductType} from "../../../../../types/product.type";
import {CategoryService} from "../../../shared/services/category.service";
import {CategoryWithTypeType} from "../../../../../types/category-with-type.type";
import {ActivatedRoute, Router} from "@angular/router";
import {ActiveParamsUtil} from "../../../shared/utils/active-params.util";
import {ActiveParamsType} from "../../../../../types/active-params.type";
import {AppliedFilterType} from "../../../../../types/applied-filter.type";
import {debounceTime} from "rxjs";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../../types/cart.type";
import {FavoriteType} from "../../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {FavoriteService} from "../../../shared/services/favorite.service";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {

  products: ProductType[] = [];
  categoriesWithTypes: CategoryWithTypeType[] = [];
  activeParams: ActiveParamsType = {types: []};
  appliedFilters: AppliedFilterType[] = [];
  sortingOpen: boolean = false;
  sortingOptions: { name: string, value: string }[] = [
    //Параметры az-asc, az-desc, price-asc, price-desc мы узнаем у бэкендера!!!!
    {name: 'От А до Я', value: 'az-asc'},
    {name: 'От Я до А', value: 'az-desc'},
    {name: 'По возрастанию цены', value: 'price-asc'},
    {name: 'По убыванию цены', value: 'price-desc'},
  ];
  pages: number[] = [];
  cart: CartType | null = null;
  favoriteProducts: FavoriteType[] | null = null;


  constructor(private productService: ProductService, private categoryService: CategoryService, private activatedRoute: ActivatedRoute, private router: Router,
              private cartService: CartService, private favoriteService: FavoriteService, private authService: AuthService) {
  }

  ngOnInit(): void {
    //Запрашиваем состояние корзины, чтобы отрисовать актуальное состояние кнопки с корзиной(товар в корзине уже или нет)
    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;

        // Так как запрос на избранное может сделать только авторизованный пользователь то функцию processCatalog() и отрисовку каталога мы делаем в любом случае
        //Так как каталог у нас может посмотреть так же и НЕАВТОРИЗОВАННЫЙ пользователь!!!!
        //Запрашиваем избранные товары перед тем как отрисовать каталог, чтобы отрисовать актуальное состояние страницы с добавленными товарами в избранном
        //Запрос на избранные товары произойдет только в случае, когда пользователь авторизован, иначе просто отрисуется каталог с актуальными данными в корзине
        if (this.authService.getLoggedIn()) {
          this.favoriteService.getFavorites()
            .subscribe(
              {
                next: (data: FavoriteType[] | DefaultResponseType): void => {
                  if ((data as DefaultResponseType).error !== undefined) {
                    const error: string = (data as DefaultResponseType).message;
                    //Отрисовка каталога
                    this.processCatalog();
                    throw new Error();
                  }

                  this.favoriteProducts = data as FavoriteType[];
                  //Отрисовка каталога
                  this.processCatalog();
                },
                error: (error): void => {
                  //Отрисовка каталога
                  this.processCatalog();
                }
              });
        } else {
          this.processCatalog();
        }
      });
  }


  //Отрисовка каталога
  processCatalog(): void {
    //Запрашиваем продукты и типы продуктов для отображения состояния фильтров, чтобы отрисовать актуальное состояние страницы с примененными фильтрами
    this.categoryService.getCategoriesWithTypes()
      .subscribe((data: CategoryWithTypeType[]): void => {
        this.categoriesWithTypes = data;
        this.activatedRoute.queryParams
          .pipe(
            //debounceTime - функция которая дает задержку при обработке запросов, чтобы не нагружать приложение
            //моментальными запросами на каждое действие (пример: ввод диаметра в фильтр, пока полз.вводит одну цифру
            //в ответ на каждую введенную цифру приходит ответ и чтобы такого не было применяется задержка запросов)
            debounceTime(500)
          )
          .subscribe(params => {
            this.activeParams = ActiveParamsUtil.processParams(params);

            this.appliedFilters = [];
            this.activeParams.types?.forEach((url: string): void => {
              for (let i = 0; i < this.categoriesWithTypes.length; i++) {
                const foundType = this.categoriesWithTypes[i].types?.find(type => type.url === url);
                if (foundType) {
                  this.appliedFilters.push({
                    name: foundType.name,
                    urlParam: foundType.url
                  });
                }
              }
            });
            if (this.activeParams.heightFrom) {
              this.appliedFilters.push({
                name: 'Высота: от ' + this.activeParams.heightFrom + ' см',
                urlParam: 'heightFrom'
              });
            }
            if (this.activeParams.heightTo) {
              this.appliedFilters.push({
                name: 'Высота: до ' + this.activeParams.heightTo + ' см',
                urlParam: 'heightTo'
              });
            }
            if (this.activeParams.diameterFrom) {
              this.appliedFilters.push({
                name: 'Диаметр: от ' + this.activeParams.diameterFrom + ' см',
                urlParam: 'diameterFrom'
              });
            }
            if (this.activeParams.diameterTo) {
              this.appliedFilters.push({
                name: 'Диаметр: до ' + this.activeParams.diameterTo + ' см',
                urlParam: 'diameterTo'
              });
            }


            //Запрашиваем продукты, чтобы отрисовать актуальное состояние страницы, с актуальным кол-вом добавленных товаров в инпутах
            this.productService.getProducts(this.activeParams)
              .subscribe(data => {
                this.pages = [];
                for (let i: number = 1; i <= data.pages; i++) {
                  this.pages.push(i);
                }
                //Отрисовываем актуальное состояние страницы, с актуальным кол-вом добавленных товаров в инпутах
                if (this.cart && this.cart.items.length > 0) {
                  this.products = data.items.map((product: ProductType) => {
                    if (this.cart) {
                      const productCountInCart = this.cart.items.find(item => item.product.id === product.id);
                      if (productCountInCart) {
                        product.countInCart = productCountInCart.quantity;
                      }
                    }
                    return product;
                  });
                } else {
                  this.products = data.items;
                }

                // Отрисовываем актуальное состояние страницы иконки сердечек с добавленными товарами в избранном
                if (this.favoriteProducts) {
                  this.products = this.products.map((product: ProductType) => {
                    const productInFavorite: FavoriteType | undefined = this.favoriteProducts?.find((item: FavoriteType): boolean => item.id === product.id);
                    if (productInFavorite) {
                      product.isInFavorite = true;
                    }
                    return product;
                  });
                }
              });
          })
      })
  }


  removeAppliedFilter(appliedFilter: AppliedFilterType): void {
    if (appliedFilter.urlParam === 'heightFrom' || appliedFilter.urlParam === 'heightTo' ||
      appliedFilter.urlParam === 'diameterFrom' || appliedFilter.urlParam === 'diameterTo') {
      delete this.activeParams[appliedFilter.urlParam];
    } else {
      this.activeParams.types = this.activeParams.types?.filter((item: string): boolean => item !== appliedFilter.urlParam);
    }

    this.activeParams.page = 1;
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }


  //Функция сварачивания блока фильтрации
  toggleSorting(): void {
    this.sortingOpen = !this.sortingOpen
  }


  sort(value: string): void {
    this.activeParams.sort = value;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }


  //Функции пагинации
  openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }


  openNextPage(): void {
    if (this.activeParams.page && this.activeParams.page < this.pages.length) {
      this.activeParams.page++;
    } else {
      this.activeParams.page = 2;
    }
    this.router.navigate(['/catalog'], {
      queryParams: this.activeParams
    })
  }

  openPrevPage(): void {
    if (this.activeParams.page && this.activeParams.page > 1) {
      this.activeParams.page--;

      this.router.navigate(['/catalog'], {
        queryParams: this.activeParams
      })
    }
  }



  //Скрытие блока с сортировкой по клику в любое место браузера
  @HostListener('document:click', ['$event'])
  click(event: Event): void {
    const target: HTMLElement = event.target as HTMLElement;

    // Проверка, чтобы убедиться, что клик был не внутри элемента с классом catalog-sorting
    if (this.sortingOpen && !target.closest('.catalog-sorting')) {
      this.sortingOpen = false;
    }
  }

}
