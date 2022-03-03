import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';
import { HttpClientModule } from '@angular/common/http';
import { SocketService } from './service/socket.service';
import { AppService } from './service/app.service';

@NgModule({
  declarations: [	
    AppComponent,
      ChartComponent
   ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [SocketService, AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
