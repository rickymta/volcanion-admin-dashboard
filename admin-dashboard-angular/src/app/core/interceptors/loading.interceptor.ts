import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent 
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private requestCount = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.requestCount++;
    
    // Emit loading state
    this.setLoading(true);

    return next.handle(req).pipe(
      finalize(() => {
        this.requestCount--;
        if (this.requestCount === 0) {
          this.setLoading(false);
        }
      })
    );
  }

  private setLoading(loading: boolean): void {
    // You can inject a loading service here to manage global loading state
    // For now, we'll just emit an event
    const event = new CustomEvent('loading', { detail: loading });
    document.dispatchEvent(event);
  }
}
