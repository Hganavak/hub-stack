
import { NgModule } from '@angular/core';

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { RoutingModule } from './routing/routing.module';
import { SharedModule } from './components/shared/app.shared.module';
import { ServicesModule } from './services/services.module';
import { HeaderComponent } from './components/header/header.component';
import { HeaderService } from './components/header/header.service';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { SearchBarService } from './components/search-bar/search-bar.service';
import { AppComponentService } from './app.component.service';
import { SearchFiltersService } from './components/search-results/search-filters/search-filters.service';

import { AuthModule, CognitoConfigService } from 'uoa-auth-angular';
import { AppAuthConfigService } from './services/app-auth-config.service';
import { ErrorPagesModule } from 'uoa-error-pages-angular';
import { HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { FlexLayoutModule } from '@angular/flex-layout';

import { HomeModule } from './components/home/home.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SearchBarComponent
  ],
  imports: [
    AuthModule,
    BrowserModule,
    BrowserAnimationsModule,
    ServicesModule,
    SharedModule,
    StorageServiceModule,
    RoutingModule,
    ErrorPagesModule,
    HttpClientModule,
    // MaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FlexLayoutModule,
    HomeModule
  ],
  entryComponents: [],
  providers: [
    HeaderService,
    SearchBarService,
    AppComponentService,
    SearchFiltersService,
    { provide: CognitoConfigService, useClass: AppAuthConfigService }],
  bootstrap: [AppComponent]
})
export class AppModule {
}
