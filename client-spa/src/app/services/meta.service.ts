import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PageTitleService {

  constructor(
    private titleService: Title,
    private metaService: Meta,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateTitleAndMeta();
    });
  }

  private updateTitleAndMeta(): void {
    const routeSnapshot = this.router.routerState.snapshot.root;
    this.setTitleAndMeta(routeSnapshot);
  }

  private setTitleAndMeta(routeSnapshot: ActivatedRouteSnapshot): void {
    if (routeSnapshot.data) {
      const title = routeSnapshot.data['title'] || '';
      const description = routeSnapshot.data['description'] || '';
      const keywords = routeSnapshot.data['keywords'] || '';

      if (title) {
        this.titleService.setTitle(title);
      }

      if (description) {
        this.metaService.updateTag({ name: 'description', content: description });
      }

      if (keywords) {
        this.metaService.updateTag({ name: 'keywords', content: keywords });
      }
    }

    if (routeSnapshot.firstChild) {
      this.setTitleAndMeta(routeSnapshot.firstChild);
    }
  }
}
