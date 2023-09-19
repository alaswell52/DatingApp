import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  title: string = 'Dating App';


  constructor(private http: HttpClient, private accountService: AccountService) { }

  ngOnInit(): void {
    // add initialization code here
    // this.getUsers();
    this.setCurrentUser();
  }
  


  // ! turns off typescript strict mode for a line of code hence JSON.parse(localStorage.getItem('user')!
  setCurrentUser() {
    // const user: User = JSON.parse(localStorage.getItem('user')!);
    const userString = localStorage.getItem('user');
    if(!userString) return;
    const user: User = JSON.parse(userString);
    this.accountService.setCurrentUser(user);
  }

}
