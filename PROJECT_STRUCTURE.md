# OrangeHRM Automation Project

This project structure is designed for an automation testing framework using OrangeHRM.

## Directory Structure

- `src/`
    - `pageobjects/`
        - `loginPage.js`
        - `dashboardPage.js`
    - `apiHelpers/`
        - `apiHelper.js`
    - `utils/`
        - `logger.js`
        - `config.js`
    - `types/`
        - `userTypes.js`
- `tests/`
    - `login.test.js`
    - `dashboard.test.js`

## Page Objects

### loginPage.js

```javascript
class LoginPage {
    enterUsername(username) {
        // code to enter username
    }
    enterPassword(password) {
        // code to enter password
    }
    submit() {
        // code to submit login form
    }
}
module.exports = new LoginPage();
```

### dashboardPage.js

```javascript
class DashboardPage {
    navigateToProfile() {
        // code to navigate to profile
    }
    logOut() {
        // code to log out
    }
}
module.exports = new DashboardPage();
```

## API Helpers

### apiHelper.js

```javascript
const axios = require('axios');
class ApiHelper {
    async getUser(id) {
        // code to get user by id
    }
}
module.exports = new ApiHelper();
```

## Utilities

### logger.js

```javascript
class Logger {
    log(message) {
        console.log(message);
    }
}
module.exports = new Logger();
```

### config.js

```javascript
const config = {
    baseUrl: 'https://example.com',
};
module.exports = config;
```

## Types

### userTypes.js

```javascript
const UserTypes = {
    ADMIN: 'admin',
    USER: 'user',
};
module.exports = UserTypes;
```

## Tests

### login.test.js

```javascript
const LoginPage = require('../src/pageobjects/loginPage');
const assert = require('assert');

describe('Login Tests', function() {
    it('should login successfully', function() {
        // Test code here
    });
});
```

### dashboard.test.js

```javascript
const DashboardPage = require('../src/pageobjects/dashboardPage');
const assert = require('assert');

describe('Dashboard Tests', function() {
    it('should navigate to profile', function() {
        // Test code here
    });
});
```
