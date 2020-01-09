import { SchoolList } from './school.model';

export class BookingList {
    key: string;
    year: string;
    month: string;
    day: string;
    yearMonth: string;
    amount: string;
    school: SchoolList[];
}