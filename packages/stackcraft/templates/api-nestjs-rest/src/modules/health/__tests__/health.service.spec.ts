import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = moduleRef.get<HealthService>(HealthService);
  });

  it('returns ok status', () => {
    expect(service.check()).toEqual({ status: 'ok' });
  });
});
