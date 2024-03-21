import { ChangeDetectorRef, Component } from '@angular/core';
import { Observable } from 'rxjs';
import { TourGo } from '../../tour-authoring/tour/model/tour.model';
import { AdministrationService } from '../administration.service';
import { ActivatedRoute } from '@angular/router';
import { TourAuthoringService } from '../../tour-authoring/tour-authoring.service';

@Component({
  selector: 'xp-tour-go-overview',
  templateUrl: './tour-go-overview.component.html',
  styleUrls: ['./tour-go-overview.component.css']
})
export class TourGoOverviewComponent {
  tour$: Observable<TourGo>;
  tourId: number;
  tour: TourGo// Declare the tour property here

  constructor(private route: ActivatedRoute,private service: AdministrationService, private authoringService:TourAuthoringService,private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam !== null) {
        this.tourId = +idParam;
        this.fetchTour(this.tourId);
    } else {
        // Handle the case where the 'id' parameter is not found in the route
        console.error('Tour ID not found in route parameters.');
    }
}


// fetchTour(tourId: number): void {
//   // Clear any previous tour data
//   this.tour = null;

//   // Make the HTTP request to fetch the single tour
//   this.service.getSingleTourGo(tourId).subscribe({
//     next: (tour: TourGo) => {
//       // Log the fetched tour data
//       console.log('Fetched tour:', tour);

//       // Assign the fetched tour to the tour property
//       this.tour = tour;

//       // Additional operations with the fetched tour object can be performed here

//       // Alert to check the fetched tour object
//       alert('Fetched tour: ' + JSON.stringify(tour));
//     },
//     error: (error: any) => {
//       // Log the error message
//       console.error('Error fetching tour:', error);

//       // Alert to check the error message
//       alert('Error fetching tour: ' + JSON.stringify(error));
//     }
//   });
// }
fetchTour(tourId: number): void {
  // Clear any previous tour data
  

  // Make the HTTP request to fetch the single tour
  this.service.getSingleTourGo(tourId).subscribe({
    next: (tour: TourGo) => {
      // Log the fetched tour data
      console.log('Fetched tour:', tour);

      // Assign the fetched tour to the tour property
      this.tour = tour;

      // Additional operations with the fetched tour object can be performed here

      // Alert to check the fetched tour object
      
    },
    error: (error: any) => {
      // Log the error message
      console.error('Error fetching tour:', error);

      // Alert to check the error message
      alert('Error fetching tour: ' + JSON.stringify(error));
    }
  });
}

deleteEquipment(id: number): void {
  alert('Deleting equipment with ID: ' + id); // Alert the ID
  this.authoringService.deleteEquipment(id).subscribe({
    next: () => {
      alert('Equipment deleted successfully');
      // Assuming you want to update the tour after deleting the equipment
      this.fetchTour(this.tourId);
    },
    error: (error: any) => {
      alert('Error deleting equipment: ' + JSON.stringify(error));
      console.error('Error deleting equipment:', error); // Log the error
    }
  });
}


deleteTourPointGo(id: number): void {
  this.authoringService.deleteTourPointGo(id).subscribe({
    next: () => {
      console.log('TourPoint deleted successfully');
      // Remove the deleted tour point from the tour points array
      this.tour.tourPoints = this.tour.tourPoints.filter(point => point.id !== id);
      // Trigger change detection
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error('Error deleting tour point:', error);
      alert('Error deleting tour point: ' + JSON.stringify(error));
    }
  });
}
}
