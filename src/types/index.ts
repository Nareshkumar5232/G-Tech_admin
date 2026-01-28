export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super-admin';
}

export interface Product {
  id: string;
  name: string;
  brand: 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'ASUS' | 'Acer' | 'MSI' | 'Samsung' | 'Other';
  category: 'New Laptops' | 'Used Laptops' | 'Accessories' | 'Networking & CCTV';
  condition: 'New' | 'Used';
  price: number;
  stock: number;
  images: string[];
  specs: string[];
  description: string;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockItems: number;
  deliveredToday: number;
}
