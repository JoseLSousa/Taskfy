export interface Task {
    id: string;
    title: string;
    description: string;
    priority: string;
    startDate: string | Date
    endDate: Date;
    isFullDay: boolean;
}