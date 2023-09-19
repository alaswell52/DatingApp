import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Observable, of } from 'rxjs';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  model: any = {};
  
  // currentUser$: Observable<User | null> = of(null); // initialize observable of null

  title: string = 'Dating App';

  constructor(public accountService: AccountService, 
              private router: Router,
              private toastr: ToastrService) { }

  ngOnInit(): void {
    // this.currentUser$ = this.accountService.currentUser$;    
    // html knows if logged in via the *ngIf="currentUser$ | async" ie async pipe
  }

  login() {
    this.accountService.login(this.model).subscribe({
      next: response => 
      {
        this.router.navigateByUrl('/members')
        // console.log(response);
        // this.model = response
      },
      error: error => {
        // error handling is now handled in the interceptor which was added to th app.module.ts providers as middleware
        // console.log(error);
        // this.toastr.error(error.error)
      }, 
      complete: () => console.log("Completed") 
    })


  }

  // *ngIf="loggedIn" in the <ul class="navbar-nav me-auto mb-2 mb-md-0" *ngIf="loggedIn">
  // removes from the DOM if false
  
  // dropdown imported from ng add ngx-bootstrap  --component dropdowns
  // this directive adds the dropdown functionality

  logout() {
    this.router.navigateByUrl('/') // go to home page
    this.accountService.logout();
  }


}

// <form #loginForm="ngForm" -> turns form element into a ngForm by giving it a #loginForm="ngForm" variable
// (ngSubmit)="login()" , [(ngModel)]="model.username -> allows for the two way binding


