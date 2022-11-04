import { Component, ElementRef, ViewChild } from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { FormControl, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[DatePipe]
})
export class AppComponent {
  constructor(
    public datepipe: DatePipe
  ){}

  @ViewChild('messagecontainer') messagecontainer: ElementRef;
  title = 'chat-front';
  isConnected:boolean = false;
  webSocketEndPoint: string = 'https://mynestonline.com/collection/ws';
  stompClient: any;
  senderId:FormControl;
  recieverId:FormControl;
  message:FormControl;
  messages:any[] = [];
  ngOnInit():void{
    this.senderId = new FormControl("",Validators.required);
    this.recieverId = new FormControl("",Validators.required);
    this.message = new FormControl("",Validators.required);    
  }
  connectToWebSocket(){
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    // this.stompClient.debug = () => {};
    let that = this;
    this.stompClient.connect({},function(frame:any) {
      console.log("error*****************");
      console.log(frame);
      that.isConnected = true;
      that.stompClient.subscribe(
       "/user/" + that.senderId.value + "/queue/messages",function(message:any)
       {
         that.messages.push(JSON.parse(message["body"]));
        //  that.messagecontainer.nativeElement.scrollTop  = that.messagecontainer.nativeElement.scrollHeight;
       }
     );   
    }, this.errorCallBack);
  }
  
  
  errorCallBack(error:any) {
    console.log("errorCallBack -> " + error)
    setTimeout(() => {
        this.connectToWebSocket();
    }, 5000);
  }
  sendMessage(){
    let message = {
      customerId: Number(this.recieverId.value),
      vendorId: Number(this.senderId.value),
      senderId: this.senderId.value,
      recipientId: this.recieverId.value,
      content: this.message.value,
      messageType:"TEXT"
    };   
    console.log(message) 
    this.messages.push(message);
    this.stompClient.send("/app/chat", {}, JSON.stringify(message));
    // this.messagecontainer.nativeElement.scrollTop  = this.messagecontainer.nativeElement.scrollHeight;
    this.message.setValue("");
  }
  ngOnDestroy():void{
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log("Disconnected");
  }
}
