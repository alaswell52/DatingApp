import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TabDirective, TabsModule, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TimeagoModule } from 'ngx-timeago';
import { Member } from 'src/app/_models/member';
import { MembersService } from 'src/app/_services/members.service';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { MessageService } from 'src/app/_services/message.service';
import { Message } from 'src/app/_models/message';

@Component({
  selector: 'app-member-detail',
  // adding a stand alone component outside of ng
  standalone: true,
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css'],
  // you need the imports module to get NG functionality such as ngIf or ngFor
  imports: [CommonModule, TabsModule, GalleryModule, TimeagoModule, MemberMessagesComponent]
})

export class MemberDetailComponent implements OnInit{
  // @ViewChild allows the access of #memberTabs inside the child component member-message.component.html
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent;
  member: Member = {} as Member;
  images: GalleryItem[] = [];
  activeTab?: TabDirective;
  messages: Message[] = [];
   
  constructor(private memberService: MembersService,
    private route: ActivatedRoute,
    private messageService: MessageService) { }

  ngOnInit(): void {
    this.route.data.subscribe({
      next: data => {
        this.member = data['member']
      }
    })
    this.getImages();
    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab'])
      }
    })
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if(this.activeTab.heading === 'Messages') {
      this.loadMessages();
    }
  }

  loadMessages() {
    
    if(this.member) {
      this.messageService.getMessageThread(this.member?.userName).subscribe({
        next: messages => {this.messages = messages }
      })
    }
  }

  loadMember() {
    var username = this.route.snapshot.paramMap.get('username');
    if(!username) return;

    this.memberService.getMember(username).subscribe({
      next: member => {
        this.member = member,
        this.getImages()
      }
    })
  }

  selectTab(heading: string) {
    if(this.memberTabs) {
      this.memberTabs.tabs.find(x=> x.heading === heading)!.active = true;
    }
  }

  getImages() {
    if(!this.member) return;
    for(const photo of this.member?.photos) {

      this.images.push(new ImageItem({src: photo.url, thumb: photo.url}));

    }    
  }
}
