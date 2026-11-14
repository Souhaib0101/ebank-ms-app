import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export enum RequestStatus {
  Loading = 'LOADING',
  Success = 'SUCCESS',
  Error = 'ERROR',
}

export type RequestState<T> =
  | { status: RequestStatus.Loading }
  | { status: RequestStatus.Success; data: T }
  | { status: RequestStatus.Error; errorMessage: string };

export function errorMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0)
      return 'Le serveur est inaccessible. Vérifiez les services et la gateway (port 9999).';
    return `La requête a échoué (HTTP ${error.status}). Veuillez réessayer.`;
  }
  return 'Une erreur est survenue. Veuillez réessayer.';
}

export function requestState<T>(source: Observable<T>): Observable<RequestState<T>> {
  return source.pipe(
    map((data): RequestState<T> => ({ status: RequestStatus.Success, data })),
    catchError((error: unknown) =>
      of<RequestState<T>>({ status: RequestStatus.Error, errorMessage: errorMessage(error) }),
    ),
    startWith({ status: RequestStatus.Loading } as RequestState<T>),
  );
}
