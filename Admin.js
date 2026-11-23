<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - The Golgappa House</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body {
      font-family: 'Nunito', sans-serif;
      background-color: #FFF8ED;
      color: #392D27;
    }
    h1, h2, h3, h4, h5, h6, .font-heading {
      font-family: 'Poppins', sans-serif;
    }
    .clay-card {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 10px 10px 20px rgba(57, 45, 39, 0.06), -10px -10px 20px rgba(255, 255, 255, 0.8);
    }
    .clay-button {
      background: linear-gradient(135deg, #FF6B35 0%, #FF4500 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 4px 4px 12px rgba(255, 107, 53, 0.3), -4px -4px 12px rgba(255, 255, 255, 0.7);
      transition: all 0.2s ease;
    }
    .clay-button:hover {
      transform: translateY(-2px);
      box-shadow: 6px 6px 16px rgba(255, 107, 53, 0.4);
    }
    .clay-input {
      background: #FFF8ED;
      border: 2px solid #F3E5D8;
      border-radius: 14px;
    }
    .clay-input:focus {
      outline: none;
      border-color: #FF6B35;
      background: #FFFFFF;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- Login Screen -->
  <div id="loginScreen" class="fixed inset-0 z-50 bg-[#FFF8ED] flex items-center justify-center p-4">
    <div class="clay-card max-w-md w-full p-8 sm:p-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FFD166] flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">🔐</div>
        <h2 class="font-heading font-black text-2xl text-[#392D27]">Admin Portal</h2>
        <p class="text-xs text-[#392D27]/70 mt-1">The Golgappa House Management</p>
      </div>

      <form id="loginForm" onsubmit="handleAdminLogin(event)" class="space-y-6">
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">Admin Username</label>
          <input type="text" id="adminUsername" required class="clay-input w-full px-4 py-3 text-sm" placeholder="admin">
        </div>
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider mb-2">Password</label>
          <input type="password" id="adminPassword" required class="clay-input w-full px-4 py-3 text-sm" placeholder="••••••••">
        </div>
        <div id="loginError" class="hidden p-3 rounded-xl bg-red-100 border border-red-300 text-red-700 text-xs font-bold"></div>
        <button type="submit" class="clay-button w-full py-3.5 font-extrabold text-sm">Login to Dashboard</button>
      </form>
      <div class="mt-6 text-center">
        <a href="/" class="text-xs font-bold text-[#FF6B35] hover:underline">← Back to Customer Website</a>
      </div>
    </div>
  </div>

  <!-- Dashboard Main Layout -->
  <div id="dashboardApp" class="hidden flex-grow flex flex-col lg:flex-row">
    <!-- Sidebar -->
    <aside class="w-full lg:w-72 bg-white border-r border-[#F3E5D8] p-6 flex flex-col justify-between shrink-0">
      <div>
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center text-xl text-white">🟢</div>
          <div>
            <h1 class="font-heading font-black text-lg text-[#392D27]">GOLGAPPA HOUSE</h1>
            <span class="text-xs font-bold text-[#FF6B35] uppercase tracking-widest">Admin Dashboard</span>
          </div>
        </div>

        <nav class="space-y-2">
          <button onclick="switchTab('bookings')" id="navBookings" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm bg-[#FF6B35] text-white transition">
            <span>📋</span> Bookings Management
          </button>
          <button onclick="switchTab('customers')" id="navCustomers" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-[#392D27] hover:bg-[#FFF8ED] transition">
            <span>👥</span> Customer Directory
          </button>
        </nav>
      </div>

      <div class="pt-6 border-t border-[#F3E5D8]">
        <a href="/" target="_blank" class="flex items-center gap-2 text-xs font-bold text-[#392D27]/70 hover:text-[#FF6B35] mb-4">
          <span>🌐</span> View Live Website ↗
        </a>
        <button onclick="handleLogout()" class="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-sm transition">
          <span>🚪</span> Logout Admin
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="flex-grow p-6 lg:p-10 overflow-y-auto">
      
      <!-- Top Header Bar -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 id="pageTitle" class="font-heading font-black text-2xl sm:text-3xl text-[#392D27]">Event Bookings</h2>
          <p class="text-xs text-[#392D27]/70 mt-1">Manage catering orders, statuses, and customer records.</p>
        </div>
        <button onclick="loadDashboardData()" class="clay-button px-4 py-2.5 text-xs font-bold flex items-center gap-2">
          <span>🔄</span> Refresh Data
        </button>
      </div>

      <!-- Stats Overview Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-[#392D27]/70 uppercase tracking-wider">Total Bookings</p>
          <h3 id="statTotal" class="font-heading font-black text-2xl mt-1 text-[#392D27]">0</h3>
        </div>
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-amber-600 uppercase tracking-wider">Pending</p>
          <h3 id="statPending" class="font-heading font-black text-2xl mt-1 text-amber-600">0</h3>
        </div>
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">Confirmed</p>
          <h3 id="statConfirmed" class="font-heading font-black text-2xl mt-1 text-blue-600">0</h3>
        </div>
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</p>
          <h3 id="statCompleted" class="font-heading font-black text-2xl mt-1 text-green-600">0</h3>
        </div>
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-red-600 uppercase tracking-wider">Cancelled</p>
          <h3 id="statCancelled" class="font-heading font-black text-2xl mt-1 text-red-600">0</h3>
        </div>
        <div class="clay-card p-4">
          <p class="text-xs font-bold text-purple-600 uppercase tracking-wider">Est. Revenue</p>
          <h3 id="statRevenue" class="font-heading font-black text-xl mt-1 text-purple-600">₹0</h3>
        </div>
      </div>

      <!-- Bookings Tab Content -->
      <div id="tabBookingsContent" class="space-y-6">
        <!-- Filters & Search Bar -->
        <div class="clay-card p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div class="w-full lg:w-96">
            <input type="text" id="searchInput" oninput="debounceSearch()" placeholder="Search by ID, Name, Phone, Email..." class="clay-input w-full px-4 py-2.5 text-sm">
          </div>
          <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <select id="statusFilter" onchange="loadBookings()" class="clay-input px-3 py-2 text-xs font-bold">
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select id="eventFilter" onchange="loadBookings()" class="clay-input px-3 py-2 text-xs font-bold">
              <option value="All">All Event Types</option>
              <option value="Wedding Catering">Wedding Catering</option>
              <option value="Birthday Party">Birthday Party</option>
              <option value="Engagement Ceremony">Engagement Ceremony</option>
              <option value="Corporate Event">Corporate Event</option>
              <option value="Family Function">Family Function</option>
              <option value="Festival Celebration">Festival Celebration</option>
            </select>
          </div>
        </div>

        <!-- Bookings Table -->
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#FFF8ED] border-b border-[#F3E5D8] text-xs font-black uppercase text-[#392D27]/70">
                  <th class="p-4">Booking ID</th>
                  <th class="p-4">Customer</th>
                  <th class="p-4">Event Type</th>
                  <th class="p-4">Date & Time</th>
                  <th class="p-4">Guests</th>
                  <th class="p-4">Package</th>
                  <th class="p-4">Status</th>
                  <th class="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="bookingsTableBody" class="divide-y divide-[#F3E5D8] text-sm">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Customers Tab Content -->
      <div id="tabCustomersContent" class="hidden space-y-6">
        <div class="clay-card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-[#FFF8ED] border-b border-[#F3E5D8] text-xs font-black uppercase text-[#392D27]/70">
                  <th class="p-4">Customer Name</th>
                  <th class="p-4">Phone Number</th>
                  <th class="p-4">Email Address</th>
                  <th class="p-4">City</th>
                  <th class="p-4">Total Bookings</th>
                  <th class="p-4">Last Booking Date</th>
                </tr>
              </thead>
              <tbody id="customersTableBody" class="divide-y divide-[#F3E5D8] text-sm">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </main>
  </div>

  <!-- Booking Details Modal -->
  <div id="bookingModal" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="clay-card bg-white max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between pb-4 border-b border-[#F3E5D8] mb-6">
        <h3 class="font-heading font-black text-xl text-[#392D27]">Booking Details</h3>
        <button onclick="closeBookingModal()" class="w-8 h-8 rounded-full bg-[#FFF8ED] flex items-center justify-center font-bold hover:bg-[#F3E5D8]">✕</button>
      </div>

      <div id="modalContent" class="space-y-4 text-sm">
        <!-- Populated via JS -->
      </div>

      <div class="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-[#F3E5D8]">
        <button onclick="updateBookingStatusModal('Confirmed')" class="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700">Confirm Booking</button>
        <button onclick="updateBookingStatusModal('Completed')" class="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs hover:bg-green-700">Mark Completed</button>
        <button onclick="updateBookingStatusModal('Rejected')" class="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700">Reject Booking</button>
        <button onclick="deleteBookingModal()" class="px-4 py-2 rounded-xl bg-[#392D27] text-white font-bold text-xs hover:bg-black">Delete</button>
      </div>
    </div>
  </div>

  <script>
    lucide.createIcons();
    let currentActiveBookingId = null;
    let searchTimeout = null;

    // Check auth on load
    window.addEventListener('DOMContentLoaded', () => {
      loadDashboardData();
    });

    async function handleAdminLogin(e) {
      e.preventDefault();
      const username = document.getElementById('adminUsername').value;
      const password = document.getElementById('adminPassword').value;
      const loginError = document.getElementById('loginError');
      loginError.classList.add('hidden');

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          document.getElementById('loginScreen').classList.add('hidden');
          document.getElementById('dashboardApp').classList.remove('hidden');
          loadDashboardData();
        } else {
          loginError.innerText = data.error || 'Invalid credentials.';
          loginError.classList.remove('hidden');
        }
      } catch (err) {
        loginError.innerText = 'Network error during login.';
        loginError.classList.remove('hidden');
      }
    }

    async function handleLogout() {
      try {
        await fetch('/api/admin/logout', { method: 'POST' });
        location.reload();
      } catch (err) {
        location.reload();
      }
    }

    function switchTab(tab) {
      const navBookings = document.getElementById('navBookings');
      const navCustomers = document.getElementById('navCustomers');
      const tabBookingsContent = document.getElementById('tabBookingsContent');
      const tabCustomersContent = document.getElementById('tabCustomersContent');
      const pageTitle = document.getElementById('pageTitle');

      if (tab === 'bookings') {
        navBookings.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm bg-[#FF6B35] text-white transition";
        navCustomers.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-[#392D27] hover:bg-[#FFF8ED] transition";
        tabBookingsContent.classList.remove('hidden');
        tabCustomersContent.classList.add('hidden');
        pageTitle.innerText = "Event Bookings";
        loadBookings();
      } else {
        navCustomers.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm bg-[#FF6B35] text-white transition";
        navBookings.className = "w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm text-[#392D27] hover:bg-[#FFF8ED] transition";
        tabCustomersContent.classList.remove('hidden');
        tabBookingsContent.classList.add('hidden');
        pageTitle.innerText = "Customer Directory";
        loadCustomers();
      }
    }

    async function loadDashboardData() {
      try {
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.status === 401) {
          document.getElementById('loginScreen').classList.remove('hidden');
          document.getElementById('dashboardApp').classList.add('hidden');
          return;
        }
        const stats = await statsRes.json();
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('dashboardApp').classList.remove('hidden');

        document.getElementById('statTotal').innerText = stats.totalBookings;
        document.getElementById('statPending').innerText = stats.pendingBookings;
        document.getElementById('statConfirmed').innerText = stats.confirmedBookings;
        document.getElementById('statCompleted').innerText = stats.completedBookings;
        document.getElementById('statCancelled').innerText = stats.cancelledBookings;
        document.getElementById('statRevenue').innerText = '₹' + stats.totalRevenue.toLocaleString('en-IN');

        loadBookings();
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
      }
    }

    async function loadBookings() {
      const search = document.getElementById('searchInput').value;
      const status = document.getElementById('statusFilter').value;
      const eventType = document.getElementById('eventFilter').value;

      try {
        const query = new URLSearchParams({ search, status, eventType });
        const res = await fetch(`/api/admin/bookings?\${query.toString()}`);
        const data = await res.json();
        const tbody = document.getElementById('bookingsTableBody');
        tbody.innerHTML = '';

        if (data.bookings.length === 0) {
          tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-[#392D27]/60">No bookings found.</td></tr>`;
          return;
        }

        data.bookings.forEach(b => {
          const dateStr = new Date(b.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          let badgeColor = 'bg-amber-100 text-amber-700';
          if (b.status === 'Confirmed') badgeColor = 'bg-blue-100 text-blue-700';
          if (b.status === 'Completed') badgeColor = 'bg-green-100 text-green-700';
          if (b.status === 'Rejected') badgeColor = 'bg-red-100 text-red-700';

          const tr = document.createElement('tr');
          tr.className = "hover:bg-[#FFF8ED]/50 transition";
          tr.innerHTML = \`
            <td class="p-4 font-bold text-[#FF6B35]">\${b.bookingId}</td>
            <td class="p-4">
              <div class="font-bold">\${b.customerName}</div>
              <div class="text-xs text-[#392D27]/60">\${b.phone}</div>
            </td>
            <td class="p-4 font-semibold">\${b.eventType}</td>
            <td class="p-4 text-xs">
              <div>\${dateStr}</div>
              <div class="text-[#392D27]/60">\${b.eventTime}</div>
            </td>
            <td class="p-4 font-bold">\${b.guestCount}</td>
            <td class="p-4 text-xs font-semibold">\${b.packageName}</td>
            <td class="p-4"><span class="px-3 py-1 rounded-full text-xs font-extrabold \${badgeColor}">\${b.status}</span></td>
            <td class="p-4 text-right space-x-2">
              <button onclick="viewBookingDetails('\${b._id}')" class="px-3 py-1.5 rounded-xl bg-white border border-[#F3E5D8] font-bold text-xs hover:bg-[#FF6B35] hover:text-white transition">View</button>
            </td>
          \`;
          tbody.appendChild(tr);
        });
      } catch (err) {
        console.error('Error loading bookings:', err);
      }
    }

    function debounceSearch() {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadBookings();
      }, 300);
    }

    async function loadCustomers() {
      try {
        const res = await fetch('/api/admin/customers');
        const customers = await res.json();
        const tbody = document.getElementById('customersTableBody');
        tbody.innerHTML = '';

        if (customers.length === 0) {
          tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-[#392D27]/60">No customers found.</td></tr>`;
          return;
        }

        customers.forEach(c => {
          const lastDate = new Date(c.lastBookingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
          const tr = document.createElement('tr');
          tr.className = "hover:bg-[#FFF8ED]/50 transition";
          tr.innerHTML = \`
            <td class="p-4 font-bold">\${c.customerName}</td>
            <td class="p-4 text-xs">\${c.ph
