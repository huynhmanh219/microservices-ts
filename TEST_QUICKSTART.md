# Testing Quick Start 🚀

## Các File Test Đã Tạo

### 1️⃣ Unit Test - HTTP Service Layer
📁 `src/modules/categories/infras/transport/__tests__/http-service.test.ts`

**Test gì?**
- Validation của request body (Zod schema)
- HTTP response format (status code, JSON structure)
- Error handling (validation errors, useCase failures)

**Số lượng test cases**: 10 tests
- ✅ Success: Create category với đầy đủ fields
- ❌ Validation errors: missing fields, invalid format, length
- ⚠️ Error handling: useCase failures, exceptions

### 2️⃣ Unit Test - UseCase Layer
📁 `src/modules/categories/usecase/__tests__/usecase.test.ts`

**Test gì?**
- Business logic (data transformation DTO → Entity)
- UUID generation (uniqueness)
- Default values (status, timestamps)
- Repository interaction

**Số lượng test cases**: 10 tests
- ✅ Data transformation đúng
- ✅ Auto-generated fields (id, status, timestamps)
- ✅ Repository được gọi với đúng data structure

### 3️⃣ Integration Test - End-to-End Flow
📁 `src/modules/categories/__tests__/integration/create-category.integration.test.ts`

**Test gì?**
- Toàn bộ flow: HTTP → UseCase → Database
- Data persistence (verify data được lưu đúng)
- Real HTTP requests với Supertest
- In-memory SQLite database

**Số lượng test cases**: 12 tests
- 🌈 End-to-end success flow
- 🚫 Validation không cho lưu vào DB
- 📊 Data integrity (timestamps, status, unique IDs)

---

## Chạy Tests

```bash
# Chạy TẤT CẢ tests
npm test

# Chạy và xem khi code thay đổi
npm run test:watch

# Xem coverage report
npm run test:coverage

# Chạy test cụ thể
npm test http-service.test.ts
npm test usecase.test.ts
npm test integration

# Chạy với verbose output
npm test -- --verbose
```

---

## Kết Quả Mong Đợi

Khi chạy `npm test`, bạn sẽ thấy:

```
PASS  src/modules/categories/infras/transport/__tests__/http-service.test.ts
  CategoryHttpService - CreateANewCategoryAPI
    ✓ should create a new category successfully (5ms)
    ✓ should return 400 when name is missing (3ms)
    ✓ should return 400 when name is too short (2ms)
    ... 7 more tests

PASS  src/modules/categories/usecase/__tests__/usecase.test.ts
  CategoryUseCase - CreateANewCategory
    ✓ should create category with all fields successfully (4ms)
    ✓ should create category with only required fields (3ms)
    ✓ should generate unique IDs (6ms)
    ... 7 more tests

PASS  src/modules/categories/__tests__/integration/create-category.integration.test.ts
  Integration Test - CreateANewCategory Flow
    ✓ should create category through entire stack (150ms)
    ✓ should return 400 and not save to DB when validation fails (45ms)
    ✓ should create multiple categories with unique IDs (200ms)
    ... 9 more tests

Test Suites: 3 passed, 3 total
Tests:       32 passed, 32 total
Time:        3.456s
```

---

## Cấu Trúc Testing

```
📦 microservices-ts
├── 📄 jest.config.js                 # Jest configuration
├── 📄 TESTING_GUIDE.md               # Hướng dẫn chi tiết
├── 📄 TEST_QUICKSTART.md             # File này - quick reference
├── 📄 package.json                   # Test scripts
└── 📁 src/modules/categories/
    ├── 📁 infras/transport/
    │   └── 📁 __tests__/
    │       └── http-service.test.ts        # Unit test HTTP layer
    ├── 📁 usecase/
    │   └── 📁 __tests__/
    │       └── usecase.test.ts             # Unit test UseCase layer
    └── 📁 __tests__/integration/
        └── create-category.integration.test.ts  # Integration test
```

---

## Hiểu Về Tests

### Unit Test vs Integration Test

| Aspect | Unit Test | Integration Test |
|--------|-----------|------------------|
| **Mock?** | ✅ Mock tất cả | ❌ Không mock |
| **Database** | ❌ Mock | ✅ In-memory SQLite |
| **Speed** | ⚡ Fast (~5ms/test) | 🐌 Slower (~100ms/test) |
| **Test** | 1 function | Nhiều layers |

### Test Coverage Map

```
HTTP Request
    ↓
┌─────────────────────────┐
│ CategoryHttpService     │ ← 🧪 Unit Test 1: http-service.test.ts
│ - Validation (Zod)      │    • Mock UseCase
│ - Request/Response      │    • Test validation
└─────────────────────────┘    • Test response format
    ↓
┌─────────────────────────┐
│ CategoryUseCase         │ ← 🧪 Unit Test 2: usecase.test.ts
│ - Business Logic        │    • Mock Repository
│ - Data Transformation   │    • Test data transformation
└─────────────────────────┘    • Test default values
    ↓
┌─────────────────────────┐
│ MySQLCategoryRepository │
│ - Database Operations   │
└─────────────────────────┘
    ↓
Database

                           ← 🧪 Integration Test: create-category.integration.test.ts
                              • Test toàn bộ flow
                              • Real database (in-memory)
```

---

## Test Examples

### 1. Unit Test Example

```typescript
it('should return 400 when name is missing', async () => {
  // Arrange - Setup
  const req = { body: {} };  // No name
  const res = mockResponse();
  
  // Act - Execute
  await httpService.CreateANewCategoryAPI(req, res);
  
  // Assert - Verify
  expect(res.status).toHaveBeenCalledWith(400);
  expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
});
```

### 2. Integration Test Example

```typescript
it('should create category end-to-end', async () => {
  // Act - Send real HTTP request
  const response = await request(app)
    .post('/api/categories')
    .send({ name: 'Electronics' })
    .expect(201);
  
  // Assert - Check database
  const saved = await db.findById(response.body.data);
  expect(saved.name).toBe('Electronics');
});
```

---

## Troubleshooting

### ❌ Error: Cannot find module
**Fix**: Chạy `npm install`

### ❌ Tests fail với "Module not found"
**Fix**: Check import paths có `.js` extension:
```typescript
// ✅ Correct
import { CategoryHttpService } from '../http-service.js';

// ❌ Wrong
import { CategoryHttpService } from '../http-service';
```

### ❌ Test chạy chậm
**Fix**: Chạy parallel:
```bash
npm test -- --maxWorkers=4
```

---

## Học Tiếp

1. 📖 Đọc `TESTING_GUIDE.md` để hiểu sâu hơn
2. 🔍 Xem code trong các file test để học patterns
3. ✏️ Thử viết tests cho các APIs khác (update, delete, list)
4. 📊 Chạy `npm run test:coverage` để xem coverage report

---

## Tóm Tắt Nhanh

✅ **Đã Setup**:
- Jest + ts-jest
- 3 test files (32 test cases)
- Unit tests cho HTTP Service & UseCase
- Integration test cho toàn bộ flow
- Hướng dẫn chi tiết

✅ **Có Thể Chạy**:
```bash
npm test                  # Chạy tất cả
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

✅ **Đã Test**:
- ✅ Success flows
- ❌ Validation errors
- ⚠️ Error handling
- 📊 Data integrity

🎉 **Ready to Go!**

