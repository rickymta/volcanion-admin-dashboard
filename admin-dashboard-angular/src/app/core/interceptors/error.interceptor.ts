import { Injectable } from '@angular/core';
import { 
  HttpInterceptor, 
  HttpRequest, 
  HttpHandler, 
  HttpEvent,
  HttpErrorResponse 
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Đã xảy ra lỗi không xác định';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Lỗi: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = 'Yêu cầu không hợp lệ';
              break;
            case 401:
              errorMessage = 'Không có quyền truy cập';
              break;
            case 403:
              errorMessage = 'Bị cấm truy cập';
              break;
            case 404:
              errorMessage = 'Không tìm thấy tài nguyên';
              break;
            case 500:
              errorMessage = 'Lỗi máy chủ nội bộ';
              break;
            default:
              if (error.error?.message) {
                errorMessage = error.error.message;
              } else {
                errorMessage = `Lỗi: ${error.status} - ${error.statusText}`;
              }
              break;
          }
        }

        console.error('HTTP Error:', {
          status: error.status,
          message: errorMessage,
          url: error.url,
          error: error.error
        });

        return throwError(() => ({
          ...error,
          userMessage: errorMessage
        }));
      })
    );
  }
}
