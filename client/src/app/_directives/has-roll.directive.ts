import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';
import { take } from 'rxjs';

@Directive({
  selector: '[appHasRoll]' // *appHasRole='["Admin", "etc"]'
})
export class HasRollDirective implements OnInit{

  @Input() appHasRoll: string[] = [];
  user: User = {} as User;

  constructor(
    private viewContainerRef: ViewContainerRef, 
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
    ) { 
      this.accountService.currentUser$.pipe(take(1)).subscribe({
        next: user => {
          if(user) this.user = user;
        }
      })

    }

  ngOnInit(): void {

    if(this.user.roles.some(r => this.appHasRoll.includes(r))) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

}
