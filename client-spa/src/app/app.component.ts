import { AfterViewInit, ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { I18nService } from './services/i18n.service';
import { TranslateModule } from '@ngx-translate/core';
import { CanonicalService } from './services/canonical.service';
import { PageTitleService } from './services/meta.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, TranslateModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  currentLanguage: string;
  currentYear: number = new Date().getFullYear();
  
  // Weather properties
  weather: any = null;
  weatherLoading: boolean = false;
  weatherError: boolean = false;
  
  // Cache properties
  private readonly WEATHER_CACHE_KEY = 'weather_data';
  private readonly WEATHER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(
    public i18nService: I18nService,
    private cdr: ChangeDetectorRef,
    private canonicalService: CanonicalService,
    private pageTitleService: PageTitleService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.currentLanguage = this.i18nService.currentLanguage;
    this.i18nService.switchLanguage(this.currentLanguage);

    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
      // Fetch weather immediately
      setTimeout(() => this.fetchWeather(), 100);
    }
  }

  ngAfterViewInit() {
    // Initial setup if needed
  }

  fetchWeather(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Check cache first
    const cachedData = this.getWeatherFromCache();
    if (cachedData) {
      this.weather = cachedData;
      this.cdr.detectChanges();
      return;
    }
    
    this.weatherLoading = true;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const apiKey = 'bd7f9ecc4ee55381a836c38e11817b35';
          const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
          
          fetch(url)
            .then(response => response.json())
            .then(data => {
              const iconCode = data.weather[0].icon;
              const isDay = iconCode.endsWith('d');
              const baseCode = iconCode.substring(0, 2);
              
              const iconMap: { [key: string]: string } = {
                '01': isDay ? '☀️' : '🌙',
                '02': isDay ? '⛅' : '☁️',
                '03': '☁️',
                '04': '☁️',
                '09': '🌧️',
                '10': isDay ? '🌦️' : '🌧️',
                '11': '⛈️',
                '13': '❄️',
                '50': '🌫️'
              };
              
              this.weather = {
                temp: Math.round(data.main.temp),
                location: data.name,
                icon: iconMap[baseCode] || '🌤️',
                description: data.weather[0].description
              };
              
              // Cache the weather data
              this.saveWeatherToCache(this.weather);
              
              this.weatherLoading = false;
              this.cdr.detectChanges();
            })
            .catch((error) => {
              this.weatherError = true;
              this.weatherLoading = false;
            });
        },
        (error) => {
          this.weatherError = true;
          this.weatherLoading = false;
        }
      );
    } else {
      this.weatherError = true;
      this.weatherLoading = false;
    }
  }

  switchLanguage(language: string) {
    this.currentLanguage = language;
    this.i18nService.switchLanguage(language);
    
    // Navigate to the same page but with the new language prefix
    const currentUrl = this.router.url;
    const pathWithoutLang = currentUrl.replace(/^\/(en|ar)/, ''); // Remove current language prefix
    const newUrl = `/${language}${pathWithoutLang || '/home'}`; // Add new language prefix
    
    this.router.navigateByUrl(newUrl);
    this.cdr.detectChanges(); // Trigger change detection
  }

  setCanonicalURL() {
    if (isPlatformBrowser(this.platformId)) {
      this.canonicalService.setCanonicalURL(window.location.href);
    }
  }

  // Helper method to include language in router links
  getRouterLink(path: string): string[] {
    return [`/${this.currentLanguage}`, path];
  }

  getWeatherIconUrl(): string {
    if (!this.weather || !this.weather.icon) {
      return '';
    }
    // Use weathericons.io for more colorful icons
    // Map OpenWeatherMap codes to weather condition
    const iconCode = this.weather.icon;
    const isDay = iconCode.endsWith('d');
    const baseCode = iconCode.substring(0, 2);
    
    // Map to emoji or use colored icon service
    const iconMap: { [key: string]: string } = {
      '01': isDay ? '☀️' : '🌙',  // clear
      '02': isDay ? '⛅' : '☁️',  // few clouds
      '03': '☁️',  // scattered clouds
      '04': '☁️',  // broken clouds
      '09': '🌧️',  // shower rain
      '10': isDay ? '🌦️' : '🌧️',  // rain
      '11': '⛈️',  // thunderstorm
      '13': '❄️',  // snow
      '50': '🌫️'   // mist
    };
    
    const emoji = iconMap[baseCode] || '🌤️';
    
    // Return OpenWeatherMap URL but we'll use emoji instead
    return `https://openweathermap.org/img/wn/${this.weather.icon}@4x.png`;
  }

  onImageError(event: any) {
    // Icon loading error - silently handled
  }

  private getWeatherFromCache(): any {
    if (!isPlatformBrowser(this.platformId)) return null;
    
    try {
      const cached = localStorage.getItem(this.WEATHER_CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (within 15 minutes)
      if (now - timestamp < this.WEATHER_CACHE_DURATION) {
        return data;
      }
      
      // Cache expired, remove it
      localStorage.removeItem(this.WEATHER_CACHE_KEY);
      return null;
    } catch (error) {
      return null;
    }
  }

  private saveWeatherToCache(weatherData: any): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      const cacheObject = {
        data: weatherData,
        timestamp: Date.now()
      };
      localStorage.setItem(this.WEATHER_CACHE_KEY, JSON.stringify(cacheObject));
    } catch (error) {
      // Cache save error - silently handled
    }
  }
}
