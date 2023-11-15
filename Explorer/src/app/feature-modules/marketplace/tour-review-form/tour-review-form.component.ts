import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TourReview } from '../model/tourReview.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { User } from 'src/app/infrastructure/auth/model/user.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { MarketplaceService } from '../marketplace.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'xp-tour-review-form',
  templateUrl: './tour-review-form.component.html',
  styleUrls: ['./tour-review-form.component.css']
})

export class TourReviewFormComponent implements OnInit{

  id: number;
  @Input()reviewForUpdate : TourReview;
  @Output() addedObject = new EventEmitter<null>();
  url: string;
  inputForm= new FormGroup({
    grade: new FormControl('',[Validators.required]),
    comment: new FormControl('',[Validators.required]),
    images: new FormControl('',[Validators.required])
  })
  img: string;
  tourReview: TourReview={
    id: 0,
    grade: 0,
    comment:'',
    attendanceDate: new Date(),
    reviewDate: new Date(),
    images: [''],
    touristId: 10,
    tourId: 0,
  
  }
  
  loggedInUser: User={
    id:0,
    username:'',
    role: ''
  }
/*
  ngOnChanges(changes: SimpleChanges){
    console.log("Primlljeni objekat", this.reviewForUpdate.id);
    this.id=this.reviewForUpdate.id;
    this.inputForm.patchValue({
      grade: this.reviewForUpdate.grade.toString(),
      comment: this.reviewForUpdate.comment,
    });

    console.log(this.inputForm.value.comment);
  }*/
  constructor(private authService: AuthService, private tourReviewService: MarketplaceService, private activatedRoute: ActivatedRoute, private router: Router){
   this.getLoggedInUser();
 
  }
  ngOnInit(): void {
   
    this.activatedRoute.params.subscribe(params => {
      this.tourReview.tourId = params['id'];
      });
  }
  onSubmit(){
   this.populateTourReview();
   console.log("Recenzija",this.tourReview);

   this.tourReviewService.createReview(this.tourReview).subscribe({
    next: (response)=>{
      console.log(response);
      this.addedObject.emit();
      this.inputForm.reset();
      this.router.navigate(['/tourReviewShow']);
    },
    error: (error)=>{
      console.log(error);
    }
  })
  

  }
    
  getLoggedInUser(){
    this.authService.user$.subscribe(user=>{
      if(user){
        this.loggedInUser.id=user.id;
        this.loggedInUser.username=user.username;
        this.loggedInUser.role=user.role
        console.log("Ulogovani korisnik", this.loggedInUser);
      }
    })
  }

  populateTourReview(){
    this.tourReview.grade= parseFloat(this.inputForm.value.grade || '0');
    this.tourReview.comment= this.inputForm.value.comment as string;
    this.tourReview.reviewDate = new Date();
    this.tourReview.touristId= this.loggedInUser.id;
    this.tourReview.images= this.inputForm.value.images ? this.inputForm.value.images.split(',') : [];
  }

  onEdit(){
    this.reviewForUpdate.id=this.id;
    console.log("Id na kraju", this.reviewForUpdate.id);
    this.reviewForUpdate.grade=parseFloat(this.inputForm.value.grade || '0');
    this.reviewForUpdate.comment= this.inputForm.value.comment as string;
    console.log("Editovani objekat", this.reviewForUpdate);
    this.update(this.reviewForUpdate);
    
  }

  update(review: TourReview){
    this.tourReviewService.updateReview(review).subscribe({
      next: (response)=>{
        console.log(response);
      },
      error: (error)=>{
        console.log(error);
      }
    })
  }
 }