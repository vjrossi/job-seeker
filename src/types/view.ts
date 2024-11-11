import { ApplicationStatus } from '../constants/ApplicationStatus';

export type ViewType = 'dashboard' | 'view' | 'reports' | 'instructions' | 'settings';
export type LayoutType = 'standard' | 'experimental';

export interface ToastMessage {
    show: boolean;
    message: string;
    type: 'success' | 'error';
}

export interface FilterState {
    showArchived: boolean;
    statusFilters: ApplicationStatus[];
    searchTerm: string;
} 