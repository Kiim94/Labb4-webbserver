# Laboration 4
## Om uppgiften

Detta är del 1 av 2: backend delen. 

Uppgiften har gått ut på att skapa funktionalitet för autentisering och registrering av användarkonton. Det ska också gå att med dessa logga in.

JWTs ska användas för sessionshantering så ingen obehörig kommer åt datan.

### Databasen

MongoDB samt mongoose har använts för att skapa databasen.

### API Endpoints (CRUD)
**Bas-url:**
https://labb4-webbserver.onrender.com/

#### Autentisering
- Registrera användare: POST /api/auth/register
- Logga in användare: POST /api/auth/login

#### Skyddade routes - kräver JWT-token
- Hämta användaruppgifter: GET /api/auth/profile
- Radera användare: DELETE /api/auth/user
