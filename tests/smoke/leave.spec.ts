import { expect } from 'chai';
import { leaveManagement } from '../pages/leave.page';

describe('Leave Management Functionality', () => {
    beforeEach(() => {
        leaveManagement.open();
    });

    it('should allow user to request leave', () => {
        leaveManagement.requestLeave({
            type: 'Sick Leave',
            startDate: '2026-03-25',
            endDate: '2026-03-26',
            reason: 'Flu',
        });
        expect(leaveManagement.isLeaveRequestSuccessful()).to.be.true;
    });

    it('should display error for invalid leave dates', () => {
        leaveManagement.requestLeave({
            type: 'Vacation',
            startDate: '2026-03-25',
            endDate: '2026-03-24', // Start date is after end date
            reason: 'Trip',
        });
        expect(leaveManagement.getErrorMessage()).to.equal('End date must be after start date.');
    });

    it('should show leave balance correctly', () => {
        const balance = leaveManagement.getLeaveBalance();
        expect(balance).to.equal(10); // Assuming the user has 10 leave days available
    });
});