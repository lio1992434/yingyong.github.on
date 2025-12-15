import { Recipe } from '../types';

const STORAGE_KEY = 'chefnote_recipes_v1';

// Mock initial data
const MOCK_DATA: Recipe[] = [
  {
    id: '1',
    title: '经典培根蛋面',
    description: '一道传统的罗马意面，由鸡蛋、硬奶酪、腌猪肉和黑胡椒制成，口感浓郁。',
    tags: ['意式', '面食', '晚餐', '快手菜'],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    coverImage: 'https://picsum.photos/seed/carbonara/800/600',
    ingredients: [
      { name: '意大利面', amount: '400', unit: '克' },
      { name: '猪颊肉 (或培根)', amount: '150', unit: '克' },
      { name: '佩科里诺干酪', amount: '100', unit: '克' },
      { name: '鸡蛋', amount: '4', unit: '个' },
      { name: '黑胡椒', amount: '1', unit: '汤匙' }
    ],
    steps: [
      { instruction: '烧一锅水，水开后加入盐，将意大利面煮至劲道 (Al Dente)。' },
      { instruction: '将猪颊肉（或培根）切丁，煎至酥脆，然后离火备用。' },
      { instruction: '将鸡蛋和擦碎的干酪混合，加入少许煮面水搅拌均匀。' },
      { instruction: '将煮好的面条与煎好的肉混合，离火状态下迅速倒入蛋液搅拌，利用余温使蛋液乳化成浓稠酱汁。' }
    ]
  },
  {
    id: '2',
    title: '牛油果吐司',
    description: '简单、健康又美味的早餐主食，富含优质脂肪。',
    tags: ['早餐', '素食', '健康'],
    createdAt: Date.now() - 100000,
    updatedAt: Date.now() - 100000,
    coverImage: 'https://picsum.photos/seed/avocado/800/600',
    ingredients: [
      { name: '酸种面包', amount: '2', unit: '片' },
      { name: '成熟牛油果', amount: '1', unit: '个' },
      { name: '柠檬汁', amount: '1', unit: '茶匙' },
      { name: '辣椒碎', amount: '1', unit: '撮' }
    ],
    steps: [
      { instruction: '将面包烤至金黄酥脆。' },
      { instruction: '将牛油果去核取出果肉，加入柠檬汁、盐和黑胡椒捣碎成泥。' },
      { instruction: '将牛油果泥均匀涂抹在吐司上，撒上辣椒碎即可享用。' }
    ]
  }
];

export const getRecipes = (): Recipe[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with mock data for demo purposes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_DATA));
      return MOCK_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load recipes', e);
    return [];
  }
};

export const saveRecipe = (recipe: Recipe): void => {
  const recipes = getRecipes();
  const existingIndex = recipes.findIndex(r => r.id === recipe.id);
  
  if (existingIndex >= 0) {
    recipes[existingIndex] = { ...recipe, updatedAt: Date.now() };
  } else {
    recipes.unshift({ ...recipe, createdAt: Date.now(), updatedAt: Date.now() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
};

export const deleteRecipe = (id: string): void => {
  const recipes = getRecipes().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
};

export const exportData = (): string => {
    return localStorage.getItem(STORAGE_KEY) || '[]';
};