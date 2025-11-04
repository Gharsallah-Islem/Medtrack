# 🔒 SECURITY NOTICE

## ⚠️ Important Security Information

This repository contains configuration files with **sensitive information** that should **NEVER** be committed to version control in a production environment.

### Files to Protect

1. **`Backend/src/main/resources/application.properties`**
   - Database credentials
   - Email credentials
   - JWT secret key

### Before Deploying

✅ **DO:**
- Use `application.properties.template` as a reference
- Store secrets in environment variables
- Use Spring Cloud Config or external configuration
- Add `application.properties` to `.gitignore` (already done)
- Generate strong JWT secrets (minimum 256 bits)
- Use app-specific passwords for email
- Enable 2FA on email accounts

❌ **DON'T:**
- Commit real credentials to Git
- Use default/weak secrets in production
- Share credentials in plain text
- Use the same secrets across environments

### Environment Variables (Recommended)

For production, use environment variables:

```bash
export DB_URL=jdbc:mysql://production-host:3306/medtrack_db
export DB_USERNAME=prod_user
export DB_PASSWORD=secure_password
export JWT_SECRET=$(openssl rand -base64 64)
export MAIL_USERNAME=your_email@domain.com
export MAIL_PASSWORD=app_specific_password
```

Update `application.properties`:
```properties
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

### Current Status

⚠️ The current `application.properties` file contains **example/development credentials** and should be replaced before production deployment.

### Gmail Setup for Email Verification

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated 16-character password
3. Use this app password in `spring.mail.password`

### JWT Secret Generation

Generate a secure secret key:
```bash
# Linux/Mac
openssl rand -base64 64

# Or use online generators (ensure HTTPS)
# https://generate-secret.vercel.app/64
```

### Additional Security Measures

- [ ] Enable HTTPS/TLS in production
- [ ] Implement rate limiting
- [ ] Set up database connection pooling
- [ ] Configure CORS properly for your domain
- [ ] Regular security audits
- [ ] Keep dependencies up to date
- [ ] Use prepared statements (already done via JPA)
- [ ] Implement input validation (already done)
- [ ] Set up logging and monitoring

---

**If you accidentally committed sensitive data:**

1. Remove from Git history: `git filter-branch` or `BFG Repo-Cleaner`
2. Revoke/change all exposed credentials immediately
3. Notify your team if it's a shared repository

Stay secure! 🔐
