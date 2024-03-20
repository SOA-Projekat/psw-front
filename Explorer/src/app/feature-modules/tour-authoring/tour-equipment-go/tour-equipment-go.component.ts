import { Component, OnInit } from '@angular/core';
import { Equipment } from '../tour/model/equipment.model';
import { EquipmentService } from '../equipment.servise';
import { TourAuthoringService } from '../tour-authoring.service';


@Component({
  selector: 'tour-equipment-go',
  templateUrl: './tour-equipment-go.component.html',
  styleUrls: ['./tour-equipment-go.component.css']
})
export class TourEquipmentGoComponent implements OnInit {
  equipment: Equipment = { id: 0, name: '', description: '', tourID: 0 }; // Initialize with default values
  isUpdateMode: boolean = false;
  constructor(private equipmentService: TourAuthoringService) { }

  ngOnInit(): void {
    
    
  }

  submitForm(): void {
    if (this.isUpdateMode) {
      // If it's update mode, call updateEquipment() method in the service
      this.equipmentService.updateEquipmentGo(this.equipment).subscribe(
        (response) => {
          console.log('Equipment updated:', response);
          // Optionally, you can handle the response here
        },
        (error) => {
          console.error('Failed to update equipment:', error);
          // Optionally, you can handle the error here
        }
      );
    } else {
      // If it's add mode, call addEquipment() method in the service
      this.equipmentService.addEquipmentGo(this.equipment).subscribe(
        (response) => {
          console.log('Equipment added:', response);
          // Optionally, you can handle the response here
        },
        (error) => {
          console.error('Failed to add equipment:', error);
          // Optionally, you can handle the error here
        }
      );
    }
  }
  toggleUpdateMode(): void {
    this.isUpdateMode = !this.isUpdateMode;
  }
}
