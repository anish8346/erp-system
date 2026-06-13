
import { OperationsRepository } from './src/features/operations/repositories/operations.repository.js';
import prisma from './src/core/database/prisma.js';

async function test() {
  try {
    console.log('Fetching MOs...');
    const mos = await OperationsRepository.getMOs();
    console.log('Success! Found', mos.length, 'MOs');
    process.exit(0);
  } catch (err) {
    console.error('FAILED to fetch MOs:', err);
    process.exit(1);
  }
}

test();
