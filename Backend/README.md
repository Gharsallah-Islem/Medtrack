# MedTrack Backend

Spring Boot REST API for the MedTrack healthcare management system.

## 🚀 Quick Start

### Prerequisites
- Java JDK 21+
- MySQL 8.0+
- Maven 3.8+

### Setup

1. **Create Database**
   ```sql
   CREATE DATABASE medtrack_db;
   ```

2. **Configure Application**
   
   Edit `src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.mail.username=your_email@gmail.com
   spring.mail.password=your_app_password
   jwt.secret=YourSecretKeyHere
   ```

3. **Run Application**
   ```bash
   ./mvnw spring-boot:run
   ```

Server starts at `http://localhost:8081`

## 📁 Project Structure

```
src/main/java/com/medtrack/backend/
├── config/              # Security & Application Configuration
├── controller/          # REST API Endpoints
├── entity/              # JPA Entities
├── repository/          # Data Access Layer
├── service/             # Business Logic
├── security/            # JWT Authentication
└── exception/           # Exception Handling
```

## 🔑 Key Features

- **JWT Authentication** - Secure token-based auth
- **Role-Based Access** - Patient, Doctor, Admin roles
- **Email Verification** - Account activation via email
- **File Upload** - Medical report management
- **RESTful API** - Clean API design
- **MySQL Database** - Relational data storage

## 📚 API Endpoints

See the [main README](../README.md#-api-documentation) for full API documentation.

## 🧪 Testing

```bash
./mvnw test
```

## 📦 Build

```bash
./mvnw clean package
```

Output: `target/backend-0.0.1-SNAPSHOT.jar`

## 🔧 Technologies

- Spring Boot 3.4.5
- Spring Security
- Spring Data JPA
- MySQL Connector
- JWT (jjwt)
- JavaMail
- Lombok
