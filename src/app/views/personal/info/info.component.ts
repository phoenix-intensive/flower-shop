import {Component, OnInit} from '@angular/core';
import {PaymentType} from "../../../../../types/payment.type";
import {DeliveryType} from "../../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../../../shared/services/user.service";
import {DefaultResponseType} from "../../../../../types/default-response.type";
import {UserInfoType} from "../../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {

  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  paymentTypes = PaymentType;

  userInfoForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: [''],
    fatherName: [''],
    paymentType: [PaymentType.cashToCourier],
    email: ['', Validators.required],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
  })


  constructor(private userService: UserService, private router: Router, private _snackBar: MatSnackBar,
              private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.userService.getUserInfo()
      .subscribe((data: UserInfoType | DefaultResponseType): void => {
        if ((data as DefaultResponseType).error !== undefined) {
          throw new Error((data as DefaultResponseType).message);
        }

        const userInfo: UserInfoType = data as UserInfoType;

        const paramsToUpdate = {
          firstName: userInfo.firstName ? userInfo.firstName : '',
          lastName: userInfo.lastName ? userInfo.lastName : '',
          phone: userInfo.phone ? userInfo.phone : '',
          fatherName: userInfo.fatherName ? userInfo.fatherName : '',
          paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
          email: userInfo.email ? userInfo.email : '',
          street: userInfo.street ? userInfo.street : '',
          house: userInfo.house ? userInfo.house : '',
          entrance: userInfo.entrance ? userInfo.entrance : '',
          apartment: userInfo.apartment ? userInfo.apartment : ''
        }

        //Устанавливаем полученные данные в инпуты формы
        this.userInfoForm.setValue(paramsToUpdate);

        if (userInfo.deliveryType) {
          this.deliveryType = userInfo.deliveryType;
        }
      })
  }

  //Функция переключения способа доставки
  changeDeliveryType(type: DeliveryType): void {
    this.deliveryType = type;
    //markAsDirty(); - чтобы при переключения способа доставки кнопка "Сохранить" стала активной
    this.userInfoForm.markAsDirty();
  }


  updateUserInfo(): void {
    if (this.userInfoForm.valid) {

      const paramsObject: UserInfoType = {
        email: this.userInfoForm.value.email ? this.userInfoForm.value.email : '',
        deliveryType: this.deliveryType,
        paymentType: this.userInfoForm.value.paymentType ? this.userInfoForm.value.paymentType : PaymentType.cashToCourier,
      };

      if (this.userInfoForm.value.firstName) {
        paramsObject.firstName = this.userInfoForm.value.firstName;
      }
      if (this.userInfoForm.value.lastName) {
        paramsObject.lastName = this.userInfoForm.value.lastName;
      }
      if (this.userInfoForm.value.fatherName) {
        paramsObject.fatherName = this.userInfoForm.value.fatherName;
      }
      if (this.userInfoForm.value.street) {
        paramsObject.street = this.userInfoForm.value.street;
      }
      if (this.userInfoForm.value.apartment) {
        paramsObject.apartment = this.userInfoForm.value.apartment;
      }
      if (this.userInfoForm.value.house) {
        paramsObject.house = this.userInfoForm.value.house;
      }
      if (this.userInfoForm.value.entrance) {
        paramsObject.entrance = this.userInfoForm.value.entrance;
      }


      this.userService.updateUserInfo(paramsObject)
        .subscribe({
          next: (data: DefaultResponseType): void => {
            if (data.error) {
              this._snackBar.open(data.message);
              throw new Error(data.message);
            }

            this._snackBar.open('Данные успешно сохранены');
            //markAsPristine(); - чтобы после нажатия "Сохранить", кнопка стала неактивной
            this.userInfoForm.markAsPristine();
          },
          error: (error: HttpErrorResponse): void => {
            this._snackBar.open(error.error.message);
            throw new Error(error.error.message);
          }
        });
    }
  }
}
