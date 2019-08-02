import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { Store } from '../interfaces/store';
import { STORES } from '../interfaces/stores';
import { UsersService } from './users.service';

const URL = environment.devPath;

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  policy_id:any;
  token:any;
  id_user:any
  user:any;
  constructor(private http: HttpClient, private storage: Storage, private userService: UsersService) { }

  getStores(): Observable<Store[]> {
	  return of(STORES);
  }

  async getKmStatus(){
    await this.getStorage('car').then((res) => {
      this.policy_id = JSON.parse(res)
    })
    
    return new Promise(resolve => {
      this.http.get(`${URL}acquisitions/${this.policy_id.policy_id}/km_status`).subscribe(
        (response:any) => {
          console.log(response)
          resolve(response.data)
        });
    })
  }

  async getNextDueDate(){
    await this.getStorage('user_id').then((res) => {
      this.id_user = Number(res)
    })
    
    return new Promise(resolve => {
      this.http.get(`${URL}memberships/${this.id_user}/next_due_date`).subscribe(
        (response:any) => {
          console.log(response)
          resolve(response)
        });
    })
  }

  //Add card for payments
  addCard(data){
    return this.http.post(`${URL}cards`,data)
  }

  async deleteCard(id_card){
    return new Promise(resolve =>{
      this.http.delete(`${URL}cards/${id_card}`).subscribe(
        (res:any)=>{
          console.log(res)
          resolve(res)
        }
      )
    })
  }

  setStorage(key: string, value: string) {
    this.storage.set(key, value);
  }
  
  async getStorage(key: string) {
    let valueStorage = await this.storage.get(key);
    return valueStorage;
  }

  

  
}
