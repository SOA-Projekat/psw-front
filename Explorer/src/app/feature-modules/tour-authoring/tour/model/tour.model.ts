import { TourReview } from 'src/app/feature-modules/marketplace/model/tourReview.model';
import { TourPoint } from '../../model/tourPoints.model';
import { TourCharacteristic } from './tourCharacteristic.model';
import { Equipment } from './equipment.model';

export interface Tour {
  id?: number;

  name: string;
  description: string;
  price: number;
  status: Status;
  difficultyLevel: DifficultyLevel;

  UserId: number;
  tags: string[];
  tourPoints: TourPoint[];
  tourCharacteristics: TourCharacteristic[];
  tourReviews: TourReview[];
}

export interface TourGo {
  id?: number;

  name: string;
  description: string;
  price: number;
  status: number;
  difficultyLevel: number;

  userId: number;
 
  tourPoints: TourPoint[];
  
  equipments: Equipment[];
}


export enum Status {
  Draft = 'Draft',

  Archived = 'Archived',
  Published = 'Published',
}

export enum DifficultyLevel {
  Easy = 'Easy',
  Medium = 'Moderate',
  Hard = 'Difficult',
}