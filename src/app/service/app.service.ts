import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class AppService {
  baseUrl = 'https://api.binance.com/api/v3/klines';
  constructor(private httpClient: HttpClient) {}

  getBars(
    symbolInfo: any,
    resolution: string,
    from: number,
    to: number,
    first: boolean,
    limit: string
  ): Observable<any> {
    var split_symbol = symbolInfo.name.split(/[:/]/);
    const params = new HttpParams({fromObject: {
        symbol: `${split_symbol[0]}${split_symbol[1]}`,
        interval: resolution,
        limit
      }}) ;
    return this.httpClient.get(`${this.baseUrl}`, { params })
  }
}
