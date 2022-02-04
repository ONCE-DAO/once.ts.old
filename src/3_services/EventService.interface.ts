import Thing from "./Thing.interface";

export default interface EventService extends Thing<EventService> {
    addEventListener(): void;
    getEvents(): Event[];
    fire(eventName: string, eventSource: any): any[];
}

export interface Event {
    fire(): any[]
}