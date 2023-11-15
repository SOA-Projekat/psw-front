import { Component, AfterViewInit, Input, OnDestroy } from '@angular/core';

import * as L from 'leaflet';
import { MapService } from './map.service';

import 'leaflet-routing-machine';

import { Observable, Subscription, forkJoin } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TourAuthoringService } from 'src/app/feature-modules/tour-authoring/tour-authoring.service';
import { TourPoint } from 'src/app/feature-modules/tour-authoring/model/tourPoints.model';
import { mergeMap, tap } from 'rxjs/operators';
import { AdministrationService } from 'src/app/feature-modules/administration/administration.service';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements AfterViewInit {
  @Input() saveOnlyLatest = false;

  private map: any;
  tourId: string;
  objects: { latitude: number; longitude: number }[];
  tourIdSubscription: Subscription | undefined = undefined;
  tourPointAddSubscription: Subscription | undefined = undefined;
  transportTypechanged: Subscription | undefined = undefined;
  routeWaypoints: any[] = [];
  @Input() tourIdEx: number = 0;
  tourIdexS: string;
  routeControl: any;

  constructor(
    private service: MapService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private tourAuthoringService: TourAuthoringService,
    private administrationService: AdministrationService,
    private tokenStorage: TokenStorage
  ) {}

  private initMap(): void {
    this.map = this.service.initMap();
    this.registerOnClick();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit');
    let DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
      iconAnchor: [12, 41],
    });

    L.Marker.prototype.options.icon = DefaultIcon;
    setTimeout(() => {
      this.initMap();
    }, 0);
    this.setRoute();
    this.setObjects();
    this.setExecuteRoute();
    // this.setPosition();
  }

  ngOnInit() {
    if (this.tourIdSubscription != undefined) {
      this.tourIdSubscription.unsubscribe();
    }

    if (this.tourPointAddSubscription != undefined) {
      this.tourPointAddSubscription.unsubscribe();
    }

    if (this.transportTypechanged != undefined) {
      this.transportTypechanged.unsubscribe();
    }

    this.tourIdSubscription = this.tourAuthoringService.currentTourId.subscribe(
      (tourId) => {
        this.tourId = tourId.split('|#$%@$%|')[0];
        if (tourId.split('|#$%@$%|').length > 1) {
          if (tourId.split('|#$%@$%|')[1] === 'same') {
            this.ngAfterViewInit();
          }
        }
      }
    );

    this.tourPointAddSubscription =
      this.tourAuthoringService.tourPointAdded.subscribe(() => {
        if (this.routeControl) {
          this.routeControl.remove();
        }
        this.setRoute();
      });

    this.transportTypechanged =
      this.tourAuthoringService.transportTypeChanged.subscribe(() => {
        if (this.routeControl) {
          this.routeControl.remove();
        }
        this.setRoute();
      });
  }

  registerOnClick(): void {
    this.map.on('click', (e: any) => {
      const coord = e.latlng;
      const lat = coord.lat;
      const lng = coord.lng;
      this.service.setCoordinates({ lat, lng });

      if (this.saveOnlyLatest) {
        // ovaj if radi za tour search
        this.map.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            this.map.removeLayer(layer);
          }
        });
      }

      this.service.reverseSearch(lat, lng).subscribe((res) => {
        console.log(res.display_name);
      });
      console.log(
        'You clicked the map at latitude: ' + lat + ' and longitude: ' + lng
      );

      const mp = new L.Marker([lat, lng]).addTo(this.map);

      if (!this.saveOnlyLatest) alert(mp.getLatLng()); //ovo samo sklanja za tur src post mi smeta
    });
  }

  setObjects() {
    let specialTourIcon = L.icon({
      iconUrl:
        'https://www.wanderfinder.com/wp-content/uploads/leaflet-maps-marker-icons/MapMarker_Marker_Outside_Orange.png',
      iconAnchor: [12, 41],
    });

    this.tourAuthoringService
      .getObjInTourByTourId(parseInt(this.tourId))
      .subscribe(
        (objects: any) => {
          this.objects = objects;
          this.objects.forEach((object) => {
            L.marker([object.latitude, object.longitude], {
              icon: specialTourIcon,
            }).addTo(this.map);
          });
          console.log('Dohvaćeni objekti:', objects);
        },
        (error) => {
          console.error('Greška prilikom dohvatanja objekata:', error);
        }
      );
  }

  setRoute(): void {
    const self = this;
    this.tourAuthoringService
      .getTourPointsByTourId(parseInt(this.tourId))
      .subscribe((tourData: any) => {
        const tourPoints = tourData.results;

        const waypoints = tourPoints.map((point: any) =>
          L.latLng(point.latitude, point.longitude)
        );

        const transportMode = this.service.getTransportMode();
        console.log(transportMode);

        this.routeControl = L.Routing.control({
          waypoints: waypoints,
          router: L.routing.mapbox(
            'pk.eyJ1IjoiYW5hYm9za292aWNjMTgiLCJhIjoiY2xvNHZrNjd2MDVpcDJucnM3M281cjE0OSJ9.y7eV9FmLm7kO_2FtrMaJkg',
            { profile: 'mapbox/' + transportMode }
          ),
        }).addTo(this.map);

        this.routeControl.on('routesfound', function (e: { routes: any }) {
          var routes = e.routes;
          var summary = routes[0].summary;

          self.service.setTotalDistance(summary.totalDistance / 1000);
          self.service.setTotalTime(Math.floor(summary.totalTime / 60));
        });
      });
  }

  setPosition() {
    this.administrationService
      .getByUserId(this.tokenStorage.getUserId(), 0, 0)
      .subscribe(
        (result) => {
          L.marker([result.latitude, result.longitude]).addTo(this.map);

          // Handle the result as needed
        },
        (error) => {
          console.error('Error fetching user positions:', error);
          // Handle the error as needed
        }
      );
  }

  setExecuteRoute(): void {
    const self = this;
    this.tourIdexS = this.tourIdEx.toString();
    console.log('this is tourIdex ' + this.tourIdexS);
    if (this.tourIdEx > 0) {
      this.tourAuthoringService
        .getTourPointsByTourId(parseInt(this.tourIdexS))
        .subscribe((tourData: any) => {
          const tourPoints = tourData.results;
          const waypoints = tourPoints.map((point: any) =>
            L.latLng(point.latitude, point.longitude)
          );
          const routeControl = L.Routing.control({
            waypoints: waypoints,
            router: L.routing.mapbox(
              'pk.eyJ1IjoiYW5hYm9za292aWNjMTgiLCJhIjoiY2xvNHZrNjd2MDVpcDJucnM3M281cjE0OSJ9.y7eV9FmLm7kO_2FtrMaJkg',
              { profile: 'mapbox/walking' }
            ),
          }).addTo(this.map);
          routeControl.on('routesfound', function (e) {
            var routes = e.routes;
            var summary = routes[0].summary;
            self.service.setTotalDistance(summary.totalDistance);
            self.service.setTotalTime(
              Math.round((summary.totalTime % 3600) / 60)
            );
            // alert(
            //   'Total distance is ' +
            //     summary.totalDistance / 1000 +
            //     ' km and total time is ' +
            //     Math.round((summary.totalTime % 3600) / 60) +
            //     ' minutes'
            // );
          });
        });
    }
  }
}
