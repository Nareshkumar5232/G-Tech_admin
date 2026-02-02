import type { Admin, Product, Order, DashboardStats } from '@/types';
import axios from 'axios';
import { appCache, CACHE_KEYS } from './cache';

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
    console.log("🔐 Admin: Attempting login for:", email);
    // Current backend might not have separate admin login, but we can reuse login or check role
    const res = await axios.post(`${API_URL}/auth/login`, { mail: email, password });
    console.log("✅ Admin Login Response:", res.data);

    if (res.data.token && res.data.user) {
      // Check if user is admin (including admin override)
      const userRole = res.data.user.role;
      const userId = res.data.user.id || res.data.user._id;

      // Allow admin override ID or admin role
      if (userRole === 'admin' || userRole === 'super-admin' || userId === 'admin-override-id') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, res.data.token);
        const admin: Admin = {
          id: userId,
          email: res.data.user.email || res.data.user.mail,
          name: res.data.user.name || 'Admin',
          role: userRole || 'admin'
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
        console.log("✅ Admin login successful");
        return admin;
      } else {
        console.error("❌ User is not an admin. Role:", userRole);
        throw new Error("Access denied. Admin privileges required.");
      }
    }
  } catch (error: any) {
    console.error("❌ Admin Login failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || `Login failed: ${error.response.status}`);
    } else {
      throw new Error(error.message || "Network Error or Server Unreachable");
    }
  }
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
    console.log("📦 Admin: Fetching products...");
    const res = await axios.get(`${API_URL}/product`, { headers: getAuthHeader() });
    console.log("✅ Admin Products Response:", res.data);

    // Handle both { products: [...] } and direct array response
    const products = Array.isArray(res.data) ? res.data : (res.data?.products || []);
    if (!products || products.length === 0) {
      console.warn("⚠️ No products found");
      return [];
    }

    console.log(`✅ Found ${products.length} products`);
    return products.map((p: any) => ({
      ...p,
      id: p._id || p.id,
      // Ensure fields match Product interface
      images: p.images || [],
      specs: p.specs || [],
      stock: p.stock || 0,
      featured: p.featured || false,
    }));
  } catch (error: any) {
    console.error("❌ Fetch products failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
    }
    return [];
  }
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
  try {
    console.log("➕ Admin: Adding new product...");
    const res = await axios.post(`${API_URL}/product/create`, product, { headers: getAuthHeader() });
    console.log("✅ Product added successfully:", res.data);

    // Invalidate products and dashboard cache
    appCache.invalidate(CACHE_KEYS.PRODUCTS);
    appCache.invalidate(CACHE_KEYS.DASHBOARD_STATS);

    if (res.data.product) {
      const p = res.data.product;
      return {
        ...p,
        id: p._id,
        images: p.images || [],
        specs: p.specs || [],
      };
    }
  } catch (error: any) {
    console.error("❌ Add product failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || "Failed to add product");
    }
    throw new Error(error.message || "Network error");
  }
  return null;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  try {
    console.log("✏️ Admin: Updating product:", id);
    const res = await axios.put(`${API_URL}/product/update/${id}`, updates, { headers: getAuthHeader() });
    console.log("✅ Product updated successfully:", res.data);

    // Invalidate products and dashboard cache
    appCache.invalidate(CACHE_KEYS.PRODUCTS);
    appCache.invalidate(CACHE_KEYS.DASHBOARD_STATS);

    if (res.data.product) {
      const p = res.data.product;
      return {
        ...p,
        id: p._id,
        images: p.images || [],
        specs: p.specs || [],
      };
    }
  } catch (error: any) {
    console.error("❌ Update product failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || "Failed to update product");
    }
    throw new Error(error.message || "Network error");
  }
  return null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    console.log("🗑️ Admin: Deleting product:", id);
    const headers = getAuthHeader();
    console.log("🔑 Auth Headers:", headers);
    await axios.delete(`${API_URL}/product/delete/${id}`, { headers });
    console.log("✅ Product deleted successfully");

    // Invalidate products and dashboard cache
    appCache.invalidate(CACHE_KEYS.PRODUCTS);
    appCache.invalidate(CACHE_KEYS.DASHBOARD_STATS);

    return true;
  } catch (error: any) {
    console.error("❌ Delete product failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || "Failed to delete product");
    }
    throw new Error(error.message || "Network error");
  }
}

// --- Order Functions ---

export async function getOrders(): Promise<Order[]> {
  try {
    const authHeader = getAuthHeader();
    console.log("📋 Admin: Fetching all orders...");
    console.log("🔐 Auth header present:", !!authHeader.Authorization);

    const res = await axios.get(`${API_URL}/orders/allorders`, {
      headers: authHeader
    });

    // Debug log
    console.log("✅ Admin Orders Response Status:", res.status);
    console.log("✅ Admin Orders Data:", res.data);

    // Handle different response formats
    if (!res.data) {
      console.warn("No data in response");
      return [];
    }

    // If response is an error message
    if (res.data.error || (res.data.message && !Array.isArray(res.data))) {
      console.error("Error from backend:", res.data);
      throw new Error(res.data.error || res.data.message || "Failed to fetch orders");
    }

    if (!Array.isArray(res.data)) {
      console.warn("⚠️ Response is not an array:", typeof res.data, res.data);
      return [];
    }

    if (res.data.length === 0) {
      console.log("ℹ️ No orders found in database");
      return [];
    }

    console.log(`✅ Found ${res.data.length} orders`);

    // Helper function to normalize status
    const normalizeStatus = (status: string): Order['status'] => {
      if (!status) return 'pending';
      const lower = status.toLowerCase();
      if (lower.includes('payment pending') || lower === 'pending') return 'pending';
      if (lower.includes('confirmed') || lower === 'confirmed') return 'confirmed';
      if (lower.includes('shipped') || lower === 'shipped') return 'shipped';
      if (lower.includes('delivered') || lower === 'delivered') return 'delivered';
      if (lower.includes('cancelled') || lower.includes('canceled')) return 'cancelled';
      return 'pending';
    };

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
      const firstItem = o.items && o.items.length > 0 ? o.items[0] : null;
      const rawProduct = firstItem?.product || {};

      const product: Product = {
        id: rawProduct._id || rawProduct.id || '',
        name: rawProduct.name || 'Unknown Product',
        brand: rawProduct.brand || 'Other',
        category: rawProduct.category || 'Accessories',
        condition: rawProduct.condition || 'New',
        price: rawProduct.price || 0,
        stock: rawProduct.stock || 0,
        images: rawProduct.images || [],
        specs: rawProduct.specs || [],
        description: rawProduct.description || '',
        featured: rawProduct.featured || false,
        cashOnDelivery: rawProduct.cashOnDelivery,
        createdAt: rawProduct.createdAt || o.createdAt,
        updatedAt: rawProduct.updatedAt || o.updatedAt || o.createdAt,
      };

      return {
        id: o._id,
        orderNumber: o._id,
        userId: o.user?._id || o.user || '',
        userName: o.user?.name || 'Unknown User',
        userEmail: o.user?.mail || o.user?.email || '',
        userPhone: '',
        product,
        quantity: firstItem ? firstItem.quantity : 0,
        totalPrice: o.totalAmount || 0,
        status: normalizeStatus(o.status),
        shippingAddress: shippingAddress,
        trackingNumber: o.trackingId || '',
        createdAt: o.createdAt,
        updatedAt: o.updatedAt || o.createdAt,
        deliveredAt: o.activeDate
      };
    });
  } catch (error: any) {
    console.error("Fetch orders failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      if (error.response.status === 401) {
        console.error("Authentication failed - admin token may be invalid");
      }
    }
    return [];
  }
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  trackingNumber?: string
): Promise<Order | null> {
  try {
    console.log(`🔄 Admin: Updating order ${id} status to ${status}`);

    // Map frontend status to backend format
    const statusMap: Record<Order['status'], string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };

    const payload = {
      orderId: id,
      status: statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1),
      trackingId: trackingNumber
    };

    console.log("📦 Update payload:", payload);
    const res = await axios.put(`${API_URL}/orders/updatestatus`, payload, { headers: getAuthHeader() });
    console.log("✅ Order status updated:", res.data);

    // Invalidate orders and dashboard cache
    appCache.invalidate(CACHE_KEYS.ORDERS);
    appCache.invalidate(CACHE_KEYS.DASHBOARD_STATS);

    if (res.data.message === "Status Updated" || res.data.order) {
      return { id, status } as any;
    }
  } catch (error: any) {
    console.error("❌ Update order status failed:", error);
    if (error.response) {
      console.error("Error response:", error.response.status, error.response.data);
      throw new Error(error.response.data?.message || "Failed to update order status");
    }
    throw new Error(error.message || "Network error");
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
