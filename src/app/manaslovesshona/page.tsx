'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SafeImage from '@/components/SafeImage';
import {
  Upload,
  Plus,
  Edit2,
  Trash2,
  Check,
  ArrowLeft,
  Eye,
  Lock,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Maximize2,
  CheckCircle2,
  Tag,
  Percent,
  Truck,
  CreditCard,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { CraftProduct, CraftCategory, isProductInStock, Order, OrderStatus } from '@/types';
import ProductCardImage from '@/components/ProductCardImage';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const [products, setProducts] = useState<CraftProduct[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'orders'>('list');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<CraftCategory>('All');
  const [editingPriceState, setEditingPriceState] = useState<{
    id: string;
    type: 'regular' | 'sale';
  } | null>(null);
  const [newPriceValue, setNewPriceValue] = useState<string>('');

  // Inventory & Stock Editing State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockValue, setNewStockValue] = useState<string>('');

  // Multi-Photo & Product Editing State
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState<string>('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'German Silver' as CraftCategory,
    priceNumeric: 4800,
    isOnSale: false,
    salePriceNumeric: 0,
    stockQuantity: 10,
    isOutOfStock: false,
    material: '',
    craftTechnique: '',
    origin: 'Jaipur, Rajasthan',
    shortDescription: '',
    editorialQuote: '',
    longDescription: '',
    materialSourcing: 'Sustainably sourced natural materials from regional deposits.',
    handTechnique: 'Shaped entirely by hand without high-speed mechanization.',
    artisanNote: '“Every piece carries the rhythm and intention of the human hand.”',
    imageFit: 'cover' as 'contain' | 'cover',
  });

  const [publishSuccess, setPublishSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check stored session
  useEffect(() => {
    const savedAuth = localStorage.getItem('ruh_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      fetchOrders();
    }
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch {
      // Failed to fetch products
      setProducts([]);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Atelier master PIN
    if (passcode.trim() === '9136299225') {
      setIsAuthenticated(true);
      localStorage.setItem('ruh_admin_auth', 'true');
      setPasscodeError(false);
      fetchOrders();
    } else {
      setPasscodeError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('ruh_admin_auth');
  };

  // Compress image on client canvas to sharp, high-res web-optimized JPEG (< 250KB)
  const compressImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 1600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Multi-Image Upload Handler with High-Resolution Clean Upload
  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const rawFileList = Array.from(files);
    setUploadingImage(true);

    try {
      // 1. Compress each file directly to clean, persistent base64 data URLs
      const compressedDataUrls: string[] = [];
      for (const file of rawFileList) {
        const compressed = await compressImageToDataUrl(file);
        if (compressed) compressedDataUrls.push(compressed);
      }

      if (compressedDataUrls.length === 0) return;

      const previousCount = imagePreviews.length;
      // Set compressed data URLs immediately (Safe for both preview and persistence)
      setImagePreviews((prev) => [...prev, ...compressedDataUrls]);

      // 2. Attempt to upload to /api/upload for static CDN paths if supported
      try {
        const body = new FormData();
        for (let i = 0; i < compressedDataUrls.length; i++) {
          const dataUrl = compressedDataUrls[i];
          const blob = await (await fetch(dataUrl)).blob();
          const cleanName = rawFileList[i]?.name?.replace(/[^a-zA-Z0-9.-]/g, '_') || `photo-${i}.jpg`;
          body.append('files', new File([blob], cleanName, { type: 'image/jpeg' }));
        }

        const res = await fetch('/api/upload', {
          method: 'POST',
          body,
        });

        if (res.ok) {
          const data = await res.json();
          const uploadedUrls: string[] = data.urls || (data.url ? [data.url] : []);
          if (uploadedUrls.length > 0) {
            setImagePreviews((prev) => {
              const copy = [...prev];
              uploadedUrls.forEach((url, i) => {
                if (previousCount + i < copy.length) {
                  copy[previousCount + i] = url;
                } else {
                  copy.push(url);
                }
              });
              return copy;
            });
          }
        }
      } catch (uploadErr) {
        // Upload endpoint error (e.g. serverless read-only); compressed data URLs already preserved
        console.warn('API upload fallback to compressed data URL:', uploadErr);
      }
    } catch (err) {
      console.error('Image compression failed:', err);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };


  const handleRemovePhoto = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (selectedCoverIndex === indexToRemove) {
      setSelectedCoverIndex(0);
    } else if (selectedCoverIndex > indexToRemove) {
      setSelectedCoverIndex((prev) => prev - 1);
    }
  };

  const handleMovePhoto = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= imagePreviews.length) return;
    setImagePreviews((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
    if (selectedCoverIndex === fromIdx) {
      setSelectedCoverIndex(toIdx);
    } else if (selectedCoverIndex === toIdx) {
      setSelectedCoverIndex(fromIdx);
    }
  };

  const handleAddImageUrl = (url: string) => {
    if (!url.trim()) return;
    setImagePreviews((prev) => [...prev, url.trim()]);
    setUrlInput('');
  };

  const resetForm = () => {
    setEditingProductId(null);
    setImagePreviews([]);
    setSelectedCoverIndex(0);
    setUrlInput('');
    setFormData({
      name: '',
      category: 'German Silver' as CraftCategory,
      priceNumeric: 4800,
      isOnSale: false,
      salePriceNumeric: 0,
      stockQuantity: 10,
      isOutOfStock: false,
      material: '',
      craftTechnique: '',
      origin: 'Jaipur, Rajasthan',
      shortDescription: '',
      editorialQuote: '',
      longDescription: '',
      materialSourcing: 'Sustainably sourced natural materials from regional deposits.',
      handTechnique: 'Shaped entirely by hand without high-speed mechanization.',
      artisanNote: '“Every piece carries the rhythm and intention of the human hand.”',
      imageFit: 'cover' as 'contain' | 'cover',
    });
  };

  const handleStartEditProduct = (product: CraftProduct) => {
    setEditingProductId(product.id);
    const existingPhotos =
      product.galleryImages && product.galleryImages.length > 0
        ? product.galleryImages.map((g) => g.url)
        : [product.heroImage];
    setImagePreviews(existingPhotos);
    setSelectedCoverIndex(0);
    const currentStock = typeof product.stockQuantity === 'number' ? product.stockQuantity : 10;
    const isOut = Boolean(product.isOutOfStock) || currentStock <= 0;
    setFormData({
      name: product.name,
      category: product.category,
      priceNumeric:
        product.priceNumeric ||
        parseInt(product.price.replace(/[^0-9]/g, ''), 10) ||
        4800,
      isOnSale: Boolean(product.isOnSale),
      salePriceNumeric: product.salePriceNumeric || 0,
      stockQuantity: currentStock,
      isOutOfStock: isOut,
      material: product.material,
      craftTechnique: product.craftTechnique,
      origin: product.origin,
      shortDescription: product.shortDescription,
      editorialQuote: product.editorialQuote,
      longDescription: product.longDescription,
      materialSourcing:
        product.theMaking?.materialSourcing ||
        'Sustainably sourced natural materials from regional deposits.',
      handTechnique:
        product.theMaking?.handTechnique ||
        'Shaped entirely by hand without high-speed mechanization.',
      artisanNote:
        product.theMaking?.artisanNote ||
        '“Every piece carries the rhythm and intention of the human hand.”',
      imageFit: product.imageFit || 'cover',
    });
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('list');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.priceNumeric) return;

    if (imagePreviews.some((url) => url.startsWith('blob:'))) {
      setPublishError('Photos are still processing. Please wait a few seconds before saving.');
      return;
    }

    const formattedPrice = `₹${Number(formData.priceNumeric).toLocaleString('en-IN')}`;
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const isOnSale = Boolean(
      formData.isOnSale &&
      formData.salePriceNumeric &&
      formData.salePriceNumeric > 0 &&
      formData.salePriceNumeric < formData.priceNumeric
    );
    const salePriceFormatted = isOnSale
      ? `₹${Number(formData.salePriceNumeric).toLocaleString('en-IN')}`
      : undefined;

    const stockQty = Number(formData.stockQuantity);
    const isOut = Boolean(formData.isOutOfStock || stockQty <= 0);

    // Organize photos: Cover photo first, followed by other angles
    const fallbackImage = imagePreviews[0] || '';
    const effectiveCover =
      imagePreviews[selectedCoverIndex] || imagePreviews[0] || fallbackImage;
    const remainingPhotos = imagePreviews.filter((_, idx) => idx !== selectedCoverIndex);
    const allOrderedPhotos = [effectiveCover, ...remainingPhotos].filter(Boolean);

    const galleryImages = allOrderedPhotos.map((url, idx) => ({
      url,
      label: idx === 0 ? 'Primary Angle' : `Detail Angle ${idx + 1}`,
      caption:
        idx === 0
          ? `${formData.name} in warm natural daylight.`
          : `${formData.name} - Handcrafted detail view ${idx + 1}.`,
    }));

    const productPayload: CraftProduct = {
      id: editingProductId || `${slug}-${Date.now()}`,
      name: formData.name,
      slug,
      category: formData.category,
      material: formData.material || 'Natural Handcrafted Earth & Mineral',
      craftTechnique: formData.craftTechnique || 'Ancestral Hand-Tooling',
      origin: formData.origin,
      price: formattedPrice,
      priceNumeric: Number(formData.priceNumeric),
      isOnSale,
      salePrice: salePriceFormatted,
      salePriceNumeric: isOnSale ? Number(formData.salePriceNumeric) : undefined,
      stockQuantity: stockQty,
      isOutOfStock: isOut,
      shortDescription:
        formData.shortDescription || `${formData.name} shaped by master artisans in ${formData.origin}.`,
      editorialQuote:
        formData.editorialQuote || 'Shaped through patience, tradition, and living materials.',
      longDescription:
        formData.longDescription ||
        `${formData.name} is meticulously handcrafted using traditional techniques, celebrating organic textures and tactile stillness.`,
      heroImage: effectiveCover,
      images: allOrderedPhotos,
      galleryImages,
      imageFit: formData.imageFit || 'contain',
      theMaking: {
        materialSourcing: formData.materialSourcing,
        handTechnique: formData.handTechnique,
        finishDetails: 'Matte, organic hand-burnished touch.',
        careInstructions: [
          'Dust gently with a soft microfibre cloth.',
          'Avoid chemical cleansers or standing water.',
        ],
        artisanNote: formData.artisanNote,
        makingImage: '/images/atelier-carving.jpg',
      },
    };

    setIsSubmitting(true);
    setPublishError(null);

    try {
      const isEdit = Boolean(editingProductId);
      const res = await fetch('/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server rejected database write');
      }

      // Re-fetch products from persistent database to guarantee state matches DB
      await fetchProducts();

      setPublishSuccess(true);
      setTimeout(() => {
        setPublishSuccess(false);
        resetForm();
        setActiveTab('list');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save product to persistent database:', err);
      setPublishError(err.message || 'Database write failed. Product was not saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick In-Line Price Update (Regular or Sale)
  const handleSaveInlinePrice = async (product: CraftProduct) => {
    if (!editingPriceState) return;
    const num = parseInt(newPriceValue.replace(/[^0-9]/g, ''), 10);
    if (isNaN(num) || num <= 0) {
      setEditingPriceState(null);
      return;
    }

    let updated: CraftProduct;
    if (editingPriceState.type === 'regular') {
      updated = {
        ...product,
        priceNumeric: num,
        price: `₹${num.toLocaleString('en-IN')}`,
      };
    } else {
      updated = {
        ...product,
        isOnSale: true,
        salePriceNumeric: num,
        salePrice: `₹${num.toLocaleString('en-IN')}`,
      };
    }

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update price in database');
      }
      await fetchProducts();
      setEditingPriceState(null);
    } catch (err: any) {
      console.error('Price update database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // Quick One-Click Sale Toggle
  const handleToggleSale = async (product: CraftProduct) => {
    const nextIsOnSale = !product.isOnSale;
    const defaultSaleNumeric =
      product.salePriceNumeric && product.salePriceNumeric > 0
        ? product.salePriceNumeric
        : Math.round(product.priceNumeric * 0.8);

    const updated: CraftProduct = {
      ...product,
      isOnSale: nextIsOnSale,
      salePriceNumeric: nextIsOnSale ? defaultSaleNumeric : undefined,
      salePrice: nextIsOnSale ? `₹${defaultSaleNumeric.toLocaleString('en-IN')}` : undefined,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update sale status in database');
      }
      await fetchProducts();
    } catch (err: any) {
      console.error('Sale toggle database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // Quick One-Click Out of Stock Toggle
  const handleToggleStock = async (product: CraftProduct) => {
    const currentlyInStock = isProductInStock(product);
    const updated: CraftProduct = {
      ...product,
      isOutOfStock: currentlyInStock,
      stockQuantity: currentlyInStock
        ? 0
        : product.stockQuantity && product.stockQuantity > 0
        ? product.stockQuantity
        : 5,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update stock in database');
      }
      await fetchProducts();
    } catch (err: any) {
      console.error('Stock toggle database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // Quick Adjust Stock via Stepper (+ / -)
  const handleAdjustStock = async (product: CraftProduct, delta: number) => {
    const currentQty = typeof product.stockQuantity === 'number' ? product.stockQuantity : 10;
    const nextQty = Math.max(0, currentQty + delta);
    const updated: CraftProduct = {
      ...product,
      stockQuantity: nextQty,
      isOutOfStock: nextQty === 0,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to adjust stock in database');
      }
      await fetchProducts();
    } catch (err: any) {
      console.error('Stock adjust database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // Save Inline Direct Stock Input
  const handleSaveInlineStock = async (product: CraftProduct) => {
    if (!editingStockId) return;
    const num = parseInt(newStockValue.replace(/[^0-9]/g, ''), 10);
    const qty = isNaN(num) || num < 0 ? 0 : num;
    const updated: CraftProduct = {
      ...product,
      stockQuantity: qty,
      isOutOfStock: qty === 0,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save stock in database');
      }
      await fetchProducts();
      setEditingStockId(null);
    } catch (err: any) {
      console.error('Inline stock database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // Delete Product Permanently from Database
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently remove this piece from the database?')) return;

    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete piece from database');
      }
      await fetchProducts();
    } catch (err: any) {
      console.error('Delete product database error:', err);
      alert(`Database Error: ${err.message}`);
    }
  };

  // 1. Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FAF7F2] border border-[#E8E0D2] shadow-xl p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-10 h-10 border border-[#3A3027] bg-[#FAF7F2] mx-auto flex items-center justify-center mb-4">
              <Lock className="w-4 h-4 text-[#23201D]" />
            </div>
            <h1 className="font-serif text-2xl tracking-widest text-[#23201D]">
              RUH STONE ATELIER
            </h1>
            <p className="text-xs uppercase tracking-[0.25em] text-[#7A746C] mt-1.5">
              PRIVATE STORE MANAGEMENT
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5">
                ATELIER PASSCODE
              </label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-3 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none tracking-widest"
              />
              {passcodeError && (
                <span className="text-[10px] text-red-700 block mt-1">
                  Incorrect passcode. Please enter the valid atelier passcode.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] py-3.5 text-[11px] font-sans tracking-[0.22em] uppercase transition-colors"
            >
              ACCESS ATELIER PANEL →
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E8E0D2] text-center">
            <Link
              href="/"
              className="text-xs text-[#7A746C] hover:text-[#23201D] inline-flex items-center space-x-1"
            >
              <span>← Return to Public Storefront</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Full Admin Dashboard
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E0D2] px-6 md:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xs uppercase tracking-widest text-[#7A746C] hover:text-[#23201D]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>VIEW STOREFRONT</span>
          </Link>
          <span className="text-[#D1C2AC]">|</span>
          <span className="font-serif text-lg tracking-wider text-[#23201D] font-light">
            RUH STONE · ATELIER MANAGER
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all ${
              activeTab === 'list'
                ? 'border-[#23201D] bg-[#23201D] text-[#FAF7F2]'
                : 'border-transparent text-[#7A746C] hover:text-[#23201D]'
            }`}
          >
            CATALOGUE ({products.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('orders');
              fetchOrders();
            }}
            className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
              activeTab === 'orders'
                ? 'border-[#23201D] bg-[#23201D] text-[#FAF7F2]'
                : 'border-[#E8E0D2] text-[#23201D] hover:bg-[#ECE4D6]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ORDERS ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`text-xs uppercase tracking-widest px-3 py-1.5 border transition-all flex items-center space-x-1.5 ${
              activeTab === 'create'
                ? 'border-[#23201D] bg-[#23201D] text-[#FAF7F2]'
                : 'border-[#23201D] text-[#23201D] hover:bg-[#23201D] hover:text-[#FAF7F2]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>LIST NEW PRODUCT</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-[11px] text-[#7A746C] hover:text-red-700 uppercase tracking-widest pl-2"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-10">
        {/* TAB 1: PRODUCT LIST & QUICK PRICE EDITOR */}
        {activeTab === 'list' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8E0D2] pb-6">
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] block mb-1">
                  INVENTORY & PRICING
                </span>
                <h1 className="font-serif text-3xl text-[#23201D] font-light">
                  Active Products Catalogue
                </h1>
              </div>
              <p className="text-xs text-[#7A746C] mt-2 sm:mt-0">
                Click any regular or sale price to edit inline. Use quick toggle to put products on sale instantly.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-[#7A746C] font-medium mr-2">
                FILTER CATEGORY:
              </span>
              {(['All', 'German Silver', 'Marble', 'Fibre', 'Brass and Wood'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAdminCategoryFilter(cat)}
                  className={`text-[11px] font-sans tracking-wider uppercase px-3 py-1.5 border transition-all ${
                    adminCategoryFilter === cat
                      ? 'border-[#23201D] bg-[#23201D] text-[#FAF7F2]'
                      : 'border-[#E8E0D2] bg-[#FAF7F2] text-[#7A746C] hover:border-[#23201D] hover:text-[#23201D]'
                  }`}
                >
                  {cat}{' '}
                  <span className="opacity-70 text-[10px]">
                    {cat === 'All'
                      ? `(${products.length})`
                      : `(${products.filter((p) => p.category === cat).length})`}
                  </span>
                </button>
              ))}
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto bg-[#FAF7F2] border border-[#E8E0D2]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E8E0D2] text-[10px] uppercase tracking-[0.2em] text-[#7A746C] bg-[#F4EFE6]">
                    <th className="py-4 px-6">PRODUCT</th>
                    <th className="py-4 px-6">CATEGORY</th>
                    <th className="py-4 px-6">ORIGIN & MATERIAL</th>
                    <th className="py-4 px-6">PRICING & SALE</th>
                    <th className="py-4 px-6">INVENTORY / STOCK</th>
                    <th className="py-4 px-6 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E0D2] text-xs">
                  {products
                    .filter((p) =>
                      adminCategoryFilter === 'All' ? true : p.category === adminCategoryFilter
                    )
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4EFE6]/50 transition-colors">
                        {/* Product Thumbnail + Name */}
                        <td className="py-4 px-6 flex items-center space-x-4">
                          <div className="relative w-12 h-16 bg-[#ECE4D6] overflow-hidden shrink-0">
                            <SafeImage
                              src={item.heroImage}
                              alt={item.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                            {item.isOnSale && (
                              <div className="absolute top-0.5 left-0.5 bg-[#8B3A2B] text-[#FAF7F2] text-[7px] uppercase tracking-wider px-1 font-sans">
                                SALE
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-serif text-base text-[#23201D] block">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#7A746C] font-mono">
                              ID: {item.id}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-6">
                          <span className="inline-block bg-[#EFE9DF] text-[#23201D] text-[11px] font-sans px-2.5 py-1 border border-[#DCD3C4]">
                            {item.category}
                          </span>
                        </td>

                        {/* Origin & Material */}
                        <td className="py-4 px-6">
                          <span className="block text-[#23201D] font-medium">{item.material}</span>
                          <span className="text-[10px] text-[#7A746C]">{item.origin}</span>
                        </td>

                        {/* PRICING & SALE CONFIGURATION */}
                        <td className="py-4 px-6">
                          <div className="space-y-1.5">
                            {/* Regular Price Row */}
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] uppercase tracking-wider text-[#7A746C] w-14">
                                Regular:
                              </span>
                              {editingPriceState?.id === item.id && editingPriceState.type === 'regular' ? (
                                <div className="flex items-center space-x-1.5">
                                  <span className="text-xs font-serif">₹</span>
                                  <input
                                    type="number"
                                    value={newPriceValue}
                                    onChange={(e) => setNewPriceValue(e.target.value)}
                                    className="w-20 bg-[#FAF7F2] border border-[#23201D] px-2 py-0.5 text-xs font-mono focus:outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlinePrice(item);
                                      if (e.key === 'Escape') setEditingPriceState(null);
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSaveInlinePrice(item)}
                                    className="bg-[#23201D] text-[#FAF7F2] p-1 hover:bg-[#3A3027]"
                                    title="Save regular price"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setEditingPriceState(null)}
                                    className="text-[#7A746C] p-1 hover:text-[#23201D]"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingPriceState({ id: item.id, type: 'regular' });
                                    setNewPriceValue(item.priceNumeric.toString());
                                  }}
                                  className={`group cursor-pointer inline-flex items-center space-x-1.5 px-1.5 py-0.5 hover:bg-[#ECE4D6] rounded-xs ${
                                    item.isOnSale ? 'line-through text-[#7A746C]' : 'font-semibold text-[#23201D]'
                                  }`}
                                  title="Click to edit regular price"
                                >
                                  <span className="font-serif text-sm">
                                    {item.price}
                                  </span>
                                  <Edit2 className="w-2.5 h-2.5 text-[#7A746C] opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              )}
                            </div>

                            {/* Sale Status & Sale Price Row */}
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] uppercase tracking-wider text-[#7A746C] w-14">
                                Sale:
                              </span>
                              {item.isOnSale ? (
                                <div className="flex items-center space-x-2">
                                  {editingPriceState?.id === item.id && editingPriceState.type === 'sale' ? (
                                    <div className="flex items-center space-x-1.5">
                                      <span className="text-xs font-serif text-[#8B3A2B]">₹</span>
                                      <input
                                        type="number"
                                        value={newPriceValue}
                                        onChange={(e) => setNewPriceValue(e.target.value)}
                                        className="w-20 bg-[#FAF7F2] border border-[#8B3A2B] px-2 py-0.5 text-xs font-mono focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveInlinePrice(item);
                                          if (e.key === 'Escape') setEditingPriceState(null);
                                        }}
                                      />
                                      <button
                                        onClick={() => handleSaveInlinePrice(item)}
                                        className="bg-[#8B3A2B] text-[#FAF7F2] p-1 hover:bg-[#722A1E]"
                                        title="Save sale price"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => setEditingPriceState(null)}
                                        className="text-[#7A746C] p-1 hover:text-[#23201D]"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ) : (
                                    <div
                                      onClick={() => {
                                        setEditingPriceState({ id: item.id, type: 'sale' });
                                        setNewPriceValue((item.salePriceNumeric || Math.round(item.priceNumeric * 0.8)).toString());
                                      }}
                                      className="group cursor-pointer inline-flex items-center space-x-1 px-1.5 py-0.5 hover:bg-[#ECE4D6] rounded-xs"
                                      title="Click to edit sale price"
                                    >
                                      <span className="bg-[#8B3A2B] text-[#FAF7F2] text-[8px] uppercase tracking-widest px-1 py-0.2 font-sans font-medium">
                                        SALE
                                      </span>
                                      <span className="font-serif text-sm font-semibold text-[#8B3A2B]">
                                        {item.salePrice || `₹${(item.salePriceNumeric || 0).toLocaleString('en-IN')}`}
                                      </span>
                                      <Edit2 className="w-2.5 h-2.5 text-[#8B3A2B] opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  )}
                                  <button
                                    onClick={() => handleToggleSale(item)}
                                    className="text-[10px] text-[#7A746C] hover:text-red-700 underline uppercase tracking-wider ml-1"
                                    title="Turn off sale"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleToggleSale(item)}
                                  className="text-[10px] uppercase tracking-wider text-[#23201D] hover:text-[#8B3A2B] border border-dashed border-[#D1C2AC] hover:border-[#8B3A2B] px-2 py-0.5 transition-colors flex items-center space-x-1"
                                  title="Put this item on sale"
                                >
                                  <Tag className="w-2.5 h-2.5" />
                                  <span>+ Put on Sale</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* INVENTORY / STOCK */}
                        <td className="py-4 px-6">
                          <div className="space-y-2">
                            {/* Stock Status Pill */}
                            <div className="flex items-center space-x-2">
                              {!isProductInStock(item) ? (
                                <span className="inline-flex items-center space-x-1.5 bg-[#8B3A2B]/10 border border-[#8B3A2B]/30 text-[#8B3A2B] text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B3A2B]" />
                                  <span>OUT OF STOCK</span>
                                </span>
                              ) : typeof item.stockQuantity === 'number' && item.stockQuantity <= 3 ? (
                                <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-800 text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                                  <span>LOW STOCK ({item.stockQuantity})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 bg-[#4A6741]/10 border border-[#4A6741]/30 text-[#4A6741] text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#4A6741]" />
                                  <span>IN STOCK ({item.stockQuantity ?? 10})</span>
                                </span>
                              )}
                            </div>

                            {/* Stepper & Number Controls */}
                            <div className="flex items-center space-x-2">
                              <div className="inline-flex items-center border border-[#D1C2AC] bg-[#FAF7F2]">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(item, -1)}
                                  className="w-6 h-6 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6] transition-colors"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                {editingStockId === item.id ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={newStockValue}
                                    onChange={(e) => setNewStockValue(e.target.value)}
                                    onBlur={() => handleSaveInlineStock(item)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineStock(item);
                                      if (e.key === 'Escape') setEditingStockId(null);
                                    }}
                                    autoFocus
                                    className="w-10 text-center text-xs font-mono bg-white border-x border-[#D1C2AC] focus:outline-none py-0.5"
                                  />
                                ) : (
                                  <span
                                    onClick={() => {
                                      setEditingStockId(item.id);
                                      setNewStockValue((item.stockQuantity ?? 10).toString());
                                    }}
                                    className="w-10 text-center text-xs font-mono text-[#23201D] cursor-pointer hover:bg-[#ECE4D6] py-0.5 select-none"
                                    title="Click to edit stock count directly"
                                  >
                                    {item.stockQuantity ?? 10}
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(item, 1)}
                                  className="w-6 h-6 flex items-center justify-center text-xs text-[#23201D] hover:bg-[#ECE4D6] transition-colors"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>
                              </div>

                              {/* One-Click Stock Toggle */}
                              <button
                                type="button"
                                onClick={() => handleToggleStock(item)}
                                className={`text-[10px] uppercase tracking-wider px-2 py-0.5 border transition-colors ${
                                  !isProductInStock(item)
                                    ? 'border-[#4A6741] text-[#4A6741] hover:bg-[#4A6741] hover:text-[#FAF7F2]'
                                    : 'border-[#8B3A2B] text-[#8B3A2B] hover:bg-[#8B3A2B] hover:text-[#FAF7F2]'
                                }`}
                                title={!isProductInStock(item) ? 'Mark item back in stock' : 'Mark item out of stock'}
                              >
                                {!isProductInStock(item) ? 'Restock' : 'Mark Out'}
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleStartEditProduct(item)}
                            className="p-1.5 text-[#7A746C] hover:text-[#23201D] transition-colors mr-2 inline-flex items-center"
                            title="Edit Product & Photos"
                          >
                            <Edit2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(item.id)}
                            className="p-1.5 text-[#7A746C] hover:text-red-700 transition-colors inline-flex items-center"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: LIST / EDIT HANDCRAFTED PRODUCT FORM */}
        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Column (7 Cols) */}
            <div className="lg:col-span-7 bg-[#FAF7F2] border border-[#E8E0D2] p-8 sm:p-10 shadow-sm">
              <div className="border-b border-[#E8E0D2] pb-6 mb-8 flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#7A746C] block mb-1">
                    {editingProductId ? 'EDITING CATALOGUE PIECE' : 'NEW LISTING'}
                  </span>
                  <h2 className="font-serif text-3xl text-[#23201D] font-light">
                    {editingProductId ? `Edit “${formData.name || 'Object'}”` : 'List a Handcrafted Object'}
                  </h2>
                  <p className="text-xs text-[#7A746C] mt-1 font-light">
                    Upload multiple photography angles, configure artisan technique, and set the live store price.
                  </p>
                </div>
                {editingProductId && (
                  <button
                    onClick={handleCancelEdit}
                    className="text-[10px] uppercase tracking-widest text-[#7A746C] hover:text-[#23201D] border border-[#D1C2AC] px-3 py-1.5"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-6">
                {/* 1. Multi-Photo Upload Dropzone & Gallery Manager */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-medium">
                      PRODUCT PHOTOGRAPHY * ({imagePreviews.length} {imagePreviews.length === 1 ? 'photo' : 'photos'})
                    </label>
                    {imagePreviews.length > 0 && (
                      <span className="text-[10px] text-[#7A746C]">
                        First photo is Cover · Click 'Set as Cover' or arrows to reorder
                      </span>
                    )}
                  </div>

                  {/* Clean Edge-to-Edge Framing Banner */}
                  <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-3 mb-3.5 flex items-center space-x-2.5">
                    <Sparkles className="w-4 h-4 text-[#23201D] shrink-0" />
                    <p className="text-[11px] text-[#23201D]">
                      <strong>Seamless Edge-to-Edge Photography:</strong> Uploaded photos automatically fill the 4:5 luxury frame edge-to-edge without artificial borders, letterboxing bars, or empty margins.
                    </p>
                  </div>

                  {/* Uploaded Photos Grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                      {imagePreviews.map((url, idx) => {
                        const isCover = idx === selectedCoverIndex;
                        return (
                          <div
                            key={idx}
                            className={`group relative aspect-[4/5] bg-[#ECE4D6] border-2 overflow-hidden transition-all ${
                              isCover
                                ? 'border-[#23201D] shadow-sm'
                                : 'border-[#E8E0D2] hover:border-[#AA9B87]'
                            }`}
                          >
                            <SafeImage
                              src={url}
                              alt={`Product angle ${idx + 1}`}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />

                            {/* Cover Badge / Button */}
                            {isCover ? (
                              <div className="absolute top-2 left-2 bg-[#23201D] text-[#FAF7F2] text-[9px] uppercase tracking-wider px-2 py-0.5 font-medium flex items-center space-x-1 shadow-xs z-10">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Cover</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setSelectedCoverIndex(idx)}
                                className="absolute top-2 left-2 bg-[#FAF7F2]/90 hover:bg-[#23201D] text-[#23201D] hover:text-[#FAF7F2] text-[8px] uppercase tracking-wider px-1.5 py-0.5 font-medium transition-colors opacity-0 group-hover:opacity-100 z-10 shadow-xs"
                              >
                                Set Cover
                              </button>
                            )}

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute top-2 right-2 w-6 h-6 bg-black/60 hover:bg-red-700 text-white flex items-center justify-center transition-colors rounded-xs z-10"
                              title="Remove photo"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Position Ordering Controls */}
                            <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-xs px-2 py-1 text-white text-[10px] z-10">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMovePhoto(idx, idx - 1)}
                                className="hover:text-amber-300 disabled:opacity-25 disabled:hover:text-white px-1"
                                title="Move left"
                              >
                                ←
                              </button>
                              <span className="font-mono text-[9px]">#{idx + 1}</span>
                              <button
                                type="button"
                                disabled={idx === imagePreviews.length - 1}
                                onClick={() => handleMovePhoto(idx, idx + 1)}
                                className="hover:text-amber-300 disabled:opacity-25 disabled:hover:text-white px-1"
                                title="Move right"
                              >
                                →
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add Another Photo Tile in Grid */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-[4/5] border-2 border-dashed border-[#D1C2AC] hover:border-[#23201D] bg-[#F4EFE6]/40 hover:bg-[#F4EFE6] flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-5 h-5 text-[#7A746C] mb-1 stroke-[1.5]" />
                        <span className="text-[10px] uppercase tracking-wider font-medium text-[#23201D]">
                          Add Photo
                        </span>
                        <span className="text-[9px] text-[#7A746C] mt-0.5">Upload more</span>
                      </div>
                    </div>
                  )}

                  {/* Dropzone Container */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-[#D1C2AC] hover:border-[#23201D] text-center cursor-pointer bg-[#F4EFE6]/40 transition-colors ${
                      imagePreviews.length === 0 ? 'p-8' : 'p-4'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleMultipleImageUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-[#7A746C] mx-auto mb-1.5 stroke-[1.5]" />
                    <p className="text-xs text-[#23201D] font-medium">
                      {imagePreviews.length === 0
                        ? 'Click to select multiple photos or drag & drop here'
                        : '+ Select additional photos from computer'}
                    </p>
                    <p className="text-[10px] text-[#7A746C] mt-0.5">
                      Upload multiple angles at once (JPEG, PNG, WebP)
                    </p>
                  </div>

                  {/* URL Paste Option */}
                  <div className="mt-2.5 flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="Or paste an image URL (e.g. Unsplash or Cloudinary)..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(urlInput);
                        }
                      }}
                      className="flex-1 bg-[#FAF7F2] border border-[#D1C2AC] px-3 py-1.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddImageUrl(urlInput)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider bg-[#23201D] text-[#FAF7F2] hover:bg-[#3A3027] shrink-0"
                    >
                      Add URL
                    </button>
                  </div>

                  {uploadingImage && (
                    <span className="text-[10px] text-[#7A746C] mt-2 block animate-pulse">
                      Processing & uploading photos to atelier store...
                    </span>
                  )}

                  {/* Storefront Display Fit Mode */}
                  <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-4 mt-4 space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] font-medium block">
                      STOREFRONT PRODUCT CARD DISPLAY FIT
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setFormData({ ...formData, imageFit: 'cover' })}
                        className={`flex items-start space-x-3 p-3 border cursor-pointer transition-colors ${
                          formData.imageFit === 'cover'
                            ? 'border-[#23201D] bg-white shadow-xs'
                            : 'border-[#E8E0D2] bg-[#FAF7F2] hover:border-[#AA9B87]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="imageFit"
                          checked={formData.imageFit === 'cover'}
                          onChange={() => setFormData({ ...formData, imageFit: 'cover' })}
                          className="mt-0.5 accent-[#23201D]"
                        />
                        <div>
                          <span className="text-xs font-medium text-[#23201D] block">
                            Fill Box Seamlessly (Cover) — Recommended
                          </span>
                          <span className="text-[10px] text-[#7A746C] leading-relaxed block mt-0.5">
                            Seamless luxury presentation. Fills the 4:5 frame edge-to-edge with zero borders or letterboxing bars.
                          </span>
                        </div>
                      </label>

                      <label
                        onClick={() => setFormData({ ...formData, imageFit: 'contain' })}
                        className={`flex items-start space-x-3 p-3 border cursor-pointer transition-colors ${
                          formData.imageFit === 'contain'
                            ? 'border-[#23201D] bg-white shadow-xs'
                            : 'border-[#E8E0D2] bg-[#FAF7F2] hover:border-[#AA9B87]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="imageFit"
                          checked={formData.imageFit === 'contain'}
                          onChange={() => setFormData({ ...formData, imageFit: 'contain' })}
                          className="mt-0.5 accent-[#23201D]"
                        />
                        <div>
                          <span className="text-xs font-medium text-[#23201D] block">
                            Fit Entire Photo (Contain)
                          </span>
                          <span className="text-[10px] text-[#7A746C] leading-relaxed block mt-0.5">
                            Displays full uncropped boundary of photo.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 2. Product Name */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                    PRODUCT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fluted German Silver Goblet / Carved Makrana Plinth"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                {/* 3. Pricing & Sale Configuration */}
                <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#23201D] font-semibold flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-[#23201D]" />
                      <span>PRICING & SALE CONFIGURATION *</span>
                    </span>
                    <span className="text-[10px] text-[#7A746C]">
                      Manage regular price and sale discounts
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* REGULAR PRICE IN INR */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                        REGULAR PRICE IN RUPEES (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center text-sm font-serif text-[#23201D]">
                          ₹
                        </span>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="e.g. 5200"
                          value={formData.priceNumeric}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priceNumeric: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-full bg-[#FAF7F2] border border-[#D1C2AC] pl-7 pr-3.5 py-2.5 text-xs text-[#23201D] font-mono focus:border-[#23201D] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#7A746C] mt-1 block">
                        Displays in store as: <strong className="font-serif text-[#23201D]">₹{Number(formData.priceNumeric || 0).toLocaleString('en-IN')}</strong>
                      </span>
                    </div>

                    {/* SALE TOGGLE & SALE PRICE */}
                    <div className="border-t sm:border-t-0 sm:border-l border-[#E8E0D2] pt-4 sm:pt-0 sm:pl-5 space-y-3">
                      <label className="flex items-center space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isOnSale}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              isOnSale: checked,
                              salePriceNumeric:
                                checked && (!formData.salePriceNumeric || formData.salePriceNumeric <= 0)
                                  ? Math.round(Number(formData.priceNumeric || 0) * 0.8)
                                  : formData.salePriceNumeric,
                            });
                          }}
                          className="w-4 h-4 accent-[#23201D] rounded"
                        />
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-[#23201D]">
                            Put This Product on SALE
                          </span>
                          <span className="bg-[#8B3A2B] text-[#FAF7F2] text-[8px] uppercase tracking-widest px-1.5 py-0.2 font-sans font-medium">
                            SALE
                          </span>
                        </div>
                      </label>

                      {formData.isOnSale && (
                        <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-[#8B3A2B] block font-medium">
                            SALE PRICE IN RUPEES (₹) *
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-sm font-serif text-[#8B3A2B]">
                              ₹
                            </span>
                            <input
                              type="number"
                              min="1"
                              placeholder="e.g. 4160"
                              value={formData.salePriceNumeric || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  salePriceNumeric: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-full bg-[#FAF7F2] border border-[#8B3A2B] pl-7 pr-3.5 py-2 text-xs text-[#8B3A2B] font-mono focus:border-[#8B3A2B] focus:outline-none font-semibold"
                            />
                          </div>

                          {formData.salePriceNumeric > 0 && formData.priceNumeric > formData.salePriceNumeric ? (
                            <div className="text-[11px] text-[#8B3A2B] flex items-center space-x-2 font-medium">
                              <span className="bg-[#8B3A2B]/10 px-2 py-0.5 rounded-xs">
                                Save {Math.round(((formData.priceNumeric - formData.salePriceNumeric) / formData.priceNumeric) * 100)}%
                              </span>
                              <span className="text-[#7A746C]">
                                (Save ₹{(formData.priceNumeric - formData.salePriceNumeric).toLocaleString('en-IN')})
                              </span>
                            </div>
                          ) : formData.salePriceNumeric >= formData.priceNumeric ? (
                            <span className="text-[10px] text-red-600 block">
                              Sale price should be lower than regular price (₹{Number(formData.priceNumeric || 0).toLocaleString('en-IN')}).
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. INVENTORY & STOCK STATUS */}
                <div className="bg-[#F4EFE6] border border-[#E8E0D2] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#E8E0D2] pb-2.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#23201D] font-semibold flex items-center space-x-1.5">
                      <Package className="w-3.5 h-3.5 text-[#23201D]" />
                      <span>INVENTORY & STOCK STATUS *</span>
                    </span>
                    <span className="text-[10px] text-[#7A746C]">
                      Manage available studio pieces & out-of-stock states
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* STOCK QUANTITY */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                        AVAILABLE STOCK QUANTITY (UNITS) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 10"
                        value={formData.stockQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          const qty = isNaN(val) ? 0 : Math.max(0, val);
                          setFormData({
                            ...formData,
                            stockQuantity: qty,
                            isOutOfStock: qty === 0 ? true : formData.isOutOfStock,
                          });
                        }}
                        className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] font-mono focus:border-[#23201D] focus:outline-none"
                      />
                      <span className="text-[10px] text-[#7A746C] mt-1 block">
                        If quantity is set to 0, item automatically shows as &quot;Sold Out&quot;.
                      </span>
                    </div>

                    {/* MANUAL OUT OF STOCK TOGGLE */}
                    <div className="border-t sm:border-t-0 sm:border-l border-[#E8E0D2] pt-4 sm:pt-0 sm:pl-5 space-y-2">
                      <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.isOutOfStock}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData({
                              ...formData,
                              isOutOfStock: checked,
                              stockQuantity: checked
                                ? 0
                                : formData.stockQuantity > 0
                                ? formData.stockQuantity
                                : 5,
                            });
                          }}
                          className="w-4 h-4 mt-0.5 accent-[#8B3A2B] rounded"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-[#23201D]">
                              Mark Item as Out of Stock (Sold Out)
                            </span>
                            {formData.isOutOfStock && (
                              <span className="bg-[#8B3A2B] text-[#FAF7F2] text-[8px] uppercase tracking-widest px-1.5 py-0.2 font-sans font-medium">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#7A746C] leading-relaxed block mt-1">
                            Disables direct &quot;Add to Cart&quot; on the website while keeping commission inquiries active.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 5. Category & Material */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                      CATEGORY *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as CraftCategory,
                        })
                      }
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none font-medium"
                    >
                      <option value="German Silver">German Silver</option>
                      <option value="Marble">Marble</option>
                      <option value="Fibre">Fibre</option>
                      <option value="Brass and Wood">Brass and Wood</option>
                    </select>
                    <span className="text-[10px] text-[#7A746C] mt-1 block">
                      Choose between German Silver, Marble, Fibre, or Brass and Wood
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                      NATURAL MATERIAL
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional German Silver / Makrana Marble"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 4. Origin & Craft Technique */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                      CRAFT ORIGIN
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jaipur, Rajasthan"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                      CRAFT TECHNIQUE
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ancestral Hand-Tooling / Chiseled Relief"
                      value={formData.craftTechnique}
                      onChange={(e) =>
                        setFormData({ ...formData, craftTechnique: e.target.value })
                      }
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 5. Short Description */}
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block mb-1.5 font-medium">
                    SHORT CATALOGUE DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description showing on product cards..."
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:border-[#23201D] focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-[#E8E0D2] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#23201D] hover:bg-[#3A3027] text-[#FAF7F2] px-8 py-4 text-[11px] font-sans tracking-[0.22em] uppercase transition-colors disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'SAVING TO DATABASE...'
                      : editingProductId
                      ? 'UPDATE PIECE IN LIVE STOREFRONT →'
                      : 'PUBLISH TO LIVE STOREFRONT →'}
                  </button>

                  {publishSuccess && (
                    <span className="text-xs text-green-800 font-medium flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-green-800" />
                      <span>{editingProductId ? 'Product Updated in Database!' : 'Product Saved in Database!'}</span>
                    </span>
                  )}

                  {publishError && (
                    <span className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 font-medium">
                      {publishError}
                    </span>
                  )}
                </div>
              </form>
            </div>

            {/* Live Storefront Preview Column (5 Cols) */}
            <div className="lg:col-span-5 sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] block">
                  LIVE STORE CARD PREVIEW
                </span>
                {imagePreviews.length > 1 && (
                  <span className="text-[10px] text-[#7A746C] font-mono">
                    {imagePreviews.length} Angles in Store Gallery
                  </span>
                )}
              </div>

              {/* Exact Card Preview */}
              <div className="group bg-[#FAF7F2] border border-[#E8E0D2] p-5 shadow-sm">
                {(imagePreviews[selectedCoverIndex] || imagePreviews[0]) ? (
                  <ProductCardImage
                    product={{
                      id: 'preview',
                      name: formData.name || 'Handcrafted Object',
                      slug: 'preview',
                      category: formData.category,
                      material: formData.material || 'Natural Material',
                      craftTechnique: formData.craftTechnique || '',
                      origin: formData.origin,
                      price: `₹${Number(formData.priceNumeric || 0).toLocaleString('en-IN')}`,
                      priceNumeric: formData.priceNumeric || 0,
                      shortDescription: formData.shortDescription,
                      editorialQuote: formData.editorialQuote,
                      longDescription: formData.longDescription,
                      heroImage: imagePreviews[selectedCoverIndex] || imagePreviews[0] || '',
                      images: [
                        imagePreviews[selectedCoverIndex] || imagePreviews[0],
                        ...imagePreviews.filter((_, idx) => idx !== selectedCoverIndex),
                      ],
                      galleryImages: [],
                      theMaking: {
                        materialSourcing: '',
                        handTechnique: '',
                        finishDetails: '',
                        careInstructions: [],
                        artisanNote: '',
                        makingImage: '',
                      },
                      imageFit: formData.imageFit,
                      isOnSale: Boolean(
                        formData.isOnSale &&
                        formData.salePriceNumeric &&
                        formData.salePriceNumeric > 0 &&
                        formData.salePriceNumeric < formData.priceNumeric
                      ),
                      salePriceNumeric: formData.salePriceNumeric,
                      salePrice: formData.salePriceNumeric
                        ? `₹${Number(formData.salePriceNumeric).toLocaleString('en-IN')}`
                        : undefined,
                      stockQuantity: Number(formData.stockQuantity),
                      isOutOfStock: Boolean(formData.isOutOfStock || Number(formData.stockQuantity) <= 0),
                    }}
                    fit={formData.imageFit}
                    aspectRatio="aspect-[4/5]"
                    className="mb-4"
                  >
                    {Boolean(formData.isOutOfStock || Number(formData.stockQuantity) <= 0) ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#5C554E] text-[#FAF7F2] text-[8px] font-sans tracking-[0.25em] uppercase px-1.5 py-0.5 font-medium shadow-xs">
                          SOLD OUT
                        </span>
                      </div>
                    ) : formData.isOnSale && formData.salePriceNumeric > 0 ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-[#23201D] text-[#FAF7F2] text-[8px] font-sans tracking-[0.25em] uppercase px-1.5 py-0.5 font-medium shadow-xs">
                          SALE
                        </span>
                      </div>
                    ) : null}

                    {imagePreviews.length > 1 && (
                      <div className="absolute top-2 right-2 bg-[#23201D]/80 backdrop-blur-sm text-[#FAF7F2] text-[9px] uppercase tracking-wider px-2 py-0.5 pointer-events-none">
                        Hover to Swap · {imagePreviews.length} Photos
                      </div>
                    )}
                  </ProductCardImage>
                ) : (
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#ECE4D6] mb-4 flex flex-col items-center justify-center text-[#7A746C]">
                    <Package className="w-8 h-8 mb-2 stroke-[1.2]" />
                    <span className="text-[10px] uppercase tracking-widest">
                      Photo Preview Area
                    </span>
                  </div>
                )}

                {/* Mini Thumbnail Strip in Preview */}
                {imagePreviews.length > 1 && (
                  <div className="grid grid-cols-5 gap-1.5 mb-4">
                    {imagePreviews.slice(0, 5).map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCoverIndex(i)}
                        className={`relative aspect-[4/3] bg-[#ECE4D6] overflow-hidden cursor-pointer border ${
                          selectedCoverIndex === i ? 'border-[#23201D]' : 'border-transparent opacity-60'
                        }`}
                      >
                        <SafeImage src={url} alt="Angle" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-xl text-[#23201D]">
                      {formData.name || 'Product Title'}
                    </h3>
                    {Boolean(formData.isOutOfStock || Number(formData.stockQuantity) <= 0) ? (
                      <span className="bg-[#8B3A2B] text-[#FAF7F2] text-[8px] uppercase tracking-widest px-1.5 py-0.2 font-sans font-medium">
                        SOLD OUT
                      </span>
                    ) : formData.isOnSale && formData.salePriceNumeric > 0 ? (
                      <span className="bg-[#8B3A2B] text-[#FAF7F2] text-[8px] uppercase tracking-widest px-1.5 py-0.2 font-sans font-medium">
                        SALE
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#4A6741] font-mono">
                        {formData.stockQuantity} in stock
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#7A746C] block">
                    {formData.category} · {formData.material || 'Material description'} · {formData.origin}
                  </span>
                  <div className="flex items-baseline gap-2 pt-1 font-serif">
                    {formData.isOnSale && formData.salePriceNumeric && formData.salePriceNumeric > 0 ? (
                      <>
                        <span className="text-base text-[#8B3A2B] font-semibold">
                          ₹{Number(formData.salePriceNumeric).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-[#7A746C] line-through">
                          ₹{Number(formData.priceNumeric || 0).toLocaleString('en-IN')}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-[#23201D] font-medium tracking-wide">
                        ₹{Number(formData.priceNumeric || 0).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS & CONSIGNMENT FULFILLMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header & Metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E8E0D2] pb-6">
              <div>
                <h2 className="font-serif text-2xl text-[#23201D] font-light">
                  Orders & Atelier Shipments
                </h2>
                <p className="text-xs text-[#7A746C] mt-1">
                  Verified patron consignments, Razorpay payment audit, and Shiprocket white-glove logistics.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={fetchOrders}
                  disabled={loadingOrders}
                  className="px-3.5 py-2 border border-[#D1C2AC] text-xs uppercase tracking-wider text-[#23201D] hover:bg-[#ECE4D6] transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
                  <span>REFRESH</span>
                </button>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                  Total Orders
                </span>
                <span className="font-serif text-2xl text-[#23201D] font-light mt-1 block">
                  {orders.length}
                </span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                  Verified Paid
                </span>
                <span className="font-serif text-2xl text-[#2A6638] font-light mt-1 block">
                  {orders.filter((o) => o.paymentStatus === 'paid').length}
                </span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                  Total Revenue
                </span>
                <span className="font-serif text-2xl text-[#23201D] font-light mt-1 block">
                  ₹
                  {orders
                    .filter((o) => o.paymentStatus === 'paid')
                    .reduce((sum, o) => sum + o.total, 0)
                    .toLocaleString('en-IN')}
                </span>
              </div>
              <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block">
                  Dispatched / Delivered
                </span>
                <span className="font-serif text-2xl text-[#AA9B87] font-light mt-1 block">
                  {orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'delivered').length}
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-2 border-b border-[#E8E0D2] pb-3 text-xs overflow-x-auto">
              {['all', 'paid', 'pending', 'shipped', 'delivered'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrderFilter(filter)}
                  className={`px-3 py-1.5 uppercase tracking-wider text-[11px] transition-colors ${
                    orderFilter === filter
                      ? 'bg-[#23201D] text-[#FAF7F2]'
                      : 'text-[#7A746C] hover:text-[#23201D]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Orders Listing */}
            {orders.length === 0 ? (
              <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-12 text-center">
                <Package className="w-10 h-10 text-[#D1C2AC] mx-auto mb-3 stroke-[1.2]" />
                <h3 className="font-serif text-lg text-[#23201D]">No Orders Recorded Yet</h3>
                <p className="text-xs text-[#7A746C] mt-1 max-w-sm mx-auto">
                  Orders placed through Razorpay checkout will automatically appear here with complete patron and shipment telemetry.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders
                  .filter((order) => {
                    if (orderFilter === 'all') return true;
                    if (orderFilter === 'paid') return order.paymentStatus === 'paid';
                    if (orderFilter === 'pending') return order.paymentStatus === 'pending';
                    if (orderFilter === 'shipped') return order.orderStatus === 'shipped';
                    if (orderFilter === 'delivered') return order.orderStatus === 'delivered';
                    return true;
                  })
                  .map((order) => (
                    <div
                      key={order.id}
                      className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 shadow-xs"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#F2ECE1] gap-3">
                        <div className="flex items-center space-x-3">
                          <Link
                            href={`/orders/${order.id}`}
                            target="_blank"
                            className="font-mono text-sm font-semibold text-[#23201D] hover:underline flex items-center space-x-1"
                          >
                            <span>{order.id}</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <span className="text-xs text-[#7A746C]">
                            {new Date(order.createdAt).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`text-[10px] uppercase tracking-widest px-2.5 py-0.5 border ${
                              order.paymentStatus === 'paid'
                                ? 'bg-[#2A6638]/10 text-[#2A6638] border-[#2A6638]/30 font-medium'
                                : order.paymentStatus === 'failed'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {order.paymentStatus === 'paid' ? '● Verified Paid' : order.paymentStatus}
                          </span>

                          <div className="flex items-center space-x-1.5">
                            <span className="text-[10px] uppercase text-[#7A746C]">Status:</span>
                            <select
                              value={order.orderStatus}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) =>
                                handleUpdateOrderStatus(
                                  order.id,
                                  e.target.value as OrderStatus
                                )
                              }
                              className="text-xs border border-[#D1C2AC] bg-[#FAF7F2] px-2 py-1 text-[#23201D] focus:outline-none"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Order Details Body */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                        {/* Patron & Shipping (4 cols) */}
                        <div className="md:col-span-4 text-xs space-y-2 border-r border-[#F2ECE1] pr-4">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block font-medium">
                            Patron Delivery Details
                          </span>
                          <div className="font-medium text-[#23201D]">{order.customer.name}</div>
                          <div className="text-[#57524A]">{order.customer.email}</div>
                          <div className="text-[#57524A]">{order.customer.phone}</div>
                          <div className="text-[#57524A] pt-1">
                            {order.customer.address}, {order.customer.city} - {order.customer.pincode}
                          </div>
                          {order.customer.giftNote && (
                            <div className="mt-2 p-2 bg-[#FAF7F2] border border-[#E8E0D2] italic text-[11px] text-[#57524A]">
                              Note: {order.customer.giftNote}
                            </div>
                          )}

                          <div className="pt-3 border-t border-[#F2ECE1] space-y-1 text-[11px]">
                            {order.razorpayPaymentId && (
                              <div className="text-[#7A746C]">
                                Razorpay Ref: <span className="font-mono text-[#23201D]">{order.razorpayPaymentId}</span>
                              </div>
                            )}
                            {order.shiprocketAWB && (
                              <div className="text-[#7A746C]">
                                Shiprocket AWB: <span className="font-mono text-[#23201D]">{order.shiprocketAWB}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Items Ordered (8 cols) */}
                        <div className="md:col-span-8 space-y-3">
                          <span className="text-[10px] uppercase tracking-[0.2em] text-[#7A746C] block font-medium">
                            Consignment Items ({order.items.length})
                          </span>

                          <div className="divide-y divide-[#F2ECE1]">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-3">
                                  <div className="relative w-10 h-12 bg-[#ECE4D6] shrink-0 overflow-hidden">
                                    <SafeImage src={item.heroImage} alt={item.name} fill className="object-cover" />
                                  </div>
                                  <div>
                                    <span className="font-serif text-sm text-[#23201D] block">{item.name}</span>
                                    <span className="text-[11px] text-[#7A746C]">
                                      Qty: {item.quantity} · {item.material || 'Handcrafted'}
                                    </span>
                                  </div>
                                </div>
                                <div className="font-serif text-xs text-[#23201D]">
                                  ₹{(item.priceNumeric * item.quantity).toLocaleString('en-IN')}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-baseline pt-3 border-t border-[#23201D] text-xs">
                            <span className="font-medium text-[#23201D] uppercase tracking-wider">
                              Total Remittance
                            </span>
                            <span className="font-serif text-base font-semibold text-[#23201D]">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
