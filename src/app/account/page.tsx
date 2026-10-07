'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SafeImage from '@/components/SafeImage';
import OrderTrackingTimeline from '@/components/OrderTrackingTimeline';
import {
  LayoutDashboard,
  Package,
  User,
  MapPin,
  Heart,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Order, CustomerProfile, Address, WishlistItem } from '@/types';

type AccountTab = 'overview' | 'orders' | 'profile' | 'addresses' | 'wishlist' | 'settings';

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#23201D] flex flex-col selection:bg-[#D1C2AC]/50">
      <Navbar cartCount={0} onOpenCart={() => {}} onOpenContact={() => {}} />

      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-[#AA9B87]" />
          </div>
        }
      >
        <AccountContent />
      </Suspense>

      <Footer />
    </div>
  );
}

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const configured = isSupabaseConfigured();

  const [activeTab, setActiveTab] = useState<AccountTab>(
    (searchParams.get('tab') as AccountTab) || 'overview'
  );

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({ total: 0, active: 0, completed: 0 });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({ fullName: '', phone: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password Change State
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false,
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Account Deletion State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Global notice
  const [notification, setNotification] = useState<string | null>(null);

  // 1. Initial Load: Check session & fetch patron data
  useEffect(() => {
    async function initAccount() {
      if (!configured) {
        setLoading(false);
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login?redirect=/account');
          return;
        }

        setUser(session.user);

        // Fetch in parallel
        const [profileRes, ordersRes, addressesRes, wishlistRes] = await Promise.all([
          fetch('/api/account/profile').then((r) => r.json()),
          fetch('/api/account/orders').then((r) => r.json()),
          fetch('/api/account/addresses').then((r) => r.json()),
          fetch('/api/account/wishlist').then((r) => r.json()),
        ]);

        if (profileRes.success && profileRes.profile) {
          setProfile(profileRes.profile);
          setProfileForm({
            fullName: profileRes.profile.fullName || '',
            phone: profileRes.profile.phone || '',
          });
        } else {
          setProfileForm({
            fullName: session.user.user_metadata?.full_name || '',
            phone: session.user.user_metadata?.phone || '',
          });
        }

        if (ordersRes.success) {
          setOrders(ordersRes.orders || []);
          if (ordersRes.stats) setOrderStats(ordersRes.stats);
        }

        if (addressesRes.success) {
          setAddresses(addressesRes.addresses || []);
        }

        if (wishlistRes.success) {
          setWishlist(wishlistRes.items || []);
        }
      } catch (err) {
        console.error('Account data initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAccount();
  }, [configured, router]);

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  // Profile Save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must contain at least 6 characters.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess(true);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(false), 3000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Address Save (Create or Update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);

    try {
      const url = editingAddressId
        ? `/api/account/addresses/${editingAddressId}`
        : '/api/account/addresses';
      const method = editingAddressId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh addresses
        const updatedRes = await fetch('/api/account/addresses').then((r) => r.json());
        if (updatedRes.success) setAddresses(updatedRes.addresses || []);
        setShowAddressModal(false);
        setEditingAddressId(null);
        setAddressForm({
          fullName: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAddress(false);
    }
  };

  // Set Default Address
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default' }),
      });
      if (res.ok) {
        const updatedRes = await fetch('/api/account/addresses').then((r) => r.json());
        if (updatedRes.success) setAddresses(updatedRes.addresses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you wish to delete this delivery address?')) return;
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Remove Wishlist Item
  const handleRemoveWishlist = async (productId: string) => {
    try {
      await fetch('/api/account/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  // Account Deletion Request
  const handleDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: deleteReason }),
      });
      if (res.ok) {
        setDeleteSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-28 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#AA9B87] mb-3" />
        <span className="text-xs uppercase tracking-[0.24em] font-sans text-[#7A746C]">
          Entering Atelier Dashboard...
        </span>
      </div>
    );
  }

  const patronDisplayName =
    profile?.fullName || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Patron';

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <main className="flex-1 max-w-[1300px] w-full mx-auto px-6 md:px-12 py-10 md:py-16">
      {/* Account Greeting Header */}
      <div className="mb-10 pb-8 border-b border-[#E8E0D2] flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] uppercase font-sans tracking-[0.28em] text-[#AA9B87] font-medium block mb-1.5">
            AUTHENTICATED PATRON
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#23201D] font-light tracking-wide">
            Welcome back, {patronDisplayName}
          </h1>
          <p className="text-xs text-[#7A746C] mt-2 font-light">
            {user?.email} · Member of the RUH STONE Handcraft Atelier
          </p>
        </div>

        {/* Stats Pill Badges */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="bg-[#FFFFFF] border border-[#E8E0D2] px-4 py-2.5 text-center shadow-xs">
            <span className="block font-serif text-lg sm:text-xl text-[#23201D] font-normal leading-none">
              {orderStats.total}
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A746C] mt-1 block">
              Total Orders
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E0D2] px-4 py-2.5 text-center shadow-xs">
            <span className="block font-serif text-lg sm:text-xl text-[#AA9B87] font-normal leading-none">
              {orderStats.active}
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A746C] mt-1 block">
              In Transit
            </span>
          </div>

          <div className="bg-[#FFFFFF] border border-[#E8E0D2] px-4 py-2.5 text-center shadow-xs">
            <span className="block font-serif text-lg sm:text-xl text-[#2A6638] font-normal leading-none">
              {orderStats.completed}
            </span>
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#7A746C] mt-1 block">
              Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Desktop Sidebar Navigation */}
        <aside className="lg:col-span-3 bg-[#FFFFFF] border border-[#E8E0D2] p-2 shadow-xs">
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
              { id: 'profile', label: 'Patron Profile', icon: User },
              { id: 'addresses', label: `Addresses (${addresses.length})`, icon: MapPin },
              { id: 'wishlist', label: `Wishlist (${wishlist.length})`, icon: Heart },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as AccountTab)}
                  className={`flex items-center space-x-3 px-4 py-3 text-xs font-sans tracking-[0.16em] uppercase transition-colors shrink-0 cursor-pointer text-left ${
                    isActive
                      ? 'bg-[#FAF7F2] text-[#23201D] font-medium border-l-2 border-[#23201D]'
                      : 'text-[#7A746C] hover:text-[#23201D] hover:bg-[#FAF7F2]/50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 stroke-[1.5]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <div className="hidden lg:block my-2 border-t border-[#F2ECE1]" />

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-4 py-3 text-xs font-sans tracking-[0.16em] uppercase text-[#7A746C] hover:text-[#B91C1C] hover:bg-[#FFF5F5] transition-colors shrink-0 cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4 shrink-0 stroke-[1.5]" />
              <span>Sign Out</span>
            </button>
          </nav>
        </aside>

        {/* Tab Content Area */}
        <div className="lg:col-span-9">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Active Order Spotlight */}
              {latestOrder ? (
                <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#F2ECE1] gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium">
                        MOST RECENT CONSIGNMENT
                      </span>
                      <h2 className="font-serif text-xl text-[#23201D] mt-0.5">
                        Order #{latestOrder.orderNumber || latestOrder.id}
                      </h2>
                    </div>
                    <Link
                      href={`/account/orders/${latestOrder.id}`}
                      className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-[0.18em] text-[#23201D] hover:text-[#AA9B87] transition-colors"
                    >
                      <span>Full Provenance & Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="py-6">
                    <OrderTrackingTimeline
                      orderStatus={latestOrder.orderStatus}
                      paymentStatus={latestOrder.paymentStatus}
                      courierName={latestOrder.shiprocketCourier}
                      awb={latestOrder.shiprocketAWB}
                      trackingUrl={latestOrder.shiprocketTrackingUrl}
                    />
                  </div>

                  <div className="pt-4 border-t border-[#F2ECE1] flex flex-wrap items-center justify-between text-xs text-[#7A746C] gap-4">
                    <span>
                      Total:{' '}
                      <strong className="text-[#23201D] font-serif text-sm">
                        ₹{latestOrder.total.toLocaleString('en-IN')}
                      </strong>
                    </span>
                    <span>
                      Items:{' '}
                      <strong className="text-[#23201D]">
                        {latestOrder.items.reduce((acc, i) => acc + i.quantity, 0)} pieces
                      </strong>
                    </span>
                    <span>
                      Acquired:{' '}
                      <strong className="text-[#23201D]">
                        {new Date(latestOrder.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-12 text-center">
                  <Package className="w-8 h-8 text-[#AA9B87] mx-auto mb-3 stroke-[1.2]" />
                  <h3 className="font-serif text-lg text-[#23201D] mb-1 font-normal">
                    No Order Consignments Yet
                  </h3>
                  <p className="text-xs text-[#7A746C] max-w-sm mx-auto mb-6 leading-relaxed">
                    Explore our hand-carved stone vessels, wheel-thrown ceramics, and quiet luxury objects.
                  </p>
                  <Link
                    href="/#shop"
                    className="inline-block bg-[#23201D] text-[#FAF7F2] px-6 py-2.5 text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#3D352E] transition-colors"
                  >
                    Explore Handcrafted Collection
                  </Link>
                </div>
              )}

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Default Address Snippet */}
                <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1]">
                    <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium">
                      PRIMARY SHIPPING DESTINATION
                    </span>
                    <button
                      onClick={() => setActiveTab('addresses')}
                      className="text-xs text-[#23201D] hover:text-[#AA9B87] uppercase tracking-[0.16em]"
                    >
                      Manage →
                    </button>
                  </div>
                  {defaultAddress ? (
                    <div className="pt-4 text-xs space-y-1">
                      <div className="font-medium text-[#23201D]">{defaultAddress.fullName}</div>
                      <div className="text-[#7A746C]">{defaultAddress.addressLine1}</div>
                      {defaultAddress.addressLine2 && (
                        <div className="text-[#7A746C]">{defaultAddress.addressLine2}</div>
                      )}
                      <div className="text-[#7A746C]">
                        {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.postalCode}
                      </div>
                      <div className="text-[#7A746C]">{defaultAddress.phone}</div>
                    </div>
                  ) : (
                    <div className="pt-4 text-xs text-[#7A746C]">
                      No delivery address recorded.{' '}
                      <button
                        onClick={() => {
                          setActiveTab('addresses');
                          setShowAddressModal(true);
                        }}
                        className="text-[#23201D] underline ml-1"
                      >
                        Add your address
                      </button>
                    </div>
                  )}
                </div>

                {/* Concierge Support Banner */}
                <div className="bg-[#FAF7F2] border border-[#E8E0D2] p-6 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block mb-2">
                      ATELIER CONCIERGE & CARE
                    </span>
                    <h3 className="font-serif text-lg text-[#23201D] font-normal">
                      Need custom dimensions or provenance assistance?
                    </h3>
                    <p className="text-xs text-[#7A746C] mt-2 leading-relaxed">
                      Our Jaipur studio offers dedicated artisan support, custom sizing consultations, and white-glove logistics coordination.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[#E8E0D2]/60">
                    <a
                      href="mailto:support@ruhstone.com"
                      className="text-xs uppercase tracking-[0.18em] text-[#23201D] hover:text-[#AA9B87] transition-colors"
                    >
                      support@ruhstone.com →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS LIST */}
          {activeTab === 'orders' && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8">
              <div className="pb-6 border-b border-[#F2ECE1] mb-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                    CONSIGNMENT HISTORY
                  </span>
                  <h2 className="font-serif text-2xl text-[#23201D] font-light">
                    Acquisition Records
                  </h2>
                </div>
                <span className="text-xs text-[#7A746C]">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} total
                </span>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <Package className="w-8 h-8 text-[#AA9B87] mx-auto mb-3 stroke-[1.2]" />
                  <p className="text-xs text-[#7A746C] mb-4">You have not placed any orders yet.</p>
                  <Link
                    href="/#shop"
                    className="inline-block bg-[#23201D] text-[#FAF7F2] px-6 py-2.5 text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#3D352E] transition-colors"
                  >
                    Browse Collections
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => {
                    const firstItem = order.items?.[0];
                    const itemCount = order.items?.reduce((a, b) => a + b.quantity, 0) || 1;

                    return (
                      <div
                        key={order.id}
                        className="border border-[#E8E0D2] p-5 sm:p-6 hover:border-[#D1C2AC] transition-all bg-[#FAF7F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                      >
                        {/* Left: Thumbnail & Details */}
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F0EAE1] border border-[#E8E0D2] shrink-0 relative overflow-hidden">
                            {firstItem?.heroImage ? (
                              <SafeImage
                                src={firstItem.heroImage}
                                alt={firstItem.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#AA9B87]">
                                <Package className="w-6 h-6 stroke-[1]" />
                              </div>
                            )}
                          </div>

                          <div>
                            <span className="font-mono text-xs text-[#23201D] font-semibold block">
                              #{order.orderNumber || order.id}
                            </span>
                            <span className="font-serif text-sm sm:text-base text-[#23201D] mt-0.5 block">
                              {firstItem?.name || 'Handcrafted Pieces'}{' '}
                              {order.items.length > 1 && (
                                <span className="text-xs font-sans text-[#7A746C]">
                                  +{order.items.length - 1} more
                                </span>
                              )}
                            </span>
                            <span className="text-[11px] text-[#7A746C] mt-1 block">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}{' '}
                              · {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
                            </span>
                          </div>
                        </div>

                        {/* Right: Status, Total & Action */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F2ECE1]">
                          <div className="text-left sm:text-right">
                            <span className="font-serif text-base text-[#23201D] font-medium block">
                              ₹{order.total.toLocaleString('en-IN')}
                            </span>
                            <span
                              className={`text-[9px] font-sans uppercase tracking-[0.18em] px-2 py-0.5 border inline-block mt-1 ${
                                order.orderStatus === 'delivered'
                                  ? 'bg-[#F2F8F4] text-[#2A6638] border-[#CDE5D4]'
                                  : 'bg-[#FFFFFF] text-[#7A746C] border-[#E8E0D2]'
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </div>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="mt-2 text-xs font-sans uppercase tracking-[0.2em] bg-[#23201D] text-[#FAF7F2] hover:bg-[#3D352E] px-4 py-2 transition-colors inline-flex items-center space-x-1.5"
                          >
                            <span>View Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PATRON PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8 space-y-8">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                  PROFILE MANAGEMENT
                </span>
                <h2 className="font-serif text-2xl text-[#23201D] font-light">
                  Patron Information
                </h2>
                <p className="text-xs text-[#7A746C] mt-1">
                  Keep your personal consignment details and concierge contact records accurate.
                </p>
              </div>

              {profileSuccess && (
                <div className="p-3.5 bg-[#F2F8F4] border border-[#CDE5D4] text-[#2A6638] text-xs flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Your patron profile details have been saved successfully.</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1.5 font-medium">
                    Email Address <span className="text-[10px] text-[#AA9B87] lowercase">(managed via Supabase Auth)</span>
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full bg-[#F5EFE6] border border-[#E8E0D2] px-3.5 py-2.5 text-xs text-[#7A746C] cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] px-6 py-2.5 text-xs font-sans uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                >
                  {savingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </form>

              {/* Security & Password Change Section */}
              <div className="pt-8 border-t border-[#F2ECE1]">
                <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                  SECURITY & CREDENTIALS
                </span>
                <h3 className="font-serif text-lg text-[#23201D] mt-1 mb-2 font-normal">
                  Change Password
                </h3>
                <p className="text-xs text-[#7A746C] mb-5">
                  Update your account password via Supabase Auth encryption.
                </p>

                {passwordError && (
                  <div className="mb-4 p-3 bg-[#FFF5F5] border border-[#F5C2C2] text-[#B91C1C] text-xs">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="mb-4 p-3 bg-[#F2F8F4] border border-[#CDE5D4] text-[#2A6638] text-xs flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Your password has been changed securely.</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2.5 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D] transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] px-6 py-2.5 text-xs font-sans uppercase tracking-[0.2em] transition-colors disabled:opacity-50 cursor-pointer flex items-center space-x-2"
                  >
                    {savingPassword ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </form>
              </div>

              {/* Danger Zone: Account Deletion Request */}
              <div className="pt-8 border-t border-[#F2ECE1]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs uppercase font-sans tracking-wider text-[#B91C1C] font-semibold">
                      Request Account Deletion
                    </h3>
                    <p className="text-xs text-[#7A746C] mt-0.5">
                      Permanently anonymize your customer record and associated personal information.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-xs uppercase tracking-wider text-[#B91C1C] border border-[#F5C2C2] hover:bg-[#FFF5F5] px-4 py-2 transition-colors cursor-pointer"
                  >
                    Request Deletion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#F2ECE1] gap-4">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                    DESTINATION REGISTER
                  </span>
                  <h2 className="font-serif text-2xl text-[#23201D] font-light">
                    Shipping Addresses
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      fullName: profile?.fullName || '',
                      phone: profile?.phone || '',
                      addressLine1: '',
                      addressLine2: '',
                      city: '',
                      state: '',
                      postalCode: '',
                      country: 'India',
                      isDefault: addresses.length === 0,
                    });
                    setShowAddressModal(true);
                  }}
                  className="bg-[#23201D] hover:bg-[#3D352E] text-[#FAF7F2] px-4 py-2.5 text-xs font-sans uppercase tracking-[0.18em] transition-colors inline-flex items-center space-x-2 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-8 h-8 text-[#AA9B87] mx-auto mb-3 stroke-[1.2]" />
                  <p className="text-xs text-[#7A746C]">No delivery addresses registered.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border p-6 relative transition-all ${
                        address.isDefault
                          ? 'border-[#23201D] bg-[#FAF7F2]'
                          : 'border-[#E8E0D2] bg-[#FFFFFF] hover:border-[#D1C2AC]'
                      }`}
                    >
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 text-[9px] uppercase font-sans tracking-[0.2em] bg-[#23201D] text-[#FAF7F2] px-2 py-0.5">
                          DEFAULT
                        </span>
                      )}

                      <div className="text-xs space-y-1.5 pr-16">
                        <div className="font-medium text-[#23201D] text-sm font-serif">
                          {address.fullName}
                        </div>
                        <div className="text-[#57524A]">{address.addressLine1}</div>
                        {address.addressLine2 && (
                          <div className="text-[#57524A]">{address.addressLine2}</div>
                        )}
                        <div className="text-[#57524A]">
                          {address.city}, {address.state} - {address.postalCode}
                        </div>
                        <div className="text-[#7A746C] pt-1">Phone: {address.phone}</div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-[#E8E0D2] flex items-center justify-between text-xs">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-[#7A746C] hover:text-[#23201D] uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
                          >
                            Set as default
                          </button>
                        )}
                        <div className="flex items-center space-x-4 ml-auto">
                          <button
                            onClick={() => {
                              setEditingAddressId(address.id);
                              setAddressForm({
                                fullName: address.fullName,
                                phone: address.phone,
                                addressLine1: addressLine1Clean(address),
                                addressLine2: address.addressLine2 || '',
                                city: address.city,
                                state: address.state,
                                postalCode: address.postalCode,
                                country: address.country || 'India',
                                isDefault: address.isDefault,
                              });
                              setShowAddressModal(true);
                            }}
                            className="text-[#7A746C] hover:text-[#23201D] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-[#7A746C] hover:text-[#B91C1C] inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8 space-y-6">
              <div className="pb-6 border-b border-[#F2ECE1] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                    CURATED SAVED PIECES
                  </span>
                  <h2 className="font-serif text-2xl text-[#23201D] font-light">
                    Patron Wishlist
                  </h2>
                </div>
                <span className="text-xs text-[#7A746C]">{wishlist.length} saved</span>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <Heart className="w-8 h-8 text-[#AA9B87] mx-auto mb-3 stroke-[1.2]" />
                  <p className="text-xs text-[#7A746C] mb-4">No handcrafted pieces saved yet.</p>
                  <Link
                    href="/#shop"
                    className="inline-block bg-[#23201D] text-[#FAF7F2] px-6 py-2.5 text-xs font-sans tracking-[0.2em] uppercase hover:bg-[#3D352E] transition-colors"
                  >
                    Discover Heirlooms
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => {
                    const p = item.product;
                    if (!p) return null;
                    return (
                      <div
                        key={item.id}
                        className="group border border-[#E8E0D2] bg-[#FAF7F2]/20 hover:border-[#D1C2AC] transition-all flex flex-col"
                      >
                        <div className="aspect-square relative overflow-hidden bg-[#F0EAE1]">
                          <SafeImage
                            src={p.heroImage}
                            alt={p.name}
                            fill
                            className="object-cover group-hover:scale-102 transition-transform duration-500"
                          />
                          <button
                            onClick={() => handleRemoveWishlist(p.id)}
                            className="absolute top-3 right-3 p-1.5 bg-[#FFFFFF]/90 hover:bg-[#FFFFFF] text-[#7A746C] hover:text-[#B91C1C] rounded-full transition-colors shadow-xs"
                            aria-label="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#AA9B87]">
                              {p.category}
                            </span>
                            <h3 className="font-serif text-base text-[#23201D] mt-0.5 line-clamp-1">
                              {p.name}
                            </h3>
                            <span className="font-serif text-sm text-[#23201D] font-medium mt-1 block">
                              {p.price}
                            </span>
                          </div>
                          <Link
                            href={`/products/${p.slug}`}
                            className="mt-4 w-full bg-[#23201D] text-[#FAF7F2] hover:bg-[#3D352E] py-2 text-center text-[11px] font-sans uppercase tracking-[0.2em] transition-colors"
                          >
                            View Piece
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-[#FFFFFF] border border-[#E8E0D2] p-6 sm:p-8 space-y-8">
              <div>
                <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#AA9B87] font-medium block">
                  ACCOUNT CONFIGURATION
                </span>
                <h2 className="font-serif text-2xl text-[#23201D] font-light">
                  Preferences & Session
                </h2>
              </div>

              <div className="space-y-6 max-w-lg text-xs">
                <div className="p-4 bg-[#FAF7F2] border border-[#E8E0D2] space-y-2">
                  <div className="font-medium text-[#23201D]">Authenticated Session</div>
                  <div className="text-[#7A746C]">
                    Signed in as <strong className="text-[#23201D]">{user?.email}</strong> via Supabase Auth.
                  </div>
                  <div className="text-[#7A746C] text-[11px]">
                    User Identifier: <code className="font-mono">{user?.id}</code>
                  </div>
                </div>

                <div className="p-4 bg-[#FAF7F2] border border-[#E8E0D2] space-y-2">
                  <div className="font-medium text-[#23201D]">Transactional Dispatch</div>
                  <div className="text-[#7A746C]">
                    Order confirmations, white-glove dispatch notifications, and consignment receipts are automatically routed to your registered email.
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSignOut}
                    className="bg-[#23201D] text-[#FAF7F2] hover:bg-[#3D352E] px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center space-x-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Atelier</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-[#23201D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E0D2] max-w-lg w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE1] mb-5">
              <h3 className="font-serif text-xl text-[#23201D]">
                {editingAddressId ? 'Edit Address' : 'New Delivery Address'}
              </h3>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-[#7A746C] hover:text-[#23201D] text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  placeholder="Recipient Name"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                  Address Line 1
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="House/Villa No, Street, Landmark"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  placeholder="Apartment, Suite, Unit"
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="Jaipur / Mumbai"
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    placeholder="Rajasthan"
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="302001"
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-sans uppercase tracking-[0.2em] text-[#7A746C] mb-1 font-medium">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full bg-[#FAF7F2] border border-[#D1C2AC] px-3.5 py-2 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded-none border-[#D1C2AC] text-[#23201D]"
                />
                <label htmlFor="isDefault" className="text-xs text-[#23201D]">
                  Set as default shipping address
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs uppercase tracking-wider text-[#7A746C] hover:text-[#23201D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="bg-[#23201D] text-[#FAF7F2] hover:bg-[#3D352E] px-6 py-2.5 text-xs uppercase tracking-[0.2em] transition-colors disabled:opacity-50"
                >
                  {savingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#23201D]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E8E0D2] max-w-md w-full p-6 sm:p-8">
            <h3 className="font-serif text-xl text-[#23201D] mb-2">Request Account Deletion</h3>
            {deleteSuccess ? (
              <div className="text-center py-4">
                <p className="text-xs text-[#2A6638] mb-4">
                  Your request has been recorded. Our data protection concierge will contact you
                  shortly.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSuccess(false);
                  }}
                  className="bg-[#23201D] text-[#FAF7F2] px-6 py-2 text-xs uppercase tracking-wider"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleDeleteRequest} className="space-y-4">
                <p className="text-xs text-[#7A746C] leading-relaxed">
                  In compliance with privacy standards, we will process your deletion request.
                  Please share any reason if you wish:
                </p>
                <textarea
                  rows={3}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Optional reason for closing account..."
                  className="w-full bg-[#FAF7F2] border border-[#D1C2AC] p-3 text-xs text-[#23201D] focus:outline-none focus:border-[#23201D]"
                />
                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-xs uppercase tracking-wider text-[#7A746C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deleting}
                    className="bg-[#B91C1C] text-[#FFFFFF] px-5 py-2 text-xs uppercase tracking-wider hover:bg-[#991B1B] transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function addressLine1Clean(address: Address): string {
  return address.addressLine1 || '';
}
