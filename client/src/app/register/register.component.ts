import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
  // model: any = {}
  registerForm: FormGroup = new FormGroup({});
  maxDate: Date = new Date();
  validationErrors: string[] | undefined;

  constructor(private accountService: AccountService, 
    private toastr: ToastrService,
    private fb: FormBuilder,
    private router: Router) {}

  ngOnInit(): void {
    this.initializeForm();
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 18) // select only up to a maximum date of 18 years ago
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      gender: ['male' ], // provide initial parameter for input, and input2 as validator
      username: ['', Validators.required],
      knownAs: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(8)]],
      confirmPassword: ['', [Validators.required, this.matchValues('password')]] // Customer validator 
    })
    // observes updates as the user updates password input or confirmPassword form inputs
    this.registerForm.controls['password'].valueChanges.subscribe({
      next: () => {
        this.registerForm.controls['confirmPassword'].updateValueAndValidity();
      }
    }) 

  }

  matchValues(matchTo: string): ValidatorFn {
    return (control: AbstractControl) => {
      return control.value === control.parent?.get(matchTo)?.value ? null : {notMatching: true};
    }
  }

  register() {
    // console.log(this.model);
    const dob = this.getDateOnly(this.registerForm.controls['dateOfBirth'].value);
    const values = {...this.registerForm.value, dateOfBirth: dob};
    this.accountService.register(values).subscribe({
      next: () => {
        // console.log(response);
        //this.cancel();
        this.router.navigateByUrl('/members')
      },
      error: error => 
      {
        this.validationErrors = error; // based on the validation interceptor, this will be an array of errors
        //this.toastr.error(error.error);
        console.log(error)
      }
    })

    //console.log(this.registerForm?.value);



  }
  

  cancel() {
    this.cancelRegsiter.emit(false);
    console.log('canceled'); 
  }

  private getDateOnly(dob: string | undefined) {
    if(!dob) return;
    let theDob = new Date(dob);
    // get just the date portion of the date obejct, date object includes date and time
    return new Date(theDob.setMinutes(theDob.getMinutes()-theDob.getTimezoneOffset())).toISOString().slice(0,10); 
  }

}
