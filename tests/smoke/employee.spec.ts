describe('Employee Management Tests', () => {
    it('should view the employee list', () => {
        // Navigate to employee management page
        cy.visit('/employee-management');
        // Verify the employee list is displayed
        cy.get('.employee-list').should('be.visible');
    });

    it('should add a new employee', () => {
        // Click on add employee button
        cy.get('.add-employee-button').click();
        // Fill the employee form
        cy.get('#employee-name').type('John Doe');
        cy.get('#employee-job-title').type('Software Engineer');
        // Submit the form
        cy.get('.submit-button').click();
        // Verify the new employee is added to the list
        cy.get('.employee-list').should('contain', 'John Doe');
    });
});