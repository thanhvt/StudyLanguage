import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DictionaryService } from './dictionary.service';

// Mock global fetch
global.fetch = jest.fn();

describe('DictionaryService', () => {
  let service: DictionaryService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [DictionaryService],
    }).compile();

    service = module.get<DictionaryService>(DictionaryService);
    // Reset cache trước mỗi test
    (service as any).cache.clear();
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('lookup', () => {
    const mockApiResponse = [
      {
        word: 'hello',
        phonetic: '/həˈloʊ/',
        phonetics: [
          { text: '/həˈloʊ/', audio: 'https://example.com/hello.mp3' },
        ],
        meanings: [
          {
            partOfSpeech: 'noun',
            definitions: [
              {
                definition: 'A greeting',
                example: 'She said hello',
              },
            ],
          },
        ],
      },
    ];

    it('nên tra từ thành công', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      // Act
      const result = await service.lookup('hello');

      // Assert
      expect(result.word).toBe('hello');
      expect(result.ipa).toBe('/həˈloʊ/');
      expect(result.audio).toBe('https://example.com/hello.mp3');
      expect(result.meanings).toHaveLength(1);
      expect(result.meanings[0].partOfSpeech).toBe('noun');
      expect(result.meanings[0].definitions[0].definition).toBe('A greeting');
    });

    it('nên cache kết quả và trả về từ cache khi gọi lại', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      // Act - gọi 2 lần
      await service.lookup('hello');
      const cached = await service.lookup('hello');

      // Assert - fetch chỉ gọi 1 lần vì lần 2 lấy từ cache
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(cached.word).toBe('hello');
    });

    it('nên normalize từ về lowercase', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockApiResponse),
      });

      // Act
      await service.lookup('  HELLO  ');

      // Assert
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/hello'),
      );
    });

    it('nên throw NotFoundException khi API trả về 404', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(service.lookup('xyznonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('nên throw khi API lỗi server', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      // Act & Assert
      await expect(service.lookup('hello')).rejects.toThrow(NotFoundException);
    });

    it('nên throw khi fetch reject (network error)', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(service.lookup('hello')).rejects.toThrow(NotFoundException);
    });

    it('nên xử lý trường hợp không có phonetics', async () => {
      // Arrange
      const noPhoneticResponse = [
        {
          word: 'test',
          meanings: [
            {
              partOfSpeech: 'verb',
              definitions: [{ definition: 'To try' }],
            },
          ],
        },
      ];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(noPhoneticResponse),
      });

      // Act
      const result = await service.lookup('test');

      // Assert
      expect(result.ipa).toBeNull();
      expect(result.audio).toBeNull();
    });
  });
});
