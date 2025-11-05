# 🏥 MedTrack - Healthcare Management System

<div align="center">

![MedTrack Logo](https://img.shields.io/badge/MedTrack-Healthcare-blue?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.5-green?style=for-the-badge&logo=springboot)
![Angular](https://img.shields.io/badge/Angular-18-red?style=for-the-badge&logo=angular)
![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)

A comprehensive healthcare management platform connecting patients, doctors, and administrators with modern features for appointment scheduling, medical record management, and real-time communication.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [User Roles](#-user-roles)
- [Database Schema](#-database-schema)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**MedTrack** is a full-stack healthcare management system designed to streamline interactions between patients, doctors, and healthcare administrators. The platform provides a comprehensive suite of tools for managing appointments, medications, medical reports, and real-time communications.

### Why MedTrack?

- ✅ **Simplified Appointment Scheduling** - Easy-to-use booking system with availability management
- 📱 **Real-time Communication** - Built-in chat for patient-doctor interactions
- 📊 **Analytics & Insights** - Comprehensive dashboards for all user types
- 🔒 **Secure & Compliant** - JWT-based authentication with role-based access control
- 📄 **Document Management** - Medical report uploads with PDF generation
- 💊 **Medication Tracking** - Comprehensive medication schedules and reminders

---

## ✨ Features

### 👤 For Patients

- 🏥 **Find & Book Doctors** - Search doctors by specialty and location
- 📅 **Appointment Management** - Schedule, view, and cancel appointments
- 💊 **Medication Tracker** - Manage medication schedules and dosages
- 📄 **Medical Reports** - Upload and view medical reports
- ⭐ **Doctor Ratings** - Rate and review doctors
- 💬 **Live Chat** - Communicate directly with doctors
- 📊 **Health Statistics** - Track personal health metrics
- 🔔 **Notifications** - Receive appointment and medication reminders

### 👨‍⚕️ For Doctors

- 📆 **Availability Management** - Set and manage available time slots
- 👥 **Patient Management** - View patient appointments and history
- 📋 **Medical Reports** - Review patient reports and add notes
- 💬 **Patient Communication** - Chat with patients
- 📊 **Statistics Dashboard** - Track appointments, ratings, and performance
- ⏰ **Schedule Overview** - Calendar view of all appointments
- 🔔 **Real-time Notifications** - Get notified of new appointments

### 👨‍💼 For Administrators

- 👥 **User Management** - Manage patients, doctors, and admins
- 📊 **System Analytics** - View platform-wide statistics
- 📈 **Reporting** - Generate reports on system usage
- 🔒 **Access Control** - Manage user permissions and roles

---

## 🛠 Tech Stack

### Backend
- **Framework**: Spring Boot 3.4.5
- **Language**: Java 21
- **Security**: Spring Security + JWT Authentication
- **Database**: MySQL 8.0
- **ORM**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **Email**: JavaMail with SMTP
- **Validation**: Bean Validation API
- **Utilities**: Lombok

### Frontend
- **Framework**: Angular 18
- **Language**: TypeScript 5.5
- **UI Components**: Angular Material
- **Charts**: Chart.js with date-fns adapter
- **Maps**: Leaflet
- **Animations**: GSAP, AOS
- **Particles**: Particles.js
- **3D Graphics**: Three.js
- **PDF Generation**: jsPDF
- **State Management**: RxJS
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router
- **Forms**: Angular Reactive Forms

### Development Tools
- **Version Control**: Git
- **IDE**: VS Code / IntelliJ IDEA
- **API Testing**: Postman
- **Package Managers**: Maven, npm

---

## 🏗 Architecture

```
MedTrack/
├── Backend/                    # Spring Boot Backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/medtrack/backend/
│   │   │   │       ├── config/           # Security & App Configuration
│   │   │   │       ├── controller/       # REST Controllers
│   │   │   │       ├── entity/           # JPA Entities
│   │   │   │       ├── repository/       # Data Access Layer
│   │   │   │       ├── service/          # Business Logic
│   │   │   │       ├── security/         # JWT & Auth
│   │   │   │       └── exception/        # Exception Handlers
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── uploads/                # File uploads (gitignored)
│   └── pom.xml
│
└── Frontend/                   # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── patient/          # Patient Components
    │   │   │   ├── doctor/           # Doctor Components
    │   │   │   ├── admin/            # Admin Components
    │   │   │   └── common/           # Shared Components
    │   │   ├── services/             # API Services
    │   │   ├── models/               # TypeScript Interfaces
    │   │   ├── guards/               # Route Guards
    │   │   ├── interceptors/         # HTTP Interceptors
    │   │   ├── app.routes.ts         # Routing Configuration
    │   │   └── app.config.ts         # App Configuration
    │   ├── assets/                   # Static Assets
    │   ├── index.html
    │   └── styles.css
    ├── angular.json
    └── package.json
```

---

## 📦 Installation

### Prerequisites

Ensure you have the following installed:

- **Java JDK 21** or higher
- **Node.js 18+** and npm
- **MySQL 8.0** or higher
- **Maven 3.8+** (or use the included Maven wrapper)
- **Angular CLI 18**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gharsallah-Islem/Medtrack.git
   cd Medtrack/Backend
   ```

2. **Create MySQL Database**
   ```sql
   CREATE DATABASE medtrack_db;
   ```

3. **Configure Database Connection**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/medtrack_db?createDatabaseIfNotExist=true
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

4. **Configure Email Settings**
   
   Update email configuration in `application.properties`:
   ```properties
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   ```

5. **Update JWT Secret**
   
   For production, change the JWT secret:
   ```properties
   jwt.secret=YourVeryLongAndSecureRandomSecretKeyHere
   ```

6. **Build and Run**
   ```bash
   # Using Maven Wrapper (recommended)
   ./mvnw clean install
   ./mvnw spring-boot:run

   # Or using installed Maven
   mvn clean install
   mvn spring-boot:run
   ```

   Backend will start at `http://localhost:8081`

### Frontend Setup

1. **Navigate to Frontend Directory**
   ```bash
   cd ../Frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure API URL** (if needed)
   
   The API URL is set to `http://localhost:8081` in service files. Update if your backend runs on a different port.

4. **Start Development Server**
   ```bash
   npm start
   # or
   ng serve
   ```

   Frontend will start at `http://localhost:4200`

5. **Build for Production**
   ```bash
   npm run build
   # or
   ng build --configuration production
   ```

---

## ⚙ Configuration

### Backend Configuration

**File**: `Backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/medtrack_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

# Email Configuration (Gmail)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Server Configuration
server.port=8081
spring.jpa.properties.hibernate.jdbc.time_zone=UTC

# JWT Configuration
jwt.secret=YourSecretKeyHere

# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

### Security Configuration

- CORS is configured to allow requests from `http://localhost:4200`
- JWT tokens are used for authentication
- Role-based access control (RBAC) for different endpoints
- Passwords are encrypted using BCrypt

---

## 📚 API Documentation

### Base URL
```
http://localhost:8081/api
```

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securePassword123",
  "email": "john@example.com",
  "role": "patient"  // or "doctor" or "admin"
}
```

#### Verify Email
```http
POST /api/auth/verify?email=john@example.com&code=123456
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "john_doe",  // username or email
  "password": "securePassword123"
}
```

**Response**: JWT token (string)

### User Endpoints

```http
GET    /api/users                    # Get all users (Admin only)
GET    /api/users/me                 # Get current user profile
GET    /api/users/me/id              # Get current user ID
PUT    /api/users/me/profile         # Update current user profile
GET    /api/users/{id}               # Get user by ID
GET    /api/users/doctors            # Get all doctors
GET    /api/users/patients           # Get all patients
PUT    /api/users/{id}               # Update user (Admin)
DELETE /api/users/{id}               # Delete user (Admin)
```

### Appointment Endpoints

```http
POST   /api/appointments             # Create appointment
GET    /api/appointments/patient/{id}     # Get patient appointments
GET    /api/appointments/doctor/{id}      # Get doctor appointments
GET    /api/appointments/available-doctors  # Search available doctors
PUT    /api/appointments/{id}/approve     # Approve appointment
DELETE /api/appointments/{id}              # Cancel appointment
```

### Availability Endpoints

```http
POST   /api/availability                      # Add availability
POST   /api/availability/bulk                 # Add multiple availabilities
GET    /api/availability/doctor               # Get logged-in doctor's availability
GET    /api/availability/doctor/{id}/slots?date=YYYY-MM-DD  # Get available slots
POST   /api/availability/book/{slotId}        # Book a slot
PUT    /api/availability/{id}                 # Update availability
DELETE /api/availability/{id}                 # Delete availability
```

### Medication Endpoints

```http
GET    /api/medications/patient/{id}    # Get patient medications
POST   /api/medications                 # Add medication
PUT    /api/medications/{id}            # Update medication
DELETE /api/medications/{id}            # Delete medication
```

### Report Endpoints

```http
POST   /api/reports/upload              # Upload report (multipart/form-data)
GET    /api/reports/patient/{id}        # Get patient reports
GET    /api/reports/doctor/{id}         # Get doctor's patient reports
GET    /api/reports/files/{filename}    # View report file
GET    /api/reports/download/{id}       # Download report PDF
```

### Rating Endpoints

```http
POST   /api/ratings                     # Add rating
GET    /api/ratings/doctor/{id}         # Get doctor ratings
GET    /api/ratings/patient/{id}        # Get patient ratings
```

### Chat Endpoints

```http
POST   /api/chat                               # Send message
GET    /api/chat/conversation/{id1}/{id2}      # Get conversation
GET    /api/chat/unread/{receiverId}           # Get unread messages
PUT    /api/chat/{messageId}/read              # Mark message as read
```

### Notification Endpoints

```http
GET    /api/notifications/user/{id}     # Get user notifications
POST   /api/notifications               # Create notification
```

### Statistics Endpoints

```http
GET    /api/statistics/patient/{id}                           # Get patient statistics
POST   /api/statistics                                        # Add statistics
GET    /api/statistics/doctor/{id}                            # Get doctor statistics
GET    /api/statistics/admin?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD  # Admin statistics
```

### Request Headers

All authenticated endpoints require:
```http
Authorization: Bearer <jwt_token>
```

---

## 👥 User Roles

### Patient
- Can search and book appointments with doctors
- Manage medication schedules
- Upload and view medical reports
- Chat with doctors
- Rate doctors
- View personal health statistics

### Doctor
- Set availability and manage schedule
- View and approve patient appointments
- Access patient medical reports
- Communicate with patients via chat
- View practice statistics and ratings
- Manage patient consultations

### Administrator
- Manage all users (patients, doctors, admins)
- View system-wide analytics
- Access comprehensive reporting
- Monitor platform activity
- Configure system settings

---

## 🗄 Database Schema

### Core Entities

#### Users
```sql
- id (PK)
- username (unique)
- password (encrypted)
- email (unique)
- role (patient/doctor/admin)
- firstName
- lastName
- specialty (for doctors)
- location
- verificationCode
- isActive
- isProfileComplete
- createdAt
```

#### Appointments
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- slot_id (FK)
- status (pending/approved/completed)
- createdAt
```

#### Availability
```sql
- id (PK)
- doctor_id (FK)
- date
- startTime
- endTime
- isAvailable
- version (optimistic locking)
```

#### AppointmentSlots
```sql
- id (PK)
- availability_id (FK)
- slotStartTime
- slotEndTime
- isBooked
- patient_id (FK, nullable)
- doctor_id (FK)
- status
- createdAt
- version
```

#### Medications
```sql
- id (PK)
- patient_id (FK)
- name
- dosage
- frequency
- schedules (TEXT)
- createdAt
```

#### Reports
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- filePath
- enhancedFilePath
- pdfPath
- sentStatus (pending/sent)
- sentAt
```

#### Ratings
```sql
- id (PK)
- patient_id (FK)
- doctor_id (FK)
- rating (1-5)
- review (TEXT)
- createdAt
```

#### Chats
```sql
- id (PK)
- sender_id (FK)
- receiver_id (FK)
- message (TEXT)
- timestamp
- isRead
```

#### Notifications
```sql
- id (PK)
- user_id (FK)
- message (TEXT)
- type (email/in_app)
- sentAt
```

#### Statistics
```sql
- id (PK)
- patient_id (FK)
- metric type data
- timestamp
```

---

## 🔒 Security

### Authentication Flow

1. **User Registration**
   - User submits registration form
   - Password is encrypted using BCrypt
   - Verification code is generated and sent via email
   - User account is created with `isActive = false`

2. **Email Verification**
   - User receives verification code via email
   - User submits code through verification endpoint
   - Account is activated (`isActive = true`)

3. **Login**
   - User provides username/email and password
   - Credentials are validated
   - JWT token is generated with user ID and role
   - Token is returned to client

4. **Authenticated Requests**
   - Client includes JWT token in Authorization header
   - JwtAuthenticationFilter intercepts request
   - Token is validated and user is authenticated
   - Request proceeds with SecurityContext populated

### JWT Configuration

- **Algorithm**: HS256
- **Claims**: userId, username, role
- **Expiration**: Configurable (default: 24 hours)
- **Secret**: Stored in application.properties (should be externalized in production)

### Role-Based Access Control

Routes are protected based on user roles:

```java
/api/auth/**                  → Public
/api/users/**                 → Admin only (except /me)
/api/medications/**           → Patient, Doctor
/api/appointments/**          → Patient, Doctor
/api/reports/**               → Patient, Doctor
/api/availability/**          → Patient, Doctor
/api/chat/**                  → Patient, Doctor
/api/ratings/**               → Patient, Doctor
/api/statistics/**            → Patient, Doctor, Admin
```

### Best Practices Implemented

- ✅ Password encryption with BCrypt
- ✅ JWT for stateless authentication
- ✅ Role-based access control
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention (JPA)
- ✅ XSS protection
- ✅ HTTPS ready (configure SSL for production)

### Production Security Checklist

- [ ] Use environment variables for sensitive data
- [ ] Enable HTTPS/TLS
- [ ] Set strong JWT secret (min 256 bits)
- [ ] Configure JWT expiration appropriately
- [ ] Implement rate limiting
- [ ] Enable SQL query logging (only in dev)
- [ ] Use prepared statements (already done via JPA)
- [ ] Implement CSRF protection for state-changing operations
- [ ] Regular dependency updates
- [ ] Security audit and penetration testing

---

## 🚀 Deployment

### Backend Deployment

1. **Build JAR**
   ```bash
   ./mvnw clean package -DskipTests
   ```

2. **Run JAR**
   ```bash
   java -jar target/backend-0.0.1-SNAPSHOT.jar
   ```

3. **Environment Variables** (Production)
   ```bash
   export DB_URL=jdbc:mysql://production-host:3306/medtrack_db
   export DB_USERNAME=prod_user
   export DB_PASSWORD=prod_password
   export JWT_SECRET=your_production_secret
   export MAIL_USERNAME=your_email
   export MAIL_PASSWORD=your_password
   ```

### Frontend Deployment

1. **Build for Production**
   ```bash
   ng build --configuration production
   ```

2. **Deploy** `dist/` folder to:
   - Nginx
   - Apache
   - Netlify
   - Vercel
   - AWS S3 + CloudFront
   - Azure Static Web Apps

### Docker Deployment (Optional)

Create `Dockerfile` for backend:
```dockerfile
FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Create `Dockerfile` for frontend:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/medtrack-frontend /usr/share/nginx/html
EXPOSE 80
```

---

## 🧪 Testing

### Backend Testing
```bash
./mvnw test
```

### Frontend Testing
```bash
npm test
```

### E2E Testing
```bash
npm run e2e
```

---

## 📝 Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- **Backend**: Follow Spring Boot best practices
- **Frontend**: Follow Angular style guide
- **Git Commits**: Use conventional commits
- **Code Review**: All PRs require review

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Islem Gharsallah**

- GitHub: [@Gharsallah-Islem](https://github.com/Gharsallah-Islem),[@Ahmed-besrour](https://github.com/DIMITROOOOOO)
- Repository: [MedTrack](https://github.com/Gharsallah-Islem/Medtrack)

---

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Angular team for the powerful frontend framework
- All contributors and supporters of this project

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](#-api-documentation)
2. Search [existing issues](https://github.com/Gharsallah-Islem/Medtrack/issues)
3. Create a [new issue](https://github.com/Gharsallah-Islem/Medtrack/issues/new)

---

<div align="center">

**Made with ❤️ for better healthcare management**

⭐ Star this repo if you find it helpful!

</div>
