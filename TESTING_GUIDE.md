# Testing Guide - Hướng Dẫn Viết Test Cho Microservices

## 📚 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Các Loại Test](#các-loại-test)
3. [Cấu Trúc Test](#cấu-trúc-test)
4. [Unit Test](#unit-test)
5. [Integration Test](#integration-test)
6. [Best Practices](#best-practices)
7. [Chạy Tests](#chạy-tests)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Giới Thiệu

Testing là một phần quan trọng trong phát triển phần mềm. Guide này giải thích cách viết tests cho microservices TypeScript với ví dụ cụ thể về `CreateANewCategoryAPI`.

### Tại Sao Cần Test?

- ✅ **Đảm Bảo Code Hoạt Động Đúng**: Verify logic và functionality
- ✅ **Phát Hiện Bug Sớm**: Catch errors trước khi deploy
- ✅ **Refactoring An Toàn**: Thay đổi code mà không lo phá vỡ tính năng
- ✅ **Documentation**: Tests là tài liệu sống cho code
- ✅ **Confidence**: Tin tưởng khi deploy production

---

## 🔍 Các Loại Test

### 1️⃣ Unit Test

**Định Nghĩa**: Test một đơn vị code nhỏ nhất (function, method) một cách độc lập.

**Đặc Điểm**:
- Mock tất cả dependencies
- Chạy rất nhanh (milliseconds)
- Test logic thuần túy
- Không cần database, network

**Ví Dụ**: Test `CategoryHttpService.CreateANewCategoryAPI`
- Mock UseCase
- Test validation
- Test response format

```typescript
it('should create category successfully', async () => {
  // Arrange - Setup
  mockUseCase.CreateANewCategory.mockResolvedValue('uuid-123');
  
  // Act - Execute
  await httpService.CreateANewCategoryAPI(req, res);
  
  // Assert - Verify
  expect(res.status).toHaveBeenCalledWith(201);
});
```

### 2️⃣ Integration Test

**Định Nghĩa**: Test sự tương tác giữa nhiều components/layers.

**Đặc Điểm**:
- Không mock (hoặc mock ít nhất)
- Sử dụng real/in-memory database
- Chạy chậm hơn (seconds)
- Test toàn bộ flow

**Ví Dụ**: Test từ HTTP request → UseCase → Database
- Setup Express server
- Gửi HTTP request thật
- Verify data trong database

```typescript
it('should save category to database', async () => {
  // Act - Send real HTTP request
  const response = await request(app)
    .post('/api/categories')
    .send({ name: 'Electronics' });
  
  // Assert - Check database
  const saved = await db.findById(response.body.data);
  expect(saved.name).toBe('Electronics');
});
```

### 📊 So Sánh

| Đặc Điểm | Unit Test | Integration Test |
|----------|-----------|------------------|
| **Scope** | 1 function | Multiple layers |
| **Dependencies** | All mocked | Real or in-memory |
| **Speed** | ⚡ Fast (ms) | 🐌 Slower (seconds) |
| **Database** | ❌ Mocked | ✅ Real/In-memory |
| **Network** | ❌ Mocked | ✅ Real/Simulated |
| **Purpose** | Test logic | Test integration |
| **Coverage** | Narrow | Wide |

---

## 📁 Cấu Trúc Test

```
src/modules/categories/
├── infras/
│   ├── transport/
│   │   ├── http-service.ts
│   │   └── __tests__/
│   │       └── http-service.test.ts          # Unit test cho HTTP layer
│   └── repository/
│       └── repo.ts
├── usecase/
│   ├── index.ts
│   └── __tests__/
│       └── usecase.test.ts                    # Unit test cho UseCase layer
├── model/
│   ├── dto.ts
│   └── model.ts
└── __tests__/
    └── integration/
        └── create-category.integration.test.ts # Integration test toàn bộ flow
```

**Quy Tắc Đặt Tên**:
- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- Test files nằm trong `__tests__` folder

---

## 🧪 Unit Test

### Cấu Trúc Unit Test

#### 1. AAA Pattern (Arrange, Act, Assert)

```typescript
it('should create category successfully', async () => {
  // 1️⃣ Arrange - Chuẩn bị data và mocks
  const mockId = 'uuid-123';
  mockUseCase.CreateANewCategory.mockResolvedValue(mockId);
  const req = { body: { name: 'Electronics' } };
  const res = createMockResponse();
  
  // 2️⃣ Act - Thực hiện action cần test
  await httpService.CreateANewCategoryAPI(req, res);
  
  // 3️⃣ Assert - Kiểm tra kết quả
  expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith({ name: 'Electronics' });
  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith({
    message: 'Category created successfully',
    data: mockId
  });
});
```

#### 2. Mock Dependencies

```typescript
// Mock UseCase
const mockUseCase = {
  CreateANewCategory: jest.fn(),
  getDetailCategory: jest.fn(),
  UpdateCategory: jest.fn(),
  DeleteCategory: jest.fn(),
  ListCategory: jest.fn(),
} as jest.Mocked<ICategoryUseCase>;

// Mock Response
const createMockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};
```

### Test Cases Cần Cover

#### ✅ Happy Path
```typescript
it('should create category successfully', async () => {
  // Test trường hợp thành công
});
```

#### ❌ Validation Errors
```typescript
it('should return 400 when name is missing', async () => {
  // Test thiếu required field
});

it('should return 400 when name is too short', async () => {
  // Test validation rules
});

it('should return 400 when URL is invalid', async () => {
  // Test format validation
});
```

#### ⚠️ Error Handling
```typescript
it('should return 400 when useCase fails', async () => {
  // Test khi useCase return null/false
});

it('should throw error when useCase throws exception', async () => {
  // Test khi có exception
});
```

#### 🎯 Edge Cases
```typescript
it('should handle special characters', async () => {
  // Test ký tự đặc biệt
});

it('should work with minimum required fields', async () => {
  // Test với chỉ required fields
});
```

### Best Practices cho Unit Test

1. **Một Test, Một Mục Đích**
   ```typescript
   // ❌ Bad - Test nhiều thứ
   it('should handle everything', async () => {
     // Test validation, creation, response...
   });
   
   // ✅ Good - Tách ra nhiều tests
   it('should validate input', async () => { });
   it('should create category', async () => { });
   it('should return correct response', async () => { });
   ```

2. **Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('test 1', async () => { });
   
   // ✅ Good
   it('should return 400 when name is missing', async () => { });
   ```

3. **Mock Đúng Cách**
   ```typescript
   // ❌ Bad - Không reset mock
   mockUseCase.CreateANewCategory.mockResolvedValue('id');
   
   // ✅ Good - Reset trong beforeEach
   beforeEach(() => {
     jest.clearAllMocks();
     mockUseCase = createMockUseCase();
   });
   ```

4. **Verify Mock Calls**
   ```typescript
   // Verify được gọi
   expect(mockUseCase.CreateANewCategory).toHaveBeenCalled();
   
   // Verify được gọi với params cụ thể
   expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith({ name: 'Electronics' });
   
   // Verify số lần được gọi
   expect(mockUseCase.CreateANewCategory).toHaveBeenCalledTimes(1);
   ```

---

## 🔗 Integration Test

### Setup Integration Test Environment

```typescript
describe('Integration Test - CreateCategory', () => {
  let app: Express;
  let sequelize: Sequelize;
  
  beforeAll(async () => {
    // 1. Setup in-memory database
    sequelize = new Sequelize('sqlite::memory:', { logging: false });
    
    // 2. Define models
    sequelize.define('Category', { /* schema */ });
    
    // 3. Sync database
    await sequelize.sync({ force: true });
    
    // 4. Initialize real components
    const repository = new MySQLCategoryRepository(sequelize, 'Category');
    const useCase = new CategoryUseCase(repository);
    const httpService = new CategoryHttpService(useCase);
    
    // 5. Setup Express app
    app = express();
    app.use(express.json());
    app.post('/api/categories', (req, res) => 
      httpService.CreateANewCategoryAPI(req, res)
    );
  });
  
  afterAll(async () => {
    await sequelize.close();
  });
  
  beforeEach(async () => {
    // Reset database before each test
    await sequelize.models.Category?.destroy({ where: {}, truncate: true });
  });
});
```

### Gửi HTTP Requests với Supertest

```typescript
it('should create category end-to-end', async () => {
  // Arrange
  const categoryData = { name: 'Electronics' };
  
  // Act - Send HTTP request
  const response = await request(app)
    .post('/api/categories')
    .send(categoryData)
    .expect(201);  // Assert status code
  
  // Assert - Response
  expect(response.body.message).toBe('Category created successfully');
  expect(response.body.data).toBeDefined();
  
  // Assert - Database
  const saved = await sequelize.models.Category?.findByPk(response.body.data);
  expect(saved).toBeDefined();
  expect(saved.get('name')).toBe('Electronics');
});
```

### Test Cases cho Integration Test

#### 🌈 End-to-End Flow
```typescript
it('should create category through entire stack', async () => {
  // Test toàn bộ flow từ HTTP đến database
});
```

#### 🚫 Validation Prevents Database Save
```typescript
it('should not save to DB when validation fails', async () => {
  const countBefore = await db.count();
  
  await request(app)
    .post('/api/categories')
    .send({ name: 'A' })  // Too short
    .expect(400);
  
  const countAfter = await db.count();
  expect(countAfter).toBe(countBefore);  // No new record
});
```

#### 📊 Data Integrity
```typescript
it('should save correct timestamps', async () => {
  const response = await request(app)
    .post('/api/categories')
    .send({ name: 'Electronics' });
  
  const saved = await db.findById(response.body.data);
  expect(saved.created_at).toBeInstanceOf(Date);
  expect(saved.updated_at).toBeInstanceOf(Date);
});
```

---

## 🎨 Best Practices

### 1. Test Naming Convention

```typescript
// Pattern: should [expected behavior] when [condition]

// ✅ Good
it('should return 201 when category is created successfully', async () => {});
it('should return 400 when name is missing', async () => {});
it('should throw error when database connection fails', async () => {});

// ❌ Bad
it('test create category', async () => {});
it('works', async () => {});
```

### 2. Test Organization

```typescript
describe('CategoryHttpService', () => {
  describe('CreateANewCategoryAPI', () => {
    describe('Success Cases', () => {
      it('should create with all fields', async () => {});
      it('should create with required fields only', async () => {});
    });
    
    describe('Validation Errors', () => {
      it('should reject when name is missing', async () => {});
      it('should reject when name is too short', async () => {});
    });
    
    describe('Error Handling', () => {
      it('should handle useCase failure', async () => {});
      it('should propagate exceptions', async () => {});
    });
  });
});
```

### 3. DRY (Don't Repeat Yourself)

```typescript
// ❌ Bad - Duplicate code
it('test 1', () => {
  const req = { body: { name: 'Test' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  // test...
});

it('test 2', () => {
  const req = { body: { name: 'Test2' } };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  // test...
});

// ✅ Good - Use helper functions
const createMockRequest = (body) => ({ body });
const createMockResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

it('test 1', () => {
  const req = createMockRequest({ name: 'Test' });
  const res = createMockResponse();
  // test...
});
```

### 4. Test Data Builders

```typescript
// Test data factory
class CategoryDataBuilder {
  private data: any = { name: 'Default Category' };
  
  withName(name: string) {
    this.data.name = name;
    return this;
  }
  
  withImage(image: string) {
    this.data.image = image;
    return this;
  }
  
  build() {
    return this.data;
  }
}

// Usage
it('should create category', async () => {
  const data = new CategoryDataBuilder()
    .withName('Electronics')
    .withImage('https://example.com/image.jpg')
    .build();
  
  await request(app).post('/api/categories').send(data);
});
```

### 5. Test Coverage

**Mục Tiêu Coverage**:
- Unit Tests: ~80-90%
- Integration Tests: Critical paths

**Xem Coverage**:
```bash
npm run test:coverage
```

**Coverage Report**:
```
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
http-service.ts     |   95.00 |   90.00  |  100.00 |   95.00 |
usecase/index.ts    |   92.00 |   85.00  |  100.00 |   92.00 |
```

---

## 🚀 Chạy Tests

### Chạy Tất Cả Tests

```bash
npm test
```

### Chạy Tests Cụ Thể

```bash
# Chạy 1 file
npm test http-service.test.ts

# Chạy tests khớp pattern
npm test create-category

# Chạy integration tests
npm test integration
```

### Watch Mode (Tự động chạy khi code thay đổi)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Debug Tests

```typescript
// Thêm debug breakpoint
it('should create category', async () => {
  debugger;  // Set breakpoint here
  const result = await useCase.CreateANewCategory(data);
  console.log(result);  // Log output
});
```

---

## 📖 Ví Dụ Chi Tiết

### Unit Test - HTTP Service Layer

```typescript
// File: http-service.test.ts

describe('CategoryHttpService - CreateANewCategoryAPI', () => {
  let httpService: CategoryHttpService;
  let mockUseCase: jest.Mocked<ICategoryUseCase>;
  
  beforeEach(() => {
    mockUseCase = {
      CreateANewCategory: jest.fn(),
      // ... other methods
    } as any;
    httpService = new CategoryHttpService(mockUseCase);
  });
  
  // ✅ Test 1: Success case
  it('should create category successfully', async () => {
    // Arrange
    const mockId = 'uuid-123';
    mockUseCase.CreateANewCategory.mockResolvedValue(mockId);
    const req = createMockRequest({ name: 'Electronics' });
    const res = createMockResponse();
    
    // Act
    await httpService.CreateANewCategoryAPI(req, res);
    
    // Assert
    expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith({ name: 'Electronics' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Category created successfully',
      data: mockId
    });
  });
  
  // ❌ Test 2: Validation error
  it('should return 400 when name is missing', async () => {
    // Arrange
    const req = createMockRequest({});  // No name
    const res = createMockResponse();
    
    // Act
    await httpService.CreateANewCategoryAPI(req, res);
    
    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });
});
```

### Unit Test - UseCase Layer

```typescript
// File: usecase.test.ts

describe('CategoryUseCase - CreateANewCategory', () => {
  let useCase: CategoryUseCase;
  let mockRepository: jest.Mocked<IRepository>;
  
  beforeEach(() => {
    mockRepository = {
      insert: jest.fn(),
      // ... other methods
    } as any;
    useCase = new CategoryUseCase(mockRepository);
  });
  
  it('should create category with correct structure', async () => {
    // Arrange
    const dto = { name: 'Electronics', description: 'Test' };
    mockRepository.insert.mockResolvedValue(true);
    
    // Act
    const id = await useCase.CreateANewCategory(dto);
    
    // Assert
    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    
    const insertedData = mockRepository.insert.mock.calls[0][0];
    expect(insertedData).toMatchObject({
      name: 'Electronics',
      description: 'Test',
      status: ModelStatus.ACTIVE,
    });
    expect(insertedData.id).toBeDefined();
    expect(insertedData.created_at).toBeInstanceOf(Date);
  });
});
```

### Integration Test

```typescript
// File: create-category.integration.test.ts

describe('Integration - CreateCategory', () => {
  let app: Express;
  let sequelize: Sequelize;
  
  beforeAll(async () => {
    // Setup database, models, app
    sequelize = new Sequelize('sqlite::memory:');
    // ... setup
  });
  
  it('should create category end-to-end', async () => {
    // Arrange
    const data = { name: 'Electronics', description: 'Test' };
    
    // Act - Send HTTP request
    const response = await request(app)
      .post('/api/categories')
      .send(data)
      .expect(201);
    
    // Assert - Response
    expect(response.body).toMatchObject({
      message: 'Category created successfully',
      data: expect.any(String)
    });
    
    // Assert - Database
    const id = response.body.data;
    const saved = await sequelize.models.Category?.findByPk(id);
    
    expect(saved).toBeDefined();
    const savedData = saved?.get({ plain: true });
    expect(savedData.name).toBe('Electronics');
    expect(savedData.description).toBe('Test');
    expect(savedData.status).toBe(ModelStatus.ACTIVE);
  });
});
```

---

## 🔧 Troubleshooting

### ❗ Error: Cannot use import statement

**Nguyên nhân**: Jest không hiểu ES modules

**Giải pháp**: Kiểm tra `jest.config.js`
```javascript
export default {
  preset: 'ts-jest/presets/default-esm',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
```

### ❗ Error: Module not found

**Nguyên nhân**: Import path không đúng

**Giải pháp**: 
1. Check import paths có `.js` extension
2. Verify `moduleNameMapper` trong jest.config

### ❗ Tests chạy chậm

**Giải pháp**:
1. Chạy parallel: `npm test -- --maxWorkers=4`
2. Tách unit và integration tests
3. Mock database cho unit tests

### ❗ Mock không hoạt động

**Giải pháp**:
```typescript
// ✅ Reset mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// ✅ Verify mock setup
expect(mockFunction).toBeDefined();
```

---

## 📚 Học Thêm

### Resources
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)

### Test Patterns
- **AAA**: Arrange, Act, Assert
- **Given-When-Then**: BDD style
- **Test Pyramid**: Unit > Integration > E2E

### Books
- "The Art of Unit Testing" - Roy Osherove
- "Test Driven Development" - Kent Beck

---

## 🎓 Bài Tập Thực Hành

### Bài 1: Viết Unit Test cho getDetailCategoryAPI
```typescript
// TODO: Viết tests cho:
// - Success: Return category
// - Error: ID not found (404)
// - Error: ID missing (400)
```

### Bài 2: Viết Integration Test cho Update Category
```typescript
// TODO: Viết tests cho:
// - Update category successfully
// - Validation errors
// - Category not found
// - Data persists in database
```

### Bài 3: Viết Test cho Error Cases
```typescript
// TODO: Viết tests cho:
// - Network timeout
// - Database connection lost
// - Concurrent updates
```

---

## ✅ Checklist Khi Viết Tests

- [ ] Test case có tên rõ ràng
- [ ] Sử dụng AAA pattern
- [ ] Mock dependencies đúng cách
- [ ] Test cả success và error cases
- [ ] Verify mock calls với đúng parameters
- [ ] Clean up sau mỗi test (beforeEach/afterEach)
- [ ] Tests chạy độc lập (không phụ thuộc nhau)
- [ ] Coverage > 80% cho critical code
- [ ] Integration tests cover critical flows
- [ ] Documentation cho complex tests

---

## 📞 Support

Nếu có câu hỏi về testing, vui lòng:
1. Đọc kỹ guide này
2. Xem examples trong `__tests__` folders
3. Kiểm tra Jest documentation
4. Hỏi team members

Happy Testing! 🎉

