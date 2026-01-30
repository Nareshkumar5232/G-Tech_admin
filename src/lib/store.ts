import type { Admin, Product, Order, DashboardStats } from '@/types';
import axios from 'axios';

const API_URL = 'https://g-tech-backend-1.onrender.com/api';
const STORAGE_KEYS = {
  ADMIN: 'gtech_admin_user',
  TOKEN: 'gtech_admin_token',
};

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// --- Auth Functions ---

export async function loginAdmin(email: string, password: string): Promise<Admin | null> {
  try {
    // Current backend might not have separate admin login, but we can reuse login or check role
    const res = await axios.post(`${API_URL}/auth/login`, { mail: email, password });
    if (res.data.token && res.data.user) {
      // Check if user is admin
      if (res.data.user.role === 'admin' || res.data.user.role === 'super-admin') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
        const admin: Admin = {
          id: res.data.user.id || res.data.user._id,
          email: res.data.user.email || res.data.user.mail,
          name: res.data.user.name,
          role: res.data.user.role
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
        return admin;
      } else {
        console.error("User is not an admin");
        return null;
      }
    }
  } catch (error: any) {
    if (error.response) {
      console.error("Admin Login failed - Status:", error.response.status);
      console.error("Admin Login failed - Data:", error.response.data);
      throw new Error(error.response.data?.message || `Login failed: ${error.response.status}`);
    } else {
      console.error("Admin Login failed:", error.message);
      throw new Error(error.message || "Network Error or Server Unreachable");
    }
  }
  // If we get here (e.g. not admin), return null or throw?
  return null;
}

export function logoutAdmin(): void {
  localStorage.removeItem(STORAGE_KEYS.ADMIN);
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getCurrentAdmin(): Admin | null {
  const stored = localStorage.getItem(STORAGE_KEYS.ADMIN);
  return stored ? JSON.parse(stored) : null;
}

// --- Product Functions ---

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await axios.get(`${API_URL}/product`, { headers: getAuthHeader() });
    if (!res.data || !res.data.products) return [];
    return res.data.products.map((p: any) => ({
      ...p,
      id: p._id,
      // Ensure fields match Product interface
      images: p.images || [],
      specs: p.specs || [],
      stock: p.stock || 0,
      featured: p.featured || false,
    }));
  } catch (error) {
    console.error("Fetch products failed:", error);
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
  try {
    const res = await axios.post(`${API_URL}/product/create`, product, { headers: getAuthHeader() });
    if (res.data.product) {
      const p = res.data.product;
      return {
        ...p,
        id: p._id,
        images: p.images || [],
        specs: p.specs || [],
      };
    }
  } catch (error) {
    console.error("Add product failed:", error);
  }
  return null;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    const res = await axios.put(`${API_URL}/product/update/${id}`, updates, { headers: getAuthHeader() });
    if (res.data.product) {
      const p = res.data.product;
      return {
        ...p,
        id: p._id,
        images: p.images || [],
        specs: p.specs || [],
      };
    }
  } catch (error) {
    console.error("Update product failed:", error);
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    await axios.delete(`${API_URL}/product/delete/${id}`, { headers: getAuthHeader() });
    return true;
  } catch (error) {
    console.error("Delete product failed:", error);
    return false;
  }
}

// --- Order Functions ---

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await axios.get(`${API_URL}/orders/allorders`, { headers: getAuthHeader() });

    // Debug log
    console.log("Admin All Orders:", res.data);

    if (!Array.isArray(res.data)) return [];

    return res.data.map((o: any) => {
      // Address handling
      let shippingAddress = {
        street: typeof o.address === 'string' ? o.address : (o.address?.addressLine1 || 'Unknown'),
        city: typeof o.address === 'string' ? '' : (o.address?.city || ''),
        state: typeof o.address === 'string' ? '' : (o.address?.state || ''),
        zipCode: typeof o.address === 'string' ? '' : (o.address?.pincode || ''),
        country: 'India'
      };

      // Items/Product handling
      // Backend returns 'items' array. Admin dashboard might expect one main product or we summarize.
      // Based on type shim: product: o.items?.[0]?.product || {}

      const firstItem = o.items && o.items.length > 0 ? o.items[0] : null;
      const productData = firstItem && firstItem.product ? {
        name: firstItem.product.name,
        price: firstItem.product.price,
        // ... helper fields if needed
      } : { name: 'Unknown Product', price: 0 };

      return {
        id: o._id,
        orderNumber: o._id,
        userId: o.user?._id || o.user || '',
        userName: o.user?.name || 'Unknown User',
        userEmail: o.user?.mail || o.user?.email || '',
        userPhone: '',
        product: productData,
        quantity: firstItem ? firstItem.quantity : 0,
        totalPrice: o.totalAmount || 0,
        status: o.status ? o.status.toLowerCase() : 'pending',
        shippingAddress: shippingAddress,
        trackingNumber: o.trackingId || '',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt || o.createdAt,
        deliveredAt: o.activeDate
      };
    });
  } catch (error) {
    console.error("Fetch orders failed:", error);
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  trackingNumber?: string
): Promise<Order | null> {
  try {
    const payload = {
      orderId: id,
      status: status.charAt(0).toUpperCase() + status.slice(1), // Capitalize for backend
      trackingId: trackingNumber
    };
    const res = await axios.put(`${API_URL}/orders/updatestatus`, payload, { headers: getAuthHeader() });
    if (res.data.message === "Status Updated") {
      // Return a mock updated order or fetch it again
      // For now, simple return true/null logic or shim response
      return { id, status } as any;
    }
  } catch (error) {
    console.error("Update order status failed:", error);
  }
  return null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  // Can implement a dedicated endpoint or aggregate on client
  // For now, fetch orders and aggregation on client
  const orders = await getOrders();
  const products = await getProducts();

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
