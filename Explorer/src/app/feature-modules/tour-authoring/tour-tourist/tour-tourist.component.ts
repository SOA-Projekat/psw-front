import { Component, OnInit } from '@angular/core';
import { Tour, TourGo } from '../tour/model/tour.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { TourAuthoringService } from '../tour-authoring.service';
import { Router } from '@angular/router';
import { PublicTourPoint } from '../model/publicTourPoint.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ChangeDetectorRef } from '@angular/core';

import { MarketplaceService } from '../../marketplace/marketplace.service';

import { TourPoint } from '../model/tourPoints.model';
import { MapService } from 'src/app/shared/map/map.service';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'xp-tour-tourist',
  templateUrl: './tour-tourist.component.html',
  styleUrls: ['./tour-tourist.component.css'],
})
export class TourTouristComponent implements OnInit {
  publicTourPoints: PublicTourPoint[] = [];
  tours: Tour[] = [];
  selectedTour: TourGo;
  temporaryTourPoints: PublicTourPoint[] = [];
  shouldRenderTourForm: boolean = false;
  page: number = 1;
  pageSize: number = 10;
  showTourForm: boolean = false;
  showMap: boolean = false;
  selectedPublicTP: PublicTourPoint;
  lastTourId: number;
  transportType: any;
  totalDistance: number;
  totalTime: number;

  constructor(
    private tokenStorage: TokenStorage,
    private service: TourAuthoringService,
    private mapService: MapService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private serviceMP: MarketplaceService
  ) {}

  ngOnInit(): void {
    this.loadPublicTourPoints();
  }

  loadPublicTourPoints() {
    this.service
      .getPublicPoints(this.page, this.pageSize)
      .subscribe((pagedResults: PagedResults<PublicTourPoint>) => {
        this.publicTourPoints = pagedResults.results;
        console.log(this.publicTourPoints);
      });
  }
  addTour() {
    this.showTourForm = true;
    this.shouldRenderTourForm = false;
  }

  AddTourPointToTour(tourPoint: TourPoint) {
    this.service.addTourPoint(tourPoint).subscribe({
      next: () => {
        console.log(tourPoint);
      },
    });
  }

  onAddPublicTourPoint() {
    this.service
      .findLastTourId(this.page, this.pageSize)
      .subscribe((lastId: number) => {
        this.lastTourId = lastId;
        console.log('lastTourId:', this.lastTourId);

        for (let i = 0; i < this.temporaryTourPoints.length; i++) {
          this.temporaryTourPoints[i].idTour = this.lastTourId;
        }

        // console.log(this.temporaryTourPoints);

        this.temporaryTourPoints.forEach((ptp) => {
          const tourPoint: TourPoint = {
            tourId: ptp.idTour || 0,
            name: ptp.name,
            description: ptp.description,
            imageUrl: ptp.imageUrl,
            latitude: ptp.latitude,
            longitude: ptp.longitude,
            
          };

          this.AddTourPointToTour(tourPoint);
        });
      });
  }

  onAddPublicTP(publictp: PublicTourPoint) {
    this.selectedPublicTP = publictp;
    this.temporaryTourPoints.push(this.selectedPublicTP);
    this.publicTourPoints = this.publicTourPoints.filter(
      (ptp) => ptp !== this.selectedPublicTP
    );
  }
  findTours() {
    console.log('Temporary Tour Points:', this.temporaryTourPoints);
    this.service
      .findTours(this.temporaryTourPoints, this.page, this.pageSize)
      .subscribe((pagedResults: PagedResults<Tour>) => {
        this.tours = pagedResults.results;
        console.log(this.tours);
      });
  }

  showTourDetails(tourId: number | undefined): void {
    this.router.navigate(['marketplace', tourId]);
  }

  viewMap(idTour: number | undefined): void {
    if (idTour !== undefined) {
      this.serviceMP.viewForTourist.emit();
      this.router.navigate(['/tourMapFirstPoint/${idTour}']);
    } else {
      console.error('ID nije definisan.');
    }
  }

  previewTour() {
    this.showTourForm = false;
    this.showMap = true;
    this.service.changeTourId(this.lastTourId.toString());
  }

  onTransportChange(event: any) {
    this.transportType = event.target.value;

    this.mapService.setTransportMode(this.transportType);

    this.service.emitTransportTypeChanged();
  }

  getTourCharacteristic(): void {
    this.mapService.totalDistance$.subscribe((distance) => {
      this.totalDistance = distance;
    });

    this.mapService.totalTime$.subscribe((time) => {
      this.totalTime = time;
    });

    var tourCharacteristic = {
      distance: +this.totalDistance.toFixed(2),
      duration: this.totalTime,
      transportType: this.transportType,
    };

    this.service
      .setTourCharacteristics(this.lastTourId, tourCharacteristic)
      .subscribe({
        next: () => {
          this.showMap = false;
          alert('Successfully set tour characteristics');
        },
        error(err: any) {
          console.log(tourCharacteristic);
          console.log(err);
        },
      });
  }
}
