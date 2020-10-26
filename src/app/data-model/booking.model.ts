export class BookingList {
    id?: string;
    amount: number;
    course: string;
    description: string;
    month: string;
    eventDate: any;
    year: string

    constructor() {
        this.course = "";
    }
}