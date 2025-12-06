/**
 * UNIT TEST cho CategoryHttpService.CreateANewCategoryAPI
 * 
 * Unit Test là gì?
 * - Kiểm tra một đơn vị code nhỏ nhất (function, method) một cách độc lập
 * - Mock (giả lập) tất cả dependencies để tập trung test logic của unit đó
 * - Chạy nhanh, không cần database thật
 * 
 * Mục tiêu test:
 * - Verify validation logic (kiểm tra dữ liệu đầu vào)
 * - Verify response format (cấu trúc response trả về)
 * - Verify error handling (xử lý lỗi)
 * - Verify interaction với useCase (gọi đúng method với đúng tham số)
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response } from 'express';
import { CategoryHttpService } from '../http-service.js';
import type { ICategoryUseCase } from '../../../interface/index.js';

// Mock Response object để test
// Mục đích: Tạo một response giả lập để kiểm tra các method được gọi
const createMockResponse = () => {
  const res = {} as Response;
  
  // Mock các methods của Response
  res.status = jest.fn().mockReturnThis() as any;
  res.json = jest.fn().mockReturnThis() as any;
  
  return res;
};

// Mock Request object để test
const createMockRequest = (body: any = {}, params: any = {}) => {
  return {
    body,
    params
  } as Request;
};

describe('CategoryHttpService - CreateANewCategoryAPI', () => {
  // Declare variables for test
  let httpService: CategoryHttpService;
  let mockUseCase: jest.Mocked<ICategoryUseCase>;

  /**
   * beforeEach: Chạy trước mỗi test case
   * Mục đích: Setup môi trường test sạch cho mỗi test
   */
  beforeEach(() => {
    // Tạo mock useCase với tất cả methods
    mockUseCase = {
      CreateANewCategory: jest.fn(),
      getDetailCategory: jest.fn(),
      UpdateCategory: jest.fn(),
      DeleteCategory: jest.fn(),
      ListCategory: jest.fn(),
    } as any;

    // Khởi tạo httpService với mock useCase
    httpService = new CategoryHttpService(mockUseCase);
  });

  /**
   * TEST CASE 1: Success case - Happy path
   * Mô tả: Test khi tạo category thành công
   * Expected: Status 201, message success, data chứa ID
   */
  it('should create a new category successfully', async () => {
    // Arrange (Chuẩn bị)
    const mockCategoryId = '123e4567-e89b-12d3-a456-426614174000';
    const requestBody = {
      name: 'Electronics',
      description: 'Electronic devices',
      position: 1,
      image: 'https://example.com/image.jpg',
      parent_id: '123e4567-e89b-12d3-a456-426614174001'
    };

    // Mock useCase trả về ID thành công
    mockUseCase.CreateANewCategory.mockResolvedValue(mockCategoryId);

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act (Thực hiện)
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert (Kiểm tra kết quả)
    // 1. Verify useCase được gọi với đúng data
    expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith(requestBody);
    expect(mockUseCase.CreateANewCategory).toHaveBeenCalledTimes(1);

    // 2. Verify response status code là 201 (Created)
    expect(res.status).toHaveBeenCalledWith(201);

    // 3. Verify response body có đúng format
    expect(res.json).toHaveBeenCalledWith({
      message: 'Category created successfully',
      data: mockCategoryId
    });
  });

  /**
   * TEST CASE 2: Validation Error - Missing required fields
   * Mô tả: Test khi thiếu trường bắt buộc (name)
   * Expected: Status 400, error message
   */
  it('should return 400 when name is missing', async () => {
    // Arrange
    const requestBody = {
      description: 'Electronic devices'
      // name is missing - required field
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    // 1. useCase KHÔNG được gọi vì validation failed
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();

    // 2. Response status phải là 400 (Bad Request)
    expect(res.status).toHaveBeenCalledWith(400);

    // 3. Response phải chứa error message
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.any(String)
      })
    );
  });

  /**
   * TEST CASE 3: Validation Error - Invalid name length
   * Mô tả: Test khi name quá ngắn (< 2 characters)
   * Expected: Status 400 với error message cụ thể
   */
  it('should return 400 when name is too short', async () => {
    // Arrange
    const requestBody = {
      name: 'A' // Only 1 character - minimum is 2
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  /**
   * TEST CASE 4: Validation Error - Invalid URL format
   * Mô tả: Test khi image URL không đúng format
   * Expected: Status 400
   */
  it('should return 400 when image URL is invalid', async () => {
    // Arrange
    const requestBody = {
      name: 'Electronics',
      image: 'not-a-valid-url' // Invalid URL format
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * TEST CASE 5: Validation Error - Invalid UUID format
   * Mô tả: Test khi parent_id không phải UUID hợp lệ
   * Expected: Status 400
   */
  it('should return 400 when parent_id is not a valid UUID', async () => {
    // Arrange
    const requestBody = {
      name: 'Electronics',
      parent_id: 'invalid-uuid-format'
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * TEST CASE 6: UseCase returns null/falsy value
   * Mô tả: Test khi useCase trả về null (creation failed)
   * Expected: Status 400 với message thất bại
   */
  it('should return 400 when useCase fails to create category', async () => {
    // Arrange
    const requestBody = {
      name: 'Electronics'
    };

    // Mock useCase trả về null (failed)
    mockUseCase.CreateANewCategory.mockResolvedValue(null as any);

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    // 1. useCase được gọi
    expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith(requestBody);

    // 2. Response status là 400
    expect(res.status).toHaveBeenCalledWith(400);

    // 3. Response message báo lỗi creation failed
    expect(res.json).toHaveBeenCalledWith({
      message: 'Category creation failed'
    });
  });

  /**
   * TEST CASE 7: UseCase throws exception
   * Mô tả: Test khi useCase ném exception (database error, etc.)
   * Expected: Exception được propagate (hoặc handle tùy logic)
   */
  it('should throw error when useCase throws exception', async () => {
    // Arrange
    const requestBody = {
      name: 'Electronics'
    };

    const error = new Error('Database connection failed');
    mockUseCase.CreateANewCategory.mockRejectedValue(error);

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act & Assert
    // Expect the method to throw
    await expect(
      httpService.CreateANewCategoryAPI(req, res)
    ).rejects.toThrow('Database connection failed');
  });

  /**
   * TEST CASE 8: Optional fields are handled correctly
   * Mô tả: Test khi chỉ có required field (name)
   * Expected: Success với chỉ name, các field optional không bắt buộc
   */
  it('should create category with only required fields', async () => {
    // Arrange
    const mockCategoryId = '123e4567-e89b-12d3-a456-426614174000';
    const requestBody = {
      name: 'Electronics'
      // All other fields are optional
    };

    mockUseCase.CreateANewCategory.mockResolvedValue(mockCategoryId);

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).toHaveBeenCalledWith(requestBody);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Category created successfully',
      data: mockCategoryId
    });
  });

  /**
   * TEST CASE 9: Validation - name max length
   * Mô tả: Test khi name quá dài (> 50 characters)
   * Expected: Status 400
   */
  it('should return 400 when name exceeds maximum length', async () => {
    // Arrange
    const requestBody = {
      name: 'A'.repeat(51) // 51 characters - max is 50
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * TEST CASE 10: Validation - position must be integer
   * Mô tả: Test khi position là số thập phân (phải là integer)
   * Expected: Status 400
   */
  it('should return 400 when position is not an integer', async () => {
    // Arrange
    const requestBody = {
      name: 'Electronics',
      position: 1.5 // Not an integer
    };

    const req = createMockRequest(requestBody);
    const res = createMockResponse();

    // Act
    await httpService.CreateANewCategoryAPI(req, res);

    // Assert
    expect(mockUseCase.CreateANewCategory).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

/**
 * KẾT LUẬN - Những gì đã test:
 * 
 * 1. ✅ Happy Path: Tạo category thành công
 * 2. ✅ Validation: Thiếu required field
 * 3. ✅ Validation: Name quá ngắn
 * 4. ✅ Validation: Invalid URL
 * 5. ✅ Validation: Invalid UUID
 * 6. ✅ Error Handling: UseCase trả về null
 * 7. ✅ Error Handling: UseCase throw exception
 * 8. ✅ Optional Fields: Chỉ có required field
 * 9. ✅ Validation: Name quá dài
 * 10. ✅ Validation: Position không phải integer
 * 
 * COVERAGE: ~100% cho CreateANewCategoryAPI method
 */

