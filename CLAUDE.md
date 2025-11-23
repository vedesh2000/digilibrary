# DigiLibrary - AI Assistant Guide

This document provides comprehensive guidance for AI assistants working on the DigiLibrary project.

## Project Overview

DigiLibrary is a full-stack web application for managing personal book libraries. Users can track books, authors, reading progress, and maintain a digital library with eBook support.

### Core Features
- User authentication (email verification, password reset, remember me)
- Book management (CRUD operations, reading progress tracking)
- Author management (CRUD operations)
- eBook support with drive links
- Personalized dashboard with statistics
- Advanced filtering and querying
- Dark mode/light mode theming

### Technology Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML, CSS, JavaScript (framework TBD)
- **Authentication**: Email-based with JWT (expected)
- **Email Service**: For verification and password reset

## Repository Structure

### Expected Directory Layout
```
digilibrary/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── services/          # Business logic
│   └── validators/        # Input validation
├── public/                # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── images/           # Images
├── views/                 # Template files (EJS/Pug/Handlebars)
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
└── README.md           # Project documentation
```

### Current State
- ✅ README.md with project description
- ⏳ Source code to be implemented
- ⏳ Package configuration to be added
- ⏳ Environment configuration to be added

## Development Conventions

### Code Style
- **JavaScript Standard**: Use ES6+ features
- **Async/Await**: Prefer async/await over callbacks for asynchronous operations
- **Error Handling**: Always implement proper error handling with try-catch blocks
- **Naming Conventions**:
  - camelCase for variables and functions
  - PascalCase for classes and models
  - UPPER_CASE for constants
  - Descriptive names over abbreviations

### Database Conventions

#### Models to Implement
1. **User Model**
   - Fields: email, password (hashed), name, isVerified, verificationToken, resetToken, theme preference
   - Methods: comparePassword, generateAuthToken, generateVerificationToken

2. **Book Model**
   - Fields: title, description, authors (ref), status (to-read/in-progress/completed), progress, isEbook, driveLink, userId (ref), createdAt, updatedAt
   - Indexes: userId, status, authors

3. **Author Model**
   - Fields: name, biography, userId (ref), createdAt, updatedAt
   - Indexes: userId, name

#### Mongoose Best Practices
- Use schema validation
- Implement virtual properties where appropriate
- Use pre/post middleware for business logic
- Always use lean() for read-only queries
- Implement proper indexing for query performance

### API Design

#### RESTful Endpoints Structure
```
Authentication:
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/verify-email      # Verify email
POST   /api/auth/forgot-password   # Request password reset
POST   /api/auth/reset-password    # Reset password
GET    /api/auth/logout            # Logout user

Books:
GET    /api/books                  # Get all books (with filters)
GET    /api/books/:id              # Get single book
POST   /api/books                  # Create book
PUT    /api/books/:id              # Update book
DELETE /api/books/:id              # Delete book
PATCH  /api/books/:id/progress     # Update reading progress

Authors:
GET    /api/authors                # Get all authors (with filters)
GET    /api/authors/:id            # Get single author
POST   /api/authors                # Create author
PUT    /api/authors/:id            # Update author
DELETE /api/authors/:id            # Delete author

Dashboard:
GET    /api/dashboard/stats        # Get user statistics
```

#### Response Format
```javascript
// Success Response
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  error: "Error message",
  details: { ... } // Optional validation errors
}
```

### Security Best Practices

#### Authentication & Authorization
- Hash passwords with bcrypt (minimum 10 rounds)
- Use JWT for session management
- Implement refresh tokens for long-lived sessions
- Validate all user inputs
- Implement rate limiting on auth endpoints

#### Data Protection
- Never log sensitive information (passwords, tokens)
- Use environment variables for secrets
- Implement CORS properly
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent injection
- Implement CSRF protection

#### Common Vulnerabilities to Avoid
- ❌ SQL/NoSQL injection
- ❌ Cross-Site Scripting (XSS)
- ❌ Cross-Site Request Forgery (CSRF)
- ❌ Insecure authentication
- ❌ Sensitive data exposure
- ❌ Missing access control

### Testing Standards

#### Test Coverage Requirements
- Aim for 80%+ code coverage
- Test all critical paths
- Test error handling
- Test authentication/authorization

#### Test Structure
```javascript
describe('Feature/Module Name', () => {
  describe('Method/Function Name', () => {
    it('should handle normal case', () => {
      // Test implementation
    });

    it('should handle edge case', () => {
      // Test implementation
    });

    it('should handle error case', () => {
      // Test implementation
    });
  });
});
```

## Environment Variables

### Required Variables
```bash
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/digilibrary
MONGODB_TEST_URI=mongodb://localhost:27017/digilibrary_test

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# Email Service (e.g., SendGrid, Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@digilibrary.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000

# Session (if using express-session)
SESSION_SECRET=your-session-secret
```

## Development Workflow

### Getting Started
1. Clone the repository
2. Checkout the master branch (or appropriate feature branch)
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and configure
5. Start MongoDB service
6. Run migrations (if any)
7. Start development server: `npm run dev`

### Branch Strategy
- `master` or `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `claude/*`: AI assistant working branches

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

Examples:
- `feat(auth): implement email verification`
- `fix(books): resolve reading progress calculation`
- `docs(readme): update installation instructions`

### Pull Request Guidelines
1. Create feature branch from develop
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation if needed
5. Create PR with descriptive title and description
6. Link related issues
7. Request review

## AI Assistant Instructions

### When Implementing Features
1. **Read First**: Always read relevant existing code before making changes
2. **Plan**: Break down complex features into smaller tasks
3. **Test**: Write tests alongside implementation
4. **Document**: Add inline comments for complex logic
5. **Validate**: Check for security vulnerabilities
6. **Review**: Verify changes don't break existing functionality

### When Fixing Bugs
1. **Reproduce**: Understand the issue first
2. **Locate**: Find the root cause
3. **Fix**: Implement minimal, focused fix
4. **Test**: Add test to prevent regression
5. **Verify**: Ensure fix doesn't introduce new issues

### When Refactoring
1. **Understand**: Comprehend current implementation
2. **Plan**: Define clear refactoring goals
3. **Incremental**: Make small, testable changes
4. **Test**: Ensure functionality remains unchanged
5. **Document**: Explain architectural decisions

### Code Quality Checklist
- [ ] Code follows project conventions
- [ ] No hardcoded credentials or secrets
- [ ] Proper error handling implemented
- [ ] Input validation present
- [ ] Security vulnerabilities checked
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No unnecessary dependencies added
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met (frontend)

### Common Pitfalls to Avoid
1. **Over-engineering**: Keep solutions simple and focused
2. **Security oversights**: Always validate and sanitize inputs
3. **Missing error handling**: Handle all error cases
4. **Hardcoded values**: Use environment variables
5. **Untested code**: Write tests for new functionality
6. **Breaking changes**: Maintain backward compatibility
7. **Memory leaks**: Close connections and clear intervals
8. **Blocking operations**: Use async operations properly

## Package Scripts

### Expected npm Scripts
```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "lint": "eslint src/**/*.js",
    "lint:fix": "eslint src/**/*.js --fix",
    "format": "prettier --write \"src/**/*.js\"",
    "seed": "node src/utils/seed.js"
  }
}
```

## Dependencies

### Core Dependencies (Expected)
```json
{
  "express": "^4.x",
  "mongoose": "^8.x",
  "bcryptjs": "^2.x",
  "jsonwebtoken": "^9.x",
  "dotenv": "^16.x",
  "express-validator": "^7.x",
  "nodemailer": "^6.x",
  "cors": "^2.x",
  "helmet": "^7.x",
  "express-rate-limit": "^7.x",
  "morgan": "^1.x"
}
```

### Dev Dependencies (Expected)
```json
{
  "nodemon": "^3.x",
  "jest": "^29.x",
  "supertest": "^6.x",
  "eslint": "^8.x",
  "prettier": "^3.x",
  "mongodb-memory-server": "^9.x"
}
```

## Debugging Tips

### Common Issues
1. **Database Connection Fails**
   - Check MongoDB service is running
   - Verify MONGODB_URI in .env
   - Check network connectivity

2. **Authentication Not Working**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate middleware order

3. **Email Not Sending**
   - Verify email service credentials
   - Check spam folder
   - Review email service logs

### Logging Strategy
- Use structured logging
- Log levels: error, warn, info, debug
- Include context in log messages
- Don't log sensitive data

## Performance Considerations

### Database Optimization
- Use indexes on frequently queried fields
- Implement pagination for large datasets
- Use projection to limit returned fields
- Consider aggregation pipeline for complex queries
- Cache frequently accessed data

### API Optimization
- Implement response compression
- Use etags for caching
- Minimize payload size
- Implement lazy loading
- Consider CDN for static assets

## Accessibility (Frontend)

### Requirements
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG 2.1 AA)
- Screen reader compatibility
- Focus indicators visible
- Error messages accessible

## Resources

### Documentation Links
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [JWT.io](https://jwt.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Test Credentials
- **Email**: legendtonystart1@gmail.com
- **Password**: asdf@1234

**Note**: These are test credentials only. Never commit real credentials to version control.

## Contributing

### For AI Assistants
1. Always create feature branches for new work
2. Commit frequently with descriptive messages
3. Push to remote when work is complete
4. Never push directly to master/main
5. Ask for clarification on ambiguous requirements
6. Document complex logic and architectural decisions

### For Human Developers
- Review CLAUDE.md before starting work
- Update this document as the project evolves
- Maintain consistent coding standards
- Participate in code reviews
- Keep dependencies up to date

## Version History

### Current State (Initial)
- Repository initialized with README.md
- CLAUDE.md created
- Source code pending implementation

---

**Last Updated**: 2025-11-23
**Maintained By**: Project Contributors
**Status**: 🟡 In Development
