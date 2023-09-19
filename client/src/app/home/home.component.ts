import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from '../_models/user';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  registerMode = false;
  // users: list<User>;
  users: any;


  constructor(private http: HttpClient, private memberService: MembersService) {}

  ngOnInit(): void {
    this.memberService.getMembers();
    //this.getUsers();
  }

  getUsers()
  { 

    this.http.get('https://localhost:5001/api/users')
    .subscribe({
        next: response => this.users = response,
        error: error => console.log(error),   
        complete: () => 
        {
          console.log("Completed");
          
          // this.users.forEach((element: any) => {
          //   console.log(element);
          // });
        } 
      }) // returns an observable, stream of data

  }

  registerToggle() {
    this.registerMode = !this.registerMode;
  }

  cancelRegisterMode(event: boolean) {
    this.registerMode = event;
  }

}
