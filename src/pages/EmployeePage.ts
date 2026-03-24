import { BasePage } from './BasePage';

export class EmployeePage extends BasePage {
  private employeeTable = '.oxd-table';

  async navigateToEmployeeList() {
    await this.goto('https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList');
    await this.waitForNavigation();
  }

  async verifyEmployeeTableVisible() {
    await this.waitForElement(this.employeeTable);
    return await this.isElementVisible(this.employeeTable);
  }

  async getEmployeeCount() {
    const rows = await this.page.locator('.oxd-table tbody tr').count();
    return rows;
  }

  async verifyPageTitle() {
    const title = await this.getPageTitle();
    return title.includes('Employee');
  }
}
