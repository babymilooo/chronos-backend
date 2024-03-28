# Chronos

## Setup
> [!NOTE]
> Follow these steps carefully to ensure a successful setup of the Chronos Backend API.

### Step 0. Check prerequisites
Ensure that you have:
- NodeJS
- npm
- MongoDB account
- api-ninjas account

### Step 1. Clone the Repository

```
git clone https://github.com/babymilooo/chronos-backend.git
```

### Step 2. Navigate to the project

```
cd chronos-backend
```

### Step 3. Install Dependencies

```
npm i
```

### Step 4. Environment Configuration
Create a `.env` file in the root directory. Add the following content to it:
```markdown
PORT=5001
API_URL=http://localhost:5001
CLIENT_URL=http://localhost:3000
DB_URL="YOUR-URL"

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER="YOUR-E-MAIL"
SMTP_APP_PASS="YOUR-GMAIL-3RD-APP-PASSWORD"

PASSWORD_MIN_LENGTH=6
PASSWORD_MAX_LENGTH=32
ACTIVATION_PASSWORD_LENGTH=8

JWT_ACCESS_SECRET="YOUR-SECRET"
JWT_REFRESH_SECRET="YOUR-SECRET"
JWT_ACTIVATION_SECRET="YOUR-SECRET"
JWT_RESET_PASSWORD_SECRET="YOUR-SECRET"

REFRESH_TOKEN_LIFETIME=2592000000

API_KEY="YOUR-API-KEY"

RESET_TOKEN_EXPIRATION_TIME=1
ACTIVATION_PASSWORD_EXPIRATION_TIME=60
INACTIVE_USER_DELETION_DAYS=365

CRON_CHECK_INACTIVE_USERS="0 0 * * *"
```

[!IMPORTANT] Replace the placeholders <YOUR-...> with your actual data.

### Step 5. Start the Server

```
npm run start
```

[!NOTE] There is an option to run a server in developer mode

```
npm run dev
```

The server will be running on http://localhost:5001.

## Chronos API Documentation

## Auth Endpoints

```
/api/auth
```

- POST `/activate`: Activates a user account.
- POST `/get-password-reset-link`: Sends a password reset link to the user's email.
- POST `/login`: Logs in a user.
- POST `/logout`: Logs out a user.
- POST `/password-reset/:link`: Resets a user's password.
- GET `/refresh`: Refreshes a user's authentication token.
- POST `/registration`: Registers a new user.
- POST `/renew-activation-code`: Renews a user's activation code.

## Calendar Endpoints

```
/api
```

- GET `/holidays`: Retrieves a list of holidays.

## Events Endpoints

```
/api/events
```

- GET `/events/event/:id`: Retrieves a specific event by its ID.
- GET `/events`: Retrieves yearly events for a user.
- POST `/events`: Creates a new event.
- PATCH `/events/update/:id`: Updates a specific event by its ID.
- DELETE `/events/delete/:id`: Deletes a specific event by its ID.

## Users Endpoints

```
/api/users
```

- GET `/friends`: Retrieves a list of friends for the authenticated user.
- GET `/potential-friends`: Retrieves a list of potential friends for the authenticated user.
- GET `/:id`: Retrieves a specific user by their ID.
- GET `/`: Retrieves a list of users.
- POST `/add-friend/:id`: Adds a friend for the authenticated user.
- DELETE `/remove-friend/:id`: Removes a friend for the authenticated user.
- GET `/:id/isfriend`: Checks if a user is a friend.
- PUT `/update`: Updates the authenticated user's profile.
- GET `/:id/friends`: Retrieves all friends of a specific user.

```
/api
```

- GET `/user/avatar/:filename`: Retrieves a user's avatar.
