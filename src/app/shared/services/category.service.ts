import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map, Observable} from "rxjs";
import {CategoryType} from "../../../../types/category.type";
import {environment} from "../../../environments/environment";
import {TypeType} from "../../../../types/type.type";
import {CategoryWithTypeType} from "../../../../types/category-with-type.type";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  constructor(private http: HttpClient) {
  }


  getCategories(): Observable<CategoryType[]> {
    return this.http.get<CategoryType[]>(environment.api + 'categories');
  }



  getCategoriesWithTypes(): Observable<CategoryWithTypeType[]> {
    return this.http.get<TypeType[]>(environment.api + 'types')
      //.pipe и map — это операторы, которые используются для работы с потоками данных (Observables) в контексте реактивного программирования с использованием библиотеки RxJS. Эти операторы позволяют модифицировать, фильтровать, комбинировать или иным образом управлять данными, которые проходят через поток.
      //map — это оператор, который используется для трансформации каждого элемента в потоке данных. Этот оператор принимает функцию, которая применяется к каждому элементу Observable и возвращает новый элемент. Этот новый элемент затем передается дальше по цепочке операторов или в подписчика.
      //с помощью .pipe и map - мы промежуточно трансформировали структуру ответа бэкенда под себя,
      //НЕ МЕНЯЯ САМОГО БЭКЕНДА!!!!
      .pipe(
        map((items: TypeType[]) => {
          const array: CategoryWithTypeType[] = [];
          items.forEach((item: TypeType): void => {
            //Ищем каттегорию в массиве и если категория уже существует, то добавляем просто туда новый тип, если нет, то
            //создаем и новую категорию и добавляем туда новый тип

            const foundItem: CategoryWithTypeType | undefined = array.find((arrayItem: CategoryWithTypeType): boolean => arrayItem.url === item.category.url);

            //если категория уже существует, то добавляем просто туда новый тип
            if (foundItem) {
              foundItem.types.push({
                id: item.id,
                name: item.name,
                url: item.url,
              });
              //если категории не существует, то создаем и новую категорию и добавляем туда новый тип
            } else {
              array.push({
                id: item.category.id,
                name: item.category.name,
                url: item.category.url,
                types: [
                  {
                    id: item.id,
                    name: item.name,
                    url: item.url,
                  }],
              })
            }
          });
          return array;
        })
      );
  }
}
