/**
 * INTEGRATION TEST cho CreateANewCategory Flow
 * 
 * Integration Test là gì?
 * - Kiểm tra sự tương tác giữa nhiều components/layers
 * - Test toàn bộ flow: HTTP -> UseCase -> Repository
 * - Có thể sử dụng in-memory database hoặc test database
 * - Chạy chậm hơn unit test nhưng đảm bảo toàn bộ system hoạt động
 * 
 * Khác biệt với Unit Test:
 * ┌─────────────────────┬──────────────────────┬────────────────────────┐
 * │                     │ Unit Test            │ Integration Test       │
 * ├─────────────────────┼──────────────────────┼────────────────────────┤
 * │ Scope               │ 1 function/method    │ Multiple layers        │
 * │ Dependencies        │ All mocked           │ Real (or in-memory)    │
 * │ Speed               │ Fast (ms)            │ Slower (seconds)       │
 * │ Database            │ Mocked               │ Real/In-memory         │
 * │ Purpose             │ Test logic           │ Test integration       │
 * └─────────────────────┴──────────────────────┴────────────────────────┘
 * 
 * Test này sẽ:
 * 1. Setup Express app với real routes
 * 2. Sử dụng Sequelize với in-memory SQLite (hoặc test DB)
 * 3. Gửi HTTP request thật qua supertest
 * 4. Verify data được lưu vào database
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import express, { type Express } from 'express';
import { DataTypes, Sequelize } from 'sequelize';
import { CategoryHttpService } from '../../infras/transport/http-service.js';
import { CategoryUseCase } from '../../usecase/index.js';
import { MySQLCategoryRepository } from '../../infras/repository/repo.js';
import { ModelStatus } from '../../../../share/model/base-model.js';

/**
 * Setup Integration Test Environment
 */
describe('Integration Test - CreateANewCategory Flow', () => {
  let app: Express;
  let sequelize: Sequelize;
  let httpService: CategoryHttpService;
  let repository: MySQLCategoryRepository;

  /**
   * beforeAll: Setup toàn bộ môi trường test
   * - Tạo in-memory database (SQLite)
   * - Define model
   * - Sync database
   * - Setup Express routes
   */
  beforeAll(async () => {
    // 1. Tạo in-memory SQLite database cho test
    sequelize = new Sequelize('sqlite::memory:', {
      logging: false, // Tắt logging cho test
    });

    // 2. Define Category model trong Sequelize
    sequelize.define('Category', {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      position: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      parent_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ModelStatus.ACTIVE,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    }, {
      tableName: 'categories',
      timestamps: false, // We handle timestamps manually
    });

    // 3. Sync database (create tables)
    await sequelize.sync({ force: true });

    // 4. Initialize layers (Repository -> UseCase -> HttpService)
    repository = new MySQLCategoryRepository(sequelize, 'Category');
    const useCase = new CategoryUseCase(repository);
    httpService = new CategoryHttpService(useCase);

    // 5. Setup Express app với routes
    app = express();
    app.use(express.json());
    
    // Register routes
    app.post('/api/categories', (req, res) => 
      httpService.CreateANewCategoryAPI(req, res)
    );
  });

  /**
   * afterAll: Cleanup sau khi test xong
   */
  afterAll(async () => {
    await sequelize.close();
  });

  /**
   * beforeEach: Reset database trước mỗi test
   */
  beforeEach(async () => {
    // Clear all data
    await sequelize.models.Category?.destroy({ where: {}, truncate: true });
  });

  /**
   * TEST CASE 1: End-to-End Success Flow
   * Mô tả: Test toàn bộ flow từ HTTP request đến database
   * Expected:
   * - HTTP status 201
   * - Response có data với UUID
   * - Data được lưu vào database
   */
  it('should create category through entire stack', async () => {
    // Arrange
    const categoryData = {
      name: 'Electronics',
      description: 'Electronic devices',
      position: 1,
      image: 'https://example.com/electronics.jpg',
      parent_id: '123e4567-e89b-12d3-a456-426614174001'
    };

    // Act - Gửi HTTP POST request
    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    // Assert - Response structure
    expect(response.body).toHaveProperty('message', 'Category created successfully');
    expect(response.body).toHaveProperty('data');
    
    const categoryId = response.body.data;
    expect(typeof categoryId).toBe('string');
    expect(categoryId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // Assert - Data in database
    const savedCategory = await sequelize.models.Category?.findByPk(categoryId);
    
    expect(savedCategory).toBeDefined();
    
    const categoryObj = savedCategory?.get({ plain: true });
    expect(categoryObj.name).toBe(categoryData.name);
    expect(categoryObj.description).toBe(categoryData.description);
    expect(categoryObj.position).toBe(categoryData.position);
    expect(categoryObj.image).toBe(categoryData.image);
    expect(categoryObj.parent_id).toBe(categoryData.parent_id);
    expect(categoryObj.status).toBe(ModelStatus.ACTIVE);
    expect(categoryObj.created_at).toBeDefined();
    expect(categoryObj.updated_at).toBeDefined();
  });

  /**
   * TEST CASE 2: Validation Error Flow
   * Mô tả: Test khi validation fail, data KHÔNG được lưu vào database
   * Expected:
   * - HTTP status 400
   * - Database không có record mới
   */
  it('should return 400 and not save to DB when validation fails', async () => {
    // Arrange - Invalid data (name too short)
    const invalidData = {
      name: 'A' // Only 1 character, minimum is 2
    };

    // Count records before
    const countBefore = await sequelize.models.Category?.count();

    // Act
    const response = await request(app)
      .post('/api/categories')
      .send(invalidData)
      .expect(400);

    // Assert - Response has error message
    expect(response.body).toHaveProperty('message');

    // Assert - No new record in database
    const countAfter = await sequelize.models.Category?.count();
    expect(countAfter).toBe(countBefore);
  });

  /**
   * TEST CASE 3: Create multiple categories
   * Mô tả: Test tạo nhiều categories liên tiếp
   * Expected: Mỗi category có ID unique và được lưu đúng
   */
  it('should create multiple categories with unique IDs', async () => {
    // Arrange
    const categories = [
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Books' }
    ];

    // Act - Create 3 categories
    const ids: string[] = [];
    for (const cat of categories) {
      const response = await request(app)
        .post('/api/categories')
        .send(cat)
        .expect(201);
      
      ids.push(response.body.data);
    }

    // Assert - All IDs are unique
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);

    // Assert - All categories exist in database
    const count = await sequelize.models.Category?.count();
    expect(count).toBe(3);

    // Assert - Each category has correct name
    for (let i = 0; i < categories.length; i++) {
      const category = await sequelize.models.Category?.findByPk(ids[i]);
      const catObj = category?.get({ plain: true });
      if(!catObj){
        throw new Error('Category object is undefined');
      }
      expect(catObj.name).toBe(categories[i]?.name);
    }
  });

  /**
   * TEST CASE 4: Category with only required fields
   * Mô tả: Test tạo category với chỉ field bắt buộc
   * Expected: Optional fields là null trong database
   */
  it('should save category with only required fields', async () => {
    // Arrange
    const categoryData = {
      name: 'Minimal Category'
      // No optional fields
    };

    // Act
    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    const categoryId = response.body.data;

    // Assert - Check database
    const savedCategory = await sequelize.models.Category?.findByPk(categoryId);
    const catObj = savedCategory?.get({ plain: true });

    expect(catObj.name).toBe('Minimal Category');
    expect(catObj.description).toBeNull();
    expect(catObj.position).toBeNull();
    expect(catObj.image).toBeNull();
    expect(catObj.parent_id).toBeNull();
    
    // Auto-generated fields should exist
    expect(catObj.id).toBeDefined();
    expect(catObj.status).toBe(ModelStatus.ACTIVE);
    expect(catObj.created_at).toBeDefined();
    expect(catObj.updated_at).toBeDefined();
  });

  /**
   * TEST CASE 5: Invalid URL format
   * Mô tả: Test khi image URL không hợp lệ
   * Expected: 400 error, không lưu database
   */
  it('should reject invalid image URL', async () => {
    // Arrange
    const invalidData = {
      name: 'Electronics',
      image: 'not-a-url'
    };

    const countBefore = await sequelize.models.Category?.count();

    // Act
    await request(app)
      .post('/api/categories')
      .send(invalidData)
      .expect(400);

    // Assert - No new record
    const countAfter = await sequelize.models.Category?.count();
    expect(countAfter).toBe(countBefore);
  });

  /**
   * TEST CASE 6: Invalid parent_id UUID
   * Mô tả: Test khi parent_id không phải UUID hợp lệ
   * Expected: 400 error
   */
  it('should reject invalid parent_id format', async () => {
    // Arrange
    const invalidData = {
      name: 'Electronics',
      parent_id: 'not-a-uuid'
    };

    // Act
    await request(app)
      .post('/api/categories')
      .send(invalidData)
      .expect(400);
  });

  /**
   * TEST CASE 7: Position as non-integer
   * Mô tả: Test khi position là số thập phân
   * Expected: 400 error
   */
  it('should reject non-integer position', async () => {
    // Arrange
    const invalidData = {
      name: 'Electronics',
      position: 1.5
    };

    // Act
    await request(app)
      .post('/api/categories')
      .send(invalidData)
      .expect(400);
  });

  /**
   * TEST CASE 8: Name max length validation
   * Mô tả: Test khi name quá dài (> 50 chars)
   * Expected: 400 error
   */
  it('should reject name exceeding max length', async () => {
    // Arrange
    const invalidData = {
      name: 'A'.repeat(51) // 51 characters
    };

    // Act
    await request(app)
      .post('/api/categories')
      .send(invalidData)
      .expect(400);
  });

  /**
   * TEST CASE 9: Timestamps verification
   * Mô tả: Verify timestamps được tạo và lưu đúng
   * Expected: created_at và updated_at gần thời gian hiện tại
   */
  it('should set correct timestamps in database', async () => {
    // Arrange
    const categoryData = { name: 'Test Category' };
    const beforeTime = new Date();

    // Act
    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    const afterTime = new Date();
    const categoryId = response.body.data;

    // Assert
    const savedCategory = await sequelize.models.Category?.findByPk(categoryId);
    const catObj = savedCategory?.get({ plain: true });

    const createdAt = new Date(catObj.created_at);
    const updatedAt = new Date(catObj.updated_at);

    // Timestamps should be within test execution time range
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(createdAt.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    
    // created_at should equal updated_at for new records
    expect(createdAt.getTime()).toBe(updatedAt.getTime());
  });

  /**
   * TEST CASE 10: Status default value
   * Mô tả: Verify status mặc định là ACTIVE
   * Expected: status trong DB là 'active'
   */
  it('should set default status as ACTIVE in database', async () => {
    // Arrange
    const categoryData = { name: 'Test Category' };

    // Act
    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    const categoryId = response.body.data;

    // Assert
    const savedCategory = await sequelize.models.Category?.findByPk(categoryId);
    const catObj = savedCategory?.get({ plain: true });

    expect(catObj.status).toBe(ModelStatus.ACTIVE);
  });

  /**
   * TEST CASE 11: Special characters handling
   * Mô tả: Test category name với ký tự đặc biệt
   * Expected: Data được lưu nguyên vẹn
   */
  it('should handle special characters in name', async () => {
    // Arrange
    const categoryData = {
      name: 'Electronics & Gadgets (2024)',
      description: 'Test with "quotes" & symbols!'
    };

    // Act
    const response = await request(app)
      .post('/api/categories')
      .send(categoryData)
      .expect(201);

    const categoryId = response.body.data;

    // Assert
    const savedCategory = await sequelize.models.Category?.findByPk(categoryId);
    const catObj = savedCategory?.get({ plain: true });

    expect(catObj.name).toBe('Electronics & Gadgets (2024)');
    expect(catObj.description).toBe('Test with "quotes" & symbols!');
  });

  /**
   * TEST CASE 12: Empty request body
   * Mô tả: Test khi không gửi data
   * Expected: 400 error
   */
  it('should reject empty request body', async () => {
    // Act
    await request(app)
      .post('/api/categories')
      .send({})
      .expect(400);
  });
});

/**
 * KẾT LUẬN - Integration Test Coverage:
 * 
 * ✅ HAPPY PATHS:
 * 1. End-to-end success flow
 * 2. Multiple categories creation
 * 3. Only required fields
 * 4. Special characters handling
 * 
 * ✅ VALIDATION ERRORS:
 * 5. Name too short
 * 6. Invalid URL format
 * 7. Invalid UUID format
 * 8. Non-integer position
 * 9. Name too long
 * 10. Empty request
 * 
 * ✅ DATA INTEGRITY:
 * 11. Timestamps correctness
 * 12. Default status value
 * 13. Unique ID generation
 * 14. Data persistence verification
 * 
 * GIẢI THÍCH CÁCH CHẠY:
 * 
 * npm test                     # Chạy tất cả tests
 * npm test -- create-category  # Chạy chỉ file này
 * npm run test:coverage        # Xem coverage report
 * 
 * Integration test này đảm bảo:
 * - HTTP layer hoạt động đúng
 * - UseCase xử lý business logic đúng
 * - Repository lưu data vào database đúng
 * - Toàn bộ flow từ đầu đến cuối hoạt động
 */

