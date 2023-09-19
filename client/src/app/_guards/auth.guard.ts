import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { map } from 'rxjs';



export const authGuard: CanActivateFn = (route, state) => {
  // No constructor is provided for non Classes so Angular provides an alternaticve approach
  const accountService = inject(AccountService); 
  const toastr = inject(ToastrService);

  return accountService.currentUser$.pipe(
    
    map(user => {
      if (user) return true;
      else {
        toastr.error("YOU SHALL NOT PASS!");
        return false;
      }

    })
  )
};


