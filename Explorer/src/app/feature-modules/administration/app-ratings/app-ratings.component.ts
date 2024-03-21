import { Component, OnInit } from '@angular/core';
import { AppRating } from '../model/app-rating.model';
import { AdministrationService } from '../administration.service';
import {GoogleAnalyticsService} from "../../../infrastructure/google-analytics/google-analytics.service";

@Component({
  selector: 'xp-app-ratings',
  templateUrl: './app-ratings.component.html',
  styleUrls: ['./app-ratings.component.css']
})

export class AppRatingsComponent implements OnInit {

  constructor(private service: AdministrationService,
              private googleAnalytics: GoogleAnalyticsService
  ) { }

  appRatings: AppRating[] = [];

  // Pokrece se na inicijalizaciju komponente
  ngOnInit(): void {
    this.googleAnalytics.sendPageView(window.location.pathname);

    this.service.getAppRatings().subscribe(
      (data) => {
        this.appRatings = data;
      },
      (error) => {
        console.log(error);
        alert(error.error.message);
      }
    )
  }




}
