import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit{
  //
  // to receive this information from the parent component home.component.ts you'll need to include
  // in the home.component.html in the <app-register></app-register> -> <app-register> [usersFromHomeComponent]="users" </app-register>
  @Input() usersFromHomeComponent: any;
  // from child component register.component.ts to home.component.ts
  @Output() cancelRegsiter = new EventEmitter();
  model: any = {}

  constructor(private accountService: AccountService, private toastr: ToastrService) {}

  ngOnInit(): void {

    this.usersFromHomeComponent.forEach((element: any) => {
      console.log(element);
    });

  }

  register() {
    console.log(this.model);
    this.accountService.register(this.model).subscribe({
      next: () => {
        // console.log(response);
        this.cancel();
      },
      error: error => 
      {
        this.toastr.error(error.error);
        console.log(error)
      }
    })    

  }
  

  cancel() {
    this.cancelRegsiter.emit(false);
    console.log('canceled'); 
  }

}
