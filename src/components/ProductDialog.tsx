import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { addProduct, updateProduct } from '@/lib/store';
import { toast } from 'sonner';
import type { Product } from '@/types';

interface ProductDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function ProductDialog({ product, onClose }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Dell' as Product['brand'],
    category: 'New Laptops' as Product['category'],
    condition: 'New' as Product['condition'],
    price: 0,
    stock: 0,
    images: [''],
    specs: [''],
    description: '',
    featured: false,
    cashOnDelivery: false,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        category: product.category,
        condition: product.condition,
        price: product.price,
        stock: product.stock,
        images: product.images,
        specs: product.specs,
        description: product.description,
        featured: product.featured,
        cashOnDelivery: product.cashOnDelivery ?? false,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty image URLs
    const cleanedData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
    };

    // Ensure at least one image
    if (cleanedData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    if (product) {
      await updateProduct(product.id, cleanedData);
      toast.success('Product updated successfully');
    } else {
      await addProduct(cleanedData);
      toast.success('Product added successfully');
    }
    onClose();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images.filter(img => img !== ''), imageUrl, ''],
        }));
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    
    // Add empty field if last field is filled
    if (index === newImages.length - 1 && value.trim() !== '') {
      newImages.push('');
    }
    
    setFormData({ ...formData, images: newImages });
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // Ensure at least one empty field
    if (newImages.every(img => img !== '')) {
      newImages.push('');
    }
    setFormData({ ...formData, images: newImages });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <select
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value as Product['brand'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer', 'MSI', 'Samsung', 'Other'].map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {['New Laptops', 'Used Laptops', 'Accessories', 'Networking & CCTV'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as Product['condition'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
            
            {/* Image Upload Button */}
            <div className="mb-3">
              <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer w-fit">
                <Upload className="w-4 h-4" />
                <span>Upload Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">Upload from device or enter image URLs below</p>
            </div>

            {/* Image Previews */}
            {formData.images.some(img => img !== '') && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {formData.images
                  .filter(img => img !== '')
                  .map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Image URL Inputs */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Or enter image URLs:</label>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={image}
                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  {image && (
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">
              Mark as Featured
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="cod"
              checked={formData.cashOnDelivery}
              onChange={(e) => setFormData({ ...formData, cashOnDelivery: e.target.checked })}
              className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
            />
            <label htmlFor="cod" className="text-sm font-medium text-gray-700">
              Cash on Delivery Available
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all"
            >
              {product ? 'Update' : 'Add'} Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
