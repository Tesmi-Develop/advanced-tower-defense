import { Controller, OnStart, OnInit } from "@flamework/core";
import { Events } from "client/network";

@Controller({})
export class PlayerController implements OnStart, OnInit {
    onInit() {
        
    }

    onStart() {
        Events.OnRequestSharedClasses.fire();
    }
}