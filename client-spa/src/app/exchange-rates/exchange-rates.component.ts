import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-exchange-rates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss'
})
export class ExchangeRatesComponent implements OnInit {
   sources: Observable<any>[] = [
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'XAU'}`),
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'XAG'}`),
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'BTC'}`),
  ];
  cryptoAndMetals: any[] = [];

  constructor(private apiService: ApiService){}
  ngOnInit(): void {
    // Call getRate for each currency type and combine observables using forkJoin
    this.getRates()
    this.getExchangeRates()
  }

  getRates() {

    forkJoin(this.sources)
    .pipe(
      map(([goldRate, silverRate, BtcRate]) => ([
        goldRate,
        silverRate,
        BtcRate,
      ])),
      catchError((error) => of({ error }))
    )
    .subscribe( (response: any)=>{
        // console.log(res)
        this.cryptoAndMetals = response;
    });

  }
  exchangeRates: ExchangeRateResponse = {
    date: '',
    base: '',
    rates: {}
  };
  getExchangeRates(){
    let url = `${environment.baseUrl}home/exchange-rates?currency=${'USD'}`
    this.apiService.get<any>(url ).subscribe( res =>{
      console.log(res)
      this.exchangeRates = res
    })
  }
  getFlagUrl(currencyCode: string): string {
    const countryCode = this.getImgCode(currencyCode);
    return `assets/flags/4x3/${countryCode}.svg`;
  }
  getImgUrl(imgCode: string): string {
    const code = this.getImgCode(imgCode);
    return `assets/metals/${code}.png`;
  }
  getImgCode(currencyCode: string): string {
    const currencyCountryMap: { [key: string]: string } = {
      'AED': 'ae',
      'AUD': 'au',
      'GBP': 'gb',
      'SAR': 'sa',
      'USD': 'us',
      'CAD': 'ca',
      'TRY': 'tr',
      'SYP': 'sy',
      'EGP': 'eg',
      'Bitcoin':'bitcoin2',
      'Gold':'gold',
      'Silver':'silver'
    };
    return currencyCountryMap[currencyCode] || 'UN'; // 'UN' for unknown or unmapped currencies
  }




}
interface ExchangeRateResponse {
  date: string;
  base: string;
  rates: { [key: string]: number };
}
