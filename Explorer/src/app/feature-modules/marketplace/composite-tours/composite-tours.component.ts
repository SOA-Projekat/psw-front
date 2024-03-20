import { Component, OnInit } from '@angular/core';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { Tour } from '../../tour-authoring/tour/model/tour.model';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';
import { Equipment } from '../../tour-authoring/tour/model/equipment.model';
import { EquipmentService } from '../../tour-authoring/equipment.servise';
import { TourEquipmentService } from '../../tour-authoring/tour_equipment.service';
import { Observable, forkJoin, map } from 'rxjs';
import { EquipmentTour } from '../../tour-authoring/tour/model/equipmentTour.model';
import { Route, Router } from '@angular/router';
import { MapService } from 'src/app/shared/map/map.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransportType } from '../../tour-authoring/tour/model/tourCharacteristic.model';

interface ExtendedComTour extends Tour {
  equipments?: Equipment[];
}

@Component({
  selector: 'xp-composite-tours',
  templateUrl: './composite-tours.component.html',
  styleUrls: ['./composite-tours.component.css']
})
export class CompositeToursComponent implements OnInit {

  extendedTours: ExtendedComTour[] = [];
  page: number = 1;
  pageSize: number = 5;
  
constructor(
  private tokenStorage: TokenStorage,
  private service: TourAuthoringService,
  private equipmentService: EquipmentService,
  private toureqService: TourEquipmentService,
  private router:  Router,
  private mapService: MapService,){
}

  ngOnInit(): void {
    //this.loadTours();
  }

  // loadTours() {
  //   const userId = this.tokenStorage.getUserId();

  //   this.service.getTourByGuide(userId, this.page, this.pageSize).subscribe({
  //     next: (result: PagedResults<Tour>) => {
  //       this.extendedTours = result.results;
  //       this.extendedTours.forEach(tour => {
  //         this.getEquipments().subscribe((tourEquipments: Equipment[]) => {
  //           tour.equipments = tourEquipments;
  //         });
  //       })
  //     },
  //     error(err: any) {
  //       console.log(err);
  //     },
  //   });
  // }

  viewMap(idTour: number | undefined): void {
    if (idTour !== undefined) {
      this.router.navigate(['/tourMap/${idTour}']); // Use backticks for template literals
    } else {
      console.error('ID nije definisan.');
    }
  }
  

  // getEquipments(): Observable<Equipment[]> {
  //   const observables = this.extendedTours.map(tour => this.toureqService.getEquipmentForTour(tour.id || 0));
  //   const uniqueEquipmentIds: number[] = [];
  
  //   return forkJoin(observables).pipe(
  //     map((results: EquipmentTour[][]) => {
  //       results.forEach(tourEquipmentList => {
  //         tourEquipmentList.forEach(te => {
  //           uniqueEquipmentIds.push(te.equipmentId || 0);
  //         });
  //       });
  
  
  //       var allEquipments: Equipment[] = [];
  //       var tourEquipments: Equipment[] = [];
  
  //       this.equipmentService.getEquipment().subscribe((pagedResults: PagedResults<Equipment>) => {
  //         allEquipments = pagedResults.results;
  //         allEquipments.forEach((equipment) => {
  //           if (uniqueEquipmentIds.includes(equipment.id || 0)) {
  //             tourEquipments.push(equipment);
  //           }
  //         });
  //       });
  
  //       return tourEquipments;
  //     })
  //   );
  // }
}