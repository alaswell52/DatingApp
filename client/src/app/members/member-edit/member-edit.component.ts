import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { Member } from 'src/app/_models/member';
import { User } from 'src/app/_models/user';
import { AccountService } from 'src/app/_services/account.service';
import { MembersService } from 'src/app/_services/members.service';


@Component({
  selector: 'app-member-edit',
  templateUrl: './member-edit.component.html',
  styleUrls: ['./member-edit.component.css']
})

export class MemberEditComponent implements OnInit{
  // Listen for the event of the user changing the browser and notify the user of unsaved changes, just like prevent-unsaved-changes-guard.ts is doing
  @HostListener('window:beforeunload', ['$event']) unloadNotification($event : any) {
    if(this.editForm?.dirty) {
      $event.returnValue = true; 
    }
  };
  @ViewChild('editForm') editForm: NgForm | undefined; // provides access to elements inside the component template
  member: Member | undefined;
  user: User | null = null;
  
  constructor(private memberService: MembersService, 
    private accountService: AccountService,
    private toastr: ToastrService) {
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next: user => this.user = user

      });
    }
  
  ngOnInit(): void {
    this.loadMember();  
  }

  loadMember() {

    if(!this.user) return;

    this.memberService.getMember(this.user.userName).subscribe({
      next: member => {
        this.member = member
      }
    })
  }

  updateMember() {
    // console.log(this.member);
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next: _ => {
        this.toastr.success('Profile updated succesfully');
        this.editForm?.reset(this.member);
      }
    });
  }

}