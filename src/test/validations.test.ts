import { describe, it, expect } from 'vitest';

describe('Data Validation Schemas', () => {
  it('client schema should validate correct data', async () => {
    const { clientSchema } = await import('@/lib/validations/client.schema');
    
    if (clientSchema) {
      const validClient = {
        first_name: 'Marie',
        last_name: 'Dupont',
        email: 'marie@test.com',
        phone: '+225 07 01 02 03',
      };
      
      const result = clientSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    }
  });

  it('employee schema should exist', async () => {
    const mod = await import('@/lib/validations/employee.schema');
    expect(mod).toBeDefined();
  });

  it('order schema should exist', async () => {
    const mod = await import('@/lib/validations/order.schema');
    expect(mod).toBeDefined();
  });

  it('product schema should exist', async () => {
    const mod = await import('@/lib/validations/product.schema');
    expect(mod).toBeDefined();
  });

  it('supplier schema should exist', async () => {
    const mod = await import('@/lib/validations/supplier.schema');
    expect(mod).toBeDefined();
  });

  it('invoice schema should exist', async () => {
    const mod = await import('@/lib/validations/invoice.schema');
    expect(mod).toBeDefined();
  });

  it('measurement schema should exist', async () => {
    const mod = await import('@/lib/validations/measurement.schema');
    expect(mod).toBeDefined();
  });

  it('pattern schema should exist', async () => {
    const mod = await import('@/lib/validations/pattern.schema');
    expect(mod).toBeDefined();
  });
});
