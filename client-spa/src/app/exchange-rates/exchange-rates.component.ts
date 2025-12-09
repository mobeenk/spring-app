import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { ApiService } from '../services/api.service';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import * as _ from 'lodash'; // Import lodash
import { CanonicalService } from '../services/canonical.service';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-exchange-rates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.scss'
})
export class ExchangeRatesComponent implements OnInit, AfterViewInit {
   sources: Observable<any>[] = [
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'XAU'}`),
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'XAG'}`),
    this.apiService.get<any>( `${environment.baseUrl}home/crypto-metals-rate?currency=${'BTC'}`),
  ];
  cryptoAndMetals: any[] = [];
  origianlCryptoAndMetals: any[] = [];
  rates: { key: string, rate: number }[] = []; // Array to hold rates data

  constructor(
    private apiService: ApiService,
    private canonicalService: CanonicalService,
    @Inject(PLATFORM_ID) private platformId: Object
  ){
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }
  ngOnInit(): void {
    // Intentionally left empty to avoid heavy API calls during SSR.
    // Data fetching will run on the client in ngAfterViewInit.
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.getRates();
      this.getExchangeRates();
    }
  }
  setCanonicalURL() {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
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
        this.origianlCryptoAndMetals = response
        console.log(this.cryptoAndMetals)
    });

  }
  exchangeRates: ExchangeRateResponse = {
    date: '',
    base: '',
    rates: {}
  };
  getExchangeRates() {
    let url = `${environment.baseUrl}home/exchange-rates?currency=${'USD'}`;
    this.apiService.get<any>(url).subscribe(res => {
      this.exchangeRates = res;
  
      // Create an array of objects from rates and sort it
      this.rates = Object.keys(res.rates)
        .map(key => ({ key: key, rate: res.rates[key] }))
        .sort((a, b) => {
          if (a.key === "USD") return -1; // "USD" comes first
          if (b.key === "USD") return 1; // "USD" comes first
          return a.key.localeCompare(b.key); // Alphabetical order for other keys
        });
  
      // Optionally log the sorted rates
      // console.log(this.rates);
    });
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
isUSD: boolean = true;
  onConvertToCurency(currency: any){
      // Reset to original data
      // Reset to original data
    this.cryptoAndMetals = _.cloneDeep(this.origianlCryptoAndMetals);
    
    const rate = parseFloat(currency.target.value); 
    this.isUSD = rate ===1 ? true: false;
    this.cryptoAndMetals.forEach(item => {
      item.price = item.price * rate;
    });
  }




}
interface ExchangeRateResponse {
  date: string;
  base: string;
  rates: { [key: string]: number };
}
