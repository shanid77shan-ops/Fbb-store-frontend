import { useEffect, useState } from 'react';
import { Search, ArrowLeft, Eye, Package, TrendingUp, Filter, AlertCircle } from 'lucide-react';
import { baseurl } from '../../Constant/Base';
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom';

interface Category {
  _id: string;
  name: string;
}

interface SubCategory extends Category {
  categoryId: Category;
}

interface Product {
  _id: string;
  name: string;
  brand: string;
  categoryId: Category;
  subCategoryId: SubCategory;
  priceINR: number;
  priceAED: number;
  images: {
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
  };
  trending: boolean;
  stock: number;
  active: boolean;
  soldCount: number;
  createdAt: string;
}

interface Seller {
  _id: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  status: boolean;
  createdAt: string;
}

const SellerProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField] = useState<string>('createdAt');
  const [sortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { id } = useParams();
  const navigate = useNavigate();
  const api = axios.create({ baseURL: baseurl });

  const getSeller = async () => {
    try {
      const response = await api.get(`/admin/get-seller/${id}`);
      setSeller(response.data);
    } catch (error) {
      console.error('Error fetching seller:', error);
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/get-products/${id}`);
      if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && product.active) ||
      (filterStatus === 'inactive' && !product.active) ||
      (filterStatus === 'trending' && product.trending);
    
    return matchesSearch && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'brand':
        aValue = a.brand.toLowerCase();
        bValue = b.brand.toLowerCase();
        break;
      case 'priceINR':
        aValue = a.priceINR;
        bValue = b.priceINR;
        break;
      case 'stock':
        aValue = a.stock;
        bValue = b.stock;
        break;
      case 'soldCount':
        aValue = a.soldCount;
        bValue = b.soldCount;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    return sortDirection === 'asc' 
      ? (aValue > bValue ? 1 : -1)
      : (aValue < bValue ? 1 : -1);
  });

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const getMainImage = (images: Product['images']) => {
    return images?.image1 || Object.values(images || {}).find(img => img) || '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    getProducts();
    getSeller();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/sellers')}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Seller Products</h1>
            <p className="text-gray-600 mt-1">Products listed by {seller?.name}</p>
          </div>
        </div>
      </div>

      {/* Seller Info Card */}
      {seller && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {seller.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{seller.name}</h2>
                {seller.companyName && (
                  <p className="text-gray-600">{seller.companyName}</p>
                )}
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-gray-600">{seller.email}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-gray-600">{seller.phone}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-full font-medium ${
                seller.status 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {seller.status ? 'Active Seller' : 'Inactive Seller'}
              </div>
              <div className="text-sm text-gray-600">
                Joined: {formatDate(seller.createdAt)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">{products.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Products</div>
          <div className="text-xs text-blue-600 mt-2">Listed by this seller</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">
            {products.filter(p => p.trending).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Trending Products</div>
          <div className="text-xs text-purple-600 mt-2">
            {((products.filter(p => p.trending).length / products.length) * 100 || 0).toFixed(1)}% of total
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">
            {products.reduce((sum, p) => sum + p.soldCount, 0)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Sold</div>
          <div className="text-xs text-green-600 mt-2">All-time sales</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <div className="text-2xl font-bold text-gray-800">
            {products.filter(p => p.stock < 10).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Low Stock</div>
          <div className="text-xs text-red-600 mt-2">Needs attention</div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="search"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="trending">Trending</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Sold</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img 
                          src={getMainImage(product.images)} 
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-lg mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIGZpbGw9IiNGOEY4RjgiLz48cGF0aCBkPSJNMzEgMTlDMjIuMzgzIDE5IDE1LjUgMjUuODgzIDE1LjUgMzQuNUMxNS41IDQzLjExNyAyMi4zODMgNTAgMzEgNTBDMzkuNjE3IDUwIDQ2LjUgNDMuMTE3IDQ2LjUgMzQuNUM0Ni41IDI1Ljg4MyAzOS42MTcgMTkgMzEgMTlaTTMxIDQ0LjVDMjQuMDE3IDQ0LjUgMTguNSAzOC45ODMgMTguNSAzM0MxOC41IDI3LjAxNyAyNC4wMTcgMjEuNSAzMSAyMS41QzM3Ljk4MyAyMS41IDQzLjUgMjcuMDE3IDQzLjUgMzNDNDMuNSAzOC45ODMgMzcuOTgzIDQ0LjUgMzEgNDQuNVpNNDEuMjUgMTcuNUM0Mi41MzMgMTcuNTUgNDMuNSAxNi42MTcgNDMuNSAxNS4zMzNINDMuNEM0My40IDEyLjI1IDQxLjIgOCA0MS4yIDhDMzkuOTY3IDggMzguOSA4LjYgMzguMyA5LjY2N0MzNy43IDguNiAzNi42MzMgOCAzNS40IDhDMzUuNCA4IDMzLjIgMTIuMjUgMzMuMiAxNS4zMzNIMzMuNUMzMy41IDE2LjYxNyAzNC40NjcgMTcuNTUgMzUuNzUgMTcuNUMzNS43NSAxNy41IDM4LjUgMTMgMzguNSAxN0M0MC4xIDIxLjYgNDEuMjUgMTcuNSA0MS4yNSAxNy41WiIgZmlsbD0iI0NEQ0RCOCIvPjwvc3ZnPg==';
                          }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        <div>{product.categoryId?.name || 'N/A'}</div>
                        {product.subCategoryId && (
                          <div className="text-xs text-gray-500">{product.subCategoryId.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">₹{product.priceINR.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">AED {product.priceAED.toLocaleString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                        product.stock > 10 
                          ? 'bg-green-100 text-green-700'
                          : product.stock > 0
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock} units
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="text-sm text-gray-700">
                        {product.soldCount || 0} sold
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          product.active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                          {product.active ? 'Active' : 'Inactive'}
                        </div>
                        {product.trending && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            <TrendingUp size={10} />
                            Trending
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Package size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="text-gray-400 mb-4" size={48} />
                      <div className="text-gray-400 mb-2">No products found</div>
                      {(searchTerm || filterStatus !== 'all') && (
                        <button
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {currentItems.length > 0 && (
          <div className="px-6 py-4 border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedProducts.length)} of {sortedProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProducts;