import { Component, Input, OnInit } from '@angular/core';
import {
  widget,
  IChartingLibraryWidget,
  ChartingLibraryWidgetOptions,
  Timezone,
  IBasicDataFeed,
  HistoryDepth,
  SeriesStyle,
  Bar,
} from '../../assets/charting_library/charting_library.min';
import { AppService } from '../service/app.service';
import { SocketService } from '../service/socket.service';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @Input() set symbol(symbol: ChartingLibraryWidgetOptions['symbol']) {
    this._symbol = symbol || this._symbol;
  }
  @Input() set interval(interval: ChartingLibraryWidgetOptions['interval']) {
      this._interval = interval || this._interval;
  }
  @Input() set libraryPath(libraryPath: ChartingLibraryWidgetOptions['library_path']) {
      this._libraryPath = libraryPath || this._libraryPath;
  }
  @Input() set chartsStorageUrl(chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url']) {
      this._chartsStorageUrl = chartsStorageUrl || this._chartsStorageUrl;
  }
  @Input() set chartsStorageApiVersion(chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version']) {
      this._chartsStorageApiVersion = chartsStorageApiVersion || this._chartsStorageApiVersion;
  }
  @Input() set clientId(clientId: ChartingLibraryWidgetOptions['client_id']) {
      this._clientId = clientId || this._clientId;
  }
  @Input() set userId(userId: ChartingLibraryWidgetOptions['user_id']) {
      this._userId = userId || this._userId;
  }
  @Input() set fullscreen(fullscreen: ChartingLibraryWidgetOptions['fullscreen']) {
      this._fullscreen = fullscreen || this._fullscreen;
  }
  @Input() set autosize(autosize: ChartingLibraryWidgetOptions['autosize']) {
      this._autosize = autosize || this._autosize;
  }
  @Input() set containerId(containerId: ChartingLibraryWidgetOptions['container_id']) {
      this._containerId = containerId || this._containerId;
  }
  public _symbol: ChartingLibraryWidgetOptions['symbol'] = 'ETH:USDT';
  private _interval: ChartingLibraryWidgetOptions['interval'] = '1';
  private _libraryPath: ChartingLibraryWidgetOptions['library_path'] = '/assets/charting_library/';
  private _chartsStorageUrl: ChartingLibraryWidgetOptions['charts_storage_url'] = 'https://saveload.tradingview.com';
  private _chartsStorageApiVersion: ChartingLibraryWidgetOptions['charts_storage_api_version'] = '1.1';
  private _clientId: ChartingLibraryWidgetOptions['client_id'] = 'tradingview.com';
  private _userId: ChartingLibraryWidgetOptions['user_id'] = 'public_user_id';
  private _fullscreen: ChartingLibraryWidgetOptions['fullscreen'] = false;
  private _autosize: ChartingLibraryWidgetOptions['autosize'] = true;
  private _containerId: ChartingLibraryWidgetOptions['container_id'] = 'tv_chart_container';
  private _tvWidget: IChartingLibraryWidget | null = null;
  Datafeed!:IBasicDataFeed;
  timezone:Timezone='Etc/UTC';
  supportedResolutions:string[] = ["1", "3", "5", "30", "60", "120", "240","1440", "10080"]
  historyDepthReturn:HistoryDepth | undefined;
  config = {
      supported_resolutions: this.supportedResolutions
  };
  optionSelected: number = 1;
  selectOptions: { name: string, value: string }[] = [
    { name: 'Time', value: 'T' },
    { name: '1m', value: '1' },
    { name: '3m', value: '3' },
    { name: '5m', value: '5' },
    { name: '30m', value: '30' },
    { name: '1H', value: '60' },
    { name: '2H', value: '120' },
    { name: '4H', value: '240' },
    { name: '1D', value: '1440' },
    { name: '1W', value: '10080' },
  ];

  constructor(
    private appService: AppService,
    private socketService: SocketService
  ) {
  }

  ngOnInit(): void {
    this.loadData();
    const widgetOptions: ChartingLibraryWidgetOptions = { 
        symbol: this._symbol,
        datafeed: this.Datafeed,
        interval: this._interval,
        container_id: this._containerId,
        library_path: this._libraryPath,
        locale: 'en',
        disabled_features: [
          'header_widget',
          'timeframes_toolbar',
          'border_around_the_chart',
          'show_hide_button_in_legend',
          'edit_buttons_in_legend',
          'context_menus',
          'volume_force_overlay'
        ],
        enabled_features: ['left_toolbar'],
        charts_storage_url: this._chartsStorageUrl,
        charts_storage_api_version: this._chartsStorageApiVersion,
        client_id: this._clientId,
        user_id: this._userId,
        fullscreen: this._fullscreen,
        autosize: this._autosize,
        theme: 'Light',
        drawings_access: { type: 'black', tools: [ { name: "Trend Line" } ] },
    };

    const tvWidget = new widget(widgetOptions);
    this._tvWidget = tvWidget;
  }

  loadData(){
    this.Datafeed = {
      onReady: cb => {
        setTimeout(() => cb(this.config), 0)},
        searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {},
        resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
          var split_data = symbolName.split(/[:/]/);
          var symbol_stub = {
            name: symbolName,
            description: `${split_data[0]}/${split_data[1]}`,
            type: 'crypto',
            session: '24x7',
            timezone: this.timezone,
            ticker: symbolName,
            exchange: split_data[0],
            minmov: 1,
            pricescale: 100000000,
            has_intraday: true,
            intraday_multipliers: this.supportedResolutions,
            supported_resolutions:  this.supportedResolutions,
            volume_precision: 8,
            full_name:'full_name',
            listed_exchange:'listed_exchange'
          }
          
          symbol_stub.pricescale = 100;
          setTimeout(function() {
            onSymbolResolvedCallback(symbol_stub)
          }, 0)
        },
        getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
          if(+resolution < 60){
            resolution+='m';
          }
          if(+resolution >= 60 && +resolution < 1440){
            resolution=`${+resolution/60}h`;
          }
          if(+resolution === 1440){
            resolution='1d';
          }
          if(+resolution === 10080){
            resolution='1w';
          }
          this.appService.getBars(symbolInfo,resolution,from,to, firstDataRequest,'1000').subscribe((data) => {
            if (!data) {
              onHistoryCallback([], {noData: true})
            }
            if (data.length) {
              var bars: Bar[] = data.map((el: [number, string, string, string,string, number]) => {
                const [time,open,high,low,close,volume] = el;
                return { time, open, high, low, close, volume: volume/200 }
              })
              onHistoryCallback(bars, {noData: false})
                if (firstDataRequest) {
                  var lastBar = bars[bars.length - 1]
                  history[symbolInfo.name] = {lastBar: lastBar}
                }
                if (bars.length) {
                  onHistoryCallback(bars, {noData: false})
                }
                else {
                  onHistoryCallback([], {noData: true})
                }
            } else {
              onHistoryCallback([], {noData: true})
            }
          })
        },
        subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
          this.socketService.subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback)
        },
        unsubscribeBars: subscriberUID => {
          this.socketService.unsubscribeBars(subscriberUID);
        },
          
    }
  }

  setResolution(value: string){ 
    if(Number.isNaN(+value)){
      this._tvWidget?.activeChart().setChartType(SeriesStyle.Line)
    }
    if(!Number.isNaN(+value)){
      const type: SeriesStyle | undefined = this._tvWidget?.activeChart().chartType();
      if(type !== SeriesStyle.Candles){
        this._tvWidget?.activeChart().setChartType(SeriesStyle.Candles)
      }
      this._tvWidget?.activeChart().setResolution(value, () => {})
    }
  }

  changeResolution(index: number) {
    this.optionSelected = index;
    this.setResolution(this.selectOptions[index].value);
  }
}
