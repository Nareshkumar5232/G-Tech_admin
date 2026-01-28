import type { Admin, Product, Order, DashboardStats } from '@/types';

// Mock admin data
const ADMIN_EMAIL = 'admin@gtech.com';
const ADMIN_PASSWORD = 'admin123';

let currentAdmin: Admin | null = null;

export function loginAdmin(email: string, password: string): Admin | null {
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    currentAdmin = {
      id: 'admin-1',
      email: ADMIN_EMAIL,
      name: 'G-Tech Admin',
      role: 'super-admin',
    };
    localStorage.setItem('admin', JSON.stringify(currentAdmin));
    return currentAdmin;
  }
  return null;
}

export function logoutAdmin(): void {
  currentAdmin = null;
  localStorage.removeItem('admin');
}

export function getCurrentAdmin(): Admin | null {
  if (currentAdmin) return currentAdmin;
  
  const stored = localStorage.getItem('admin');
  if (stored) {
    currentAdmin = JSON.parse(stored);
    return currentAdmin;
  }
  return null;
}

// Mock products data
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Dell XPS 15',
    brand: 'Dell',
    category: 'New Laptops',
    condition: 'New',
    price: 125000,
    stock: 5,
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45'],
    specs: ['Intel Core i7-13700H', '16GB RAM', '512GB SSD', '15.6" FHD Display'],
    description: 'High-performance laptop for professionals',
    featured: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  // Add more mock products as needed
];

let products = [...mockProducts];

export function getProducts(): Product[] {
  return products;
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const newProduct: Product = {
    ...product,
    id: `prod-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(newProduct);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const index = products.findIndex(p => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

// Mock orders data
const mockOrders: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'ORD-2024-001',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '+91 9876543210',
    product: mockProducts[0],
    quantity: 1,
    totalPrice: 125000,
    status: 'pending',
    shippingAddress: {
      street: '123 MG Road',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India',
    },
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
];

let orders = [...mockOrders];

export function getOrders(): Order[] {
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function updateOrderStatus(
  id: string,
  status: Order['status'],
  trackingNumber?: string,
  cancelReason?: string
): Order | null {
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) return null;
  
  orders[index] = {
    ...orders[index],
    status,
    trackingNumber,
    cancelReason,
    updatedAt: new Date().toISOString(),
    deliveredAt: status === 'delivered' ? new Date().toISOString() : orders[index].deliveredAt,
  };
  return orders[index];
}

export function getDashboardStats(): DashboardStats {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.totalPrice, 0);
  const totalProducts = products.length;
  const lowStockItems = products.filter(p => p.stock < 5).length;
  
  const today = new Date().toDateString();
  const deliveredToday = orders.filter(
    o => o.deliveredAt && new Date(o.deliveredAt).toDateString() === today
  ).length;
  
  return {
    totalOrders,
    pendingOrders,
    totalRevenue,
    totalProducts,
    lowStockItems,
    deliveredToday,
  };
}
