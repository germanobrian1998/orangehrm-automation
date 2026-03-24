import { BasePage } from './BasePage';

export class LeavePage extends BasePage {
  async navigateToDashboard() {
    await this.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/viewLeaveModule');
    await this.waitForNavigation();
  }

  async verifyLeavePageLoaded() {
    await this.verifyURL(/.*leave.*/);
  }

  async navigateToLeaveList() {
    await this.goto('https://opensource-demo.orangehrmlive.com/web/index.php/leave/leaveList');
    await this.waitForNavigation();
  }
}
