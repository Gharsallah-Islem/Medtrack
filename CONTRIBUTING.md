# Contributing to MedTrack

First off, thank you for considering contributing to MedTrack! 🎉

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, Java version, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - Why is this enhancement useful?
- **Proposed solution**
- **Alternatives considered**

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

## Development Setup

### Backend
```bash
cd Backend
./mvnw spring-boot:run
```

### Frontend
```bash
cd Frontend
npm install
npm start
```

## Coding Standards

### Backend (Java/Spring Boot)

- Follow Spring Boot best practices
- Use Lombok for boilerplate reduction
- Write meaningful variable and method names
- Add JavaDoc for public methods
- Use `@Service`, `@Controller`, `@Repository` annotations appropriately
- Handle exceptions properly
- Write unit tests for services

**Example:**
```java
@Service
public class UserService {
    /**
     * Retrieves a user by their ID.
     * 
     * @param id the user ID
     * @return the user entity
     * @throws EntityNotFoundException if user not found
     */
    public User getUserById(Integer id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }
}
```

### Frontend (Angular/TypeScript)

- Follow Angular Style Guide
- Use TypeScript strict mode
- Component naming: `feature-name.component.ts`
- Service naming: `feature-name.service.ts`
- Use RxJS operators efficiently
- Unsubscribe from observables
- Use async pipe when possible
- Write meaningful component and variable names

**Example:**
```typescript
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }
}
```

## Commit Message Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding/updating tests
- `chore:` Maintenance tasks

**Examples:**
```bash
feat: add user profile editing
fix: resolve appointment booking race condition
docs: update API documentation
refactor: simplify authentication flow
test: add unit tests for medication service
```

## Testing

### Backend Tests
```bash
cd Backend
./mvnw test
```

### Frontend Tests
```bash
cd Frontend
npm test
```

### Write Tests For:
- New features
- Bug fixes
- Edge cases
- Critical business logic

## Code Review Process

1. All submissions require review
2. Reviewers will check:
   - Code quality and style
   - Test coverage
   - Documentation
   - Performance implications
   - Security considerations
3. Address review comments
4. Once approved, maintainers will merge

## Project Structure

Familiarize yourself with:
- [Backend README](Backend/README.md)
- [Frontend README](Frontend/README.md)
- [Main README](README.md)
- [Security Guidelines](SECURITY.md)

## Questions?

- Check [existing issues](https://github.com/Gharsallah-Islem/Medtrack/issues)
- Create a new issue for discussion
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to MedTrack! 🏥❤️
