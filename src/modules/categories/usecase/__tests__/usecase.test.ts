/**
 * UNIT TEST cho CategoryUseCase.CreateANewCategory
 * 
 * Unit Test ở layer UseCase:
 * - Kiểm tra business logic
 * - Mock repository để tập trung test logic
 * - Verify data transformation (DTO -> Entity)
 * - Verify repository được gọi đúng
 * 
 * Khác biệt với HTTP Service Test:
 * - HTTP Service test: validation, HTTP protocol, request/response
 * - UseCase test: business logic, data transformation, orchestration
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CategoryUseCase } from '../index.js';
import type { IRepository } from '../../interface/index.js';
import type { CreateCategoryDTO } from '../../model/dto.js';
import { ModelStatus } from '../../../../share/model/base-model.js';
import type { Category } from '../../model/model.js';

describe('CategoryUseCase - CreateANewCategory', () => {
  let useCase: CategoryUseCase;
  let mockRepository: jest.Mocked<IRepository>;

  /**
   * Setup trước mỗi test
   */
  beforeEach(() => {
    // Mock repository với các methods
    mockRepository = {
      insert: jest.fn(),
      get: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    // Khởi tạo useCase với mock repository
    useCase = new CategoryUseCase(mockRepository);
  });

  /**
   * TEST CASE 1: Success - Create category với đầy đủ thông tin
   * Mô tả: Test khi tạo category với tất cả fields (required + optional)
   * Expected:
   * - Return UUID string
   * - Repository.insert được gọi với đúng data structure
   * - Data có đầy đủ fields: id, timestamps, status
   */
  it('should create a new category with all fields successfully', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics',
      description: 'Electronic devices',
      position: 1,
      image: 'https://example.com/image.jpg',
      parent_id: '123e4567-e89b-12d3-a456-426614174001'
    };

    // Mock repository.insert trả về true (success)
    mockRepository.insert.mockResolvedValue(true);

    // Act
    const result = await useCase.CreateANewCategory(createDTO);

    // Assert
    // 1. Verify result là UUID string
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    // UUID v7 format check (basic)
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

    // 2. Verify repository.insert được gọi đúng 1 lần
    expect(mockRepository.insert).toHaveBeenCalledTimes(1);
    // 3. Verify data structure passed to repository
    const insertedData = mockRepository.insert.mock.calls[0]?.[0] as Category;
    if(!insertedData){
        throw new Error('Inserted data is undefined');
    }
    // 3a. Verify có đầy đủ required fields từ DTO
    expect(insertedData.name).toBe(createDTO.name);
    expect(insertedData.description).toBe(createDTO.description);
    expect(insertedData.position).toBe(createDTO.position);
    expect(insertedData.image).toBe(createDTO.image);
    expect(insertedData.parent_id).toBe(createDTO.parent_id);

    // 3b. Verify auto-generated fields
    expect(insertedData.id).toBeDefined();
    expect(insertedData.status).toBe(ModelStatus.ACTIVE);
    expect(insertedData.created_at).toBeInstanceOf(Date);
    expect(insertedData.updated_at).toBeInstanceOf(Date);
    // 3c. Verify created_at và updated_at giống nhau khi tạo mới
    expect(insertedData.created_at?.getTime()).toBe(insertedData.updated_at?.getTime());
  });

  /**
   * TEST CASE 2: Success - Create category chỉ với required fields
   * Mô tả: Test khi tạo category với chỉ field bắt buộc (name)
   * Expected: Success, optional fields là undefined
   */
  it('should create category with only required fields', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics'
      // All optional fields are omitted
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    const result = await useCase.CreateANewCategory(createDTO);

    // Assert
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');

    const insertedData = mockRepository.insert.mock.calls[0]?.[0] as Category;
    
    // Required fields
    expect(insertedData.name).toBe('Electronics');
    
    // Optional fields should be undefined or as provided
    expect(insertedData.description).toBeUndefined();
    expect(insertedData.position).toBeUndefined();
    expect(insertedData.image).toBeUndefined();
    expect(insertedData.parent_id).toBeUndefined();

    // Auto-generated fields still exist
    expect(insertedData.id).toBeDefined();
    expect(insertedData.status).toBe(ModelStatus.ACTIVE);
    expect(insertedData.created_at).toBeInstanceOf(Date);
    expect(insertedData.updated_at).toBeInstanceOf(Date);
  });

  /**
   * TEST CASE 3: UUID Generation - Uniqueness
   * Mô tả: Test tạo nhiều categories, verify mỗi category có UUID khác nhau
   * Expected: Mỗi lần gọi tạo UUID unique
   */
  it('should generate unique IDs for multiple categories', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Test Category'
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act - Create 3 categories
    const id1 = await useCase.CreateANewCategory(createDTO);
    const id2 = await useCase.CreateANewCategory(createDTO);
    const id3 = await useCase.CreateANewCategory(createDTO);

    // Assert - All IDs are unique
    expect(id1).not.toBe(id2);
    expect(id2).not.toBe(id3);
    expect(id1).not.toBe(id3);

    // Verify insert was called 3 times
    expect(mockRepository.insert).toHaveBeenCalledTimes(3);
  });

  /**
   * TEST CASE 4: Default Status
   * Mô tả: Verify rằng status mặc định luôn là ACTIVE khi tạo mới
   * Expected: status = 'active'
   */
  it('should set default status as ACTIVE', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics'
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    await useCase.CreateANewCategory(createDTO);

    // Assert
    const insertedData = mockRepository.insert.mock.calls[0]?.[0] as Category;
    expect(insertedData.status).toBe(ModelStatus.ACTIVE);
    expect(insertedData.status).not.toBe(ModelStatus.DELETED);
    expect(insertedData.status).not.toBe(ModelStatus.INACTIVE);
  });

  /**
   * TEST CASE 5: Timestamps - Created and Updated
   * Mô tả: Verify timestamps được tạo đúng
   * Expected: created_at và updated_at là Date objects và gần thời gian hiện tại
   */
  it('should set correct timestamps', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics'
    };

    mockRepository.insert.mockResolvedValue(true);

    const beforeTime = new Date();
    
    // Act
    await useCase.CreateANewCategory(createDTO);

    const afterTime = new Date();

    // Assert
    const insertedData = mockRepository.insert.mock.calls[0]?.[0] as Category;
    
    // Timestamps are Date objects
    expect(insertedData.created_at).toBeInstanceOf(Date);
    expect(insertedData.updated_at).toBeInstanceOf(Date);

    // Timestamps are within reasonable range (before <= timestamp <= after)
    expect(insertedData.created_at?.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(insertedData.created_at?.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });

  /**
   * TEST CASE 6: Repository throws error
   * Mô tả: Test khi repository.insert throw exception
   * Expected: Exception được propagate ra ngoài
   */
  it('should throw error when repository fails', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics'
    };

    const error = new Error('Database connection failed');
    mockRepository.insert.mockRejectedValue(error);

    // Act & Assert
    await expect(
      useCase.CreateANewCategory(createDTO)
    ).rejects.toThrow('Database connection failed');

    // Verify insert was attempted
    expect(mockRepository.insert).toHaveBeenCalledTimes(1);
  });

  /**
   * TEST CASE 7: Data Transformation - DTO to Entity
   * Mô tả: Verify useCase transform DTO thành Entity đúng cấu trúc
   * Expected: Entity có tất cả fields của DTO + auto-generated fields
   */
  it('should correctly transform DTO to Entity', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics',
      description: 'Electronic devices',
      position: 5,
      image: 'https://example.com/image.jpg',
      parent_id: '123e4567-e89b-12d3-a456-426614174001'
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    await useCase.CreateANewCategory(createDTO);

    // Assert
    const entity = mockRepository.insert.mock.calls[0]?.[0] as Category;

    // DTO fields preserved
    expect(entity.name).toBe(createDTO.name);
    expect(entity.description).toBe(createDTO.description);
    expect(entity.position).toBe(createDTO.position);
    expect(entity.image).toBe(createDTO.image);
    expect(entity.parent_id).toBe(createDTO.parent_id);

    // Additional entity fields added
    expect(entity).toHaveProperty('id');
    expect(entity).toHaveProperty('status');
    expect(entity).toHaveProperty('created_at');
    expect(entity).toHaveProperty('updated_at');

    // Total fields check
    const dtoKeys = Object.keys(createDTO);
    const entityKeys = Object.keys(entity);
    
    // Entity should have more fields than DTO (id, status, timestamps)
    expect(entityKeys.length).toBeGreaterThan(dtoKeys.length);
  });

  /**
   * TEST CASE 8: Return value type
   * Mô tả: Verify return value là string (UUID)
   * Expected: typeof result === 'string'
   */
  it('should return string type (UUID)', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics'
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    const result = await useCase.CreateANewCategory(createDTO);

    // Assert
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  /**
   * TEST CASE 9: Repository insert called with correct structure
   * Mô tả: Deep verification của data structure passed to repository
   * Expected: Object structure phải match Category interface
   */
  it('should call repository.insert with correct Category structure', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics',
      description: 'Test desc',
      position: 1
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    await useCase.CreateANewCategory(createDTO);

    // Assert
    expect(mockRepository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        status: expect.any(String),
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      })
    );
  });

  /**
   * TEST CASE 10: Special characters in name
   * Mô tả: Test khi name có ký tự đặc biệt
   * Expected: Name được preserve nguyên vẹn
   */
  it('should handle special characters in name', async () => {
    // Arrange
    const createDTO: CreateCategoryDTO = {
      name: 'Electronics & Gadgets (2024)'
    };

    mockRepository.insert.mockResolvedValue(true);

    // Act
    await useCase.CreateANewCategory(createDTO);

    // Assert
    const insertedData = mockRepository.insert.mock.calls[0]?.[0] as Category;
    expect(insertedData.name).toBe('Electronics & Gadgets (2024)');
  });
});

/**
 * KẾT LUẬN - Những gì đã test ở UseCase layer:
 * 
 * 1. ✅ Business Logic: Tạo category với đầy đủ fields
 * 2. ✅ Business Logic: Tạo category với chỉ required fields
 * 3. ✅ UUID Generation: Uniqueness của IDs
 * 4. ✅ Default Values: Status mặc định là ACTIVE
 * 5. ✅ Timestamps: created_at và updated_at
 * 6. ✅ Error Handling: Repository throws error
 * 7. ✅ Data Transformation: DTO to Entity
 * 8. ✅ Return Type: UUID string
 * 9. ✅ Repository Call: Correct structure
 * 10. ✅ Edge Case: Special characters
 * 
 * SO SÁNH với HTTP Service Test:
 * - HTTP Service: Request/Response, Validation (Zod schema)
 * - UseCase: Business logic, Data transformation, Default values
 * 
 * Cả 2 layers test khác nhau nhưng bổ sung cho nhau!
 */

