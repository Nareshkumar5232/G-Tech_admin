import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Search, RefreshCw, Loader2 } from 'lucide-react';
import { getProducts, deleteProduct } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { ProductDialog } from '@/components/ProductDialog';
import { Pagination } from '@/components/Pagination';
import { usePaginatedData } from '@/lib/hooks';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache';
import type { Product } from '@/types';

export function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Use paginated data hook with caching
  const {
    data: products,
    paginatedData,
    pagination,
    controls,
    isLoading,
    refresh,
    lastUpdated,
  } = usePaginatedData<Product>(
    useCallback(() => getProducts(), []),
    {
      cacheKey: CACHE_KEYS.PRODUCTS,
      cacheTTL: CACHE_TTL.MEDIUM,
      initialPageSize: 12,
    }
  );

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Get paginated filtered products
  const displayProducts = useMemo(() => {
    if (searchQuery.trim()) {
      // When searching, show all filtered results (no pagination for search)
      return filteredProducts;
    }
    return paginatedData;
  }, [searchQuery, filteredProducts, paginatedData]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const success = await deleteProduct(id);
        if (success) {
          await refresh(true); // Force refresh after delete
          toast.success('Product deleted successfully');
        }
      } catch (error: any) {
        console.error('Failed to delete product:', error);
        toast.error(error.message || 'Failed to delete product');
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleDialogClose = async () => {
    setDialogOpen(false);
    setEditingProduct(null);
    await refresh(true); // Force refresh after add/edit
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your laptop inventory
            {lastUpdated && (
              <span className="text-xs text-gray-400 ml-2">
                (Last updated: {lastUpdated.toLocaleTimeString()})
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refresh(true)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-200 relative">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${product.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                  {product.condition}
                </span>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{product.brand} • {product.category}</p>
                <p className="text-2xl font-bold text-gray-900 mb-3">{formatCurrency(product.price)}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className={`font-medium ${product.stock < 5 ? 'text-red-600' : 'text-green-600'}`}>
                    Stock: {product.stock}
                  </span>
                  {product.featured && (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination - only show when not searching */}
      {!isLoading && !searchQuery.trim() && products.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4">
          <Pagination
            pagination={pagination}
            controls={controls}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </div>
      )}

      {/* Search results count */}
      {searchQuery.trim() && (
        <div className="text-sm text-gray-600">
          Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} matching "{searchQuery}"
        </div>
      )}

      {!isLoading && displayProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <p className="text-gray-500">No products found</p>
        </div>
      )}

      {dialogOpen && (
        <ProductDialog
          product={editingProduct}
          onClose={handleDialogClose}
        />
      )}
    </div>
  );
}
