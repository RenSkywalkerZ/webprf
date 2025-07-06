// 🎯 EDIT PRICES HERE - This is where you configure all competition prices for each batch
export const BATCH_PRICES = {
  1: {
    name: 'Batch 1',
    // 💰 BATCH 1 PRICES - Edit these values (in IDR)
    'physics-competition': 75000,
    'scientific-writing': 50000,
    'lomba-robotik': 100000,
    'science-project': 60000,
    'lomba-praktikum': 65000,
    'lomba-roket-air': 70000,
    'depict-physics': 45000,
    'cerdas-cermat': 40000,
  },
  2: {
    name: 'Batch 2',
    // 💰 BATCH 2 PRICES - Edit these values (in IDR)
    'physics-competition': 90000,
    'scientific-writing': 60000,
    'lomba-robotik': 120000,
    'science-project': 75000,
    'lomba-praktikum': 80000,
    'lomba-roket-air': 85000,
    'depict-physics': 55000,
    'cerdas-cermat': 50000,
  },
  3: {
    name: 'Batch 3',
    // 💰 BATCH 3 PRICES - Edit these values (in IDR)
    'physics-competition': 110000,
    'scientific-writing': 75000,
    'lomba-robotik': 150000,
    'science-project': 90000,
    'lomba-praktikum': 95000,
    'lomba-roket-air': 100000,
    'depict-physics': 65000,
    'cerdas-cermat': 60000,
  },
};

// 🔧 Competition ID mapping - Don't change these unless you change the database
export const COMPETITION_IDS = {
  '3c8c39b3-c7f5-4b2f-9190-9fefe00bff77': 'physics-competition',
  'e3469c41-c184-4f79-ad1d-74598a16972d': 'scientific-writing',
  '7ac68afd-b54b-4c37-b4cf-b0095d99054d': 'lomba-robotik',
  'a8b70ed2-7dcb-4c64-87a3-26d06ec77ace': 'science-project',
  'f5e2c366-5de1-4b56-bcb7-d106004d2af5': 'lomba-praktikum',
  'a41493cd-68e0-446a-b71c-e94e795bc22c': 'lomba-roket-air',
  '9b466937-60e7-41e2-ab55-41f8c5ce62e9': 'depict-physics',
  '9d490b2b-966b-4277-b58e-2ab7e73d0473': 'cerdas-cermat',
};

export function getBatchPrice(
  batchId: number,
  competitionId: string
): number {
  const batch = BATCH_PRICES[batchId as keyof typeof BATCH_PRICES];
  if (!batch) return 0;

  return batch[competitionId as keyof typeof batch] || 0;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}
