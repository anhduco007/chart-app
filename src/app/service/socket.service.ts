import { Injectable, OnDestroy } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Bar, LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback } from 'src/assets/charting_library/charting_library.min';

import { DataSocketKlineRes } from '../models/chart.model';
@Injectable()
export class SocketService implements OnDestroy {
  static API = {
    count: 1,
    kline: (symbol: string, interval: string = '1m') => `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`,
  };

  socketObj = new Map<string, WebSocketSubject<DataSocketKlineRes>>();

  ngOnDestroy(): void {
    this.socketObj.forEach((value) => value.unsubscribe());
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onTick: SubscribeBarsCallback,
    listenerGuid: string,
    onResetCacheNeededCallback: () => void
  ) {
    if (+resolution < 60) {
      resolution += 'm';
    }
    if (+resolution >= 60 && +resolution < 1440) {
      resolution = `${+resolution / 60}h`;
    }
    if (+resolution === 1440) {
      resolution = '1d';
    }
    if (+resolution === 10080) {
      resolution = '1w';
    }
    const symbol = symbolInfo.name.replace(':', '').toLowerCase();
    const subject = webSocket<DataSocketKlineRes>(
      SocketService.API.kline(symbol, resolution)
    );
    this.socketObj.set(listenerGuid, subject);
    subject.subscribe((value) => {
      const data = value.k;
      const newBar: Bar = {
        time: data.t,
        open: data.o,
        high: data.h,
        low: data.l,
        close: data.c,
      };
      onTick(newBar);
    });
    SocketService.API.count++;
  }

  unsubscribeBars(listenerGuid: string) {
    if (this.socketObj.has(listenerGuid)) {
      const socket = this.socketObj.get(listenerGuid);
      socket?.unsubscribe();
    }
  }
}
