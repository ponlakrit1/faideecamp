export class BookingList {
    id?: string;
    amount: number;
    course: string;
    description: string;
    month: string;
    eventDate: any;
    year: string

    eventText: any;
    
    constructor() {
        this.course = "";
    }
}