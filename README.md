# Интернет-магазин на Angular 

## Описание проекта

Данный проект представляет собой интернет-магазин, разработанный на Angular. Он включает в себя функциональность каталога с фильтрацией товаров, возможностью добавления их в корзину и сохранения в избранные. 
Пользователи могут регистрироваться и авторизовываться, а также управлять своими заказами и профилем в разделе личного кабинета.

## Основные функции

- **Каталог товаров**: Просмотр и фильтрация товаров по различным категориям.
- **Корзина**: Добавление товаров в корзину и оформление заказа.
- **Избранные**: Возможность добавления товаров в избранное для быстрого доступа.
- **Авторизация и регистрация**: Безопасный вход в систему с возможностью создания нового аккаунта.
- **Личный кабинет**: Управление профилем пользователя и просмотр истории заказов.

## Используемые технологии

- **Angular**: Базовая структура для создания приложения, обеспечивающая архитектуру и инструменты для разработки одностраничных приложений.
  
- **Angular Router**: Позволяет реализовать маршрутизацию и навигацию внутри приложения, управляя переходами между различными компонентами и страницами.
  
- **RxJS**: Библиотека для реактивного программирования, используемая для обработки асинхронных потоков данных, что позволяет эффективно управлять событиями и изменениями состояния в приложении.
  
- **HTTP-клиент**: Предоставляет возможность выполнять API-запросы к бэкэнду, что необходимо для получения и отправки данных между клиентом и сервером.
  
- **ng-bootstrap**: Используется для создания компонентов пользовательского интерфейса, стилизованных с помощью Bootstrap, что позволяет быстро разрабатывать адаптивные и современные интерфейсы.
  
- **ngx-owl-carousel-o**: Библиотека для реализации каруселей в каталоге продукции, позволяющая визуально привлекательно отображать товары.
  
- **Angular Material**: Набор компонентов пользовательского интерфейса, таких как кнопки, формы и макеты, которые следуют принципам Material Design, что помогает создать единый и современный дизайн приложения.
  
- **TypeScript**: Язык программирования, используемый для разработки приложения Angular, который добавляет строгую типизацию и улучшает читаемость и поддерживаемость кода.
  
- **Lazy Loading**: Оптимизирует загрузку приложения, позволяя загружать модули и компоненты по мере необходимости, что снижает начальный размер бандла и улучшает производительность.

## Установка и запуск

1. Склонируйте репозиторий:
   ```bash
   git clone <URL_репозитория>
   ```

2. Перейдите в директорию проекта:
   ```bash
   cd <имя_директории>
   ```

3. Установите зависимости:
   ```bash
   npm install
   ```

4. Запустите приложение:
   ```bash
   ng serve
   ```

5. Откройте браузер и перейдите по адресу `http://localhost:4200`.

## Лицензия

Этот проект доступен под лицензией MIT.

---

Вы можете адаптировать и изменять данный шаблон в соответствии с вашими потребностями!
