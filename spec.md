# TikTakTuk — Frontend Specification

> **Purpose**: Spec-driven development reference for all frontend pages.
> This document defines **routes, data requirements, access control, user interactions, validations, and role-based behavior** for every page. It does NOT prescribe UI/UX aesthetics.

---

## Table of Contents

1. [Roles & Access Control](#1-roles--access-control)
2. [Navigation (Navbar)](#2-navigation-navbar)
3. [Authentication](#3-authentication)
4. [Dashboard](#4-dashboard)
5. [Venue Management](#5-venue-management)
6. [Event Management](#6-event-management)
7. [Artist Management](#7-artist-management)
8. [Ticket Category Management](#8-ticket-category-management)
9. [Order Management](#9-order-management)
10. [Promotion Management](#10-promotion-management)
11. [Ticket Management](#11-ticket-management)
12. [Seat Management](#12-seat-management)
13. [Data Model Reference](#13-data-model-reference)
14. [Route Summary](#route-summary)

---

## 1. Roles & Access Control

| Role | Description |
|---|---|
| **Guest** | Unauthenticated user. Can only access Login & Register pages. |
| **Admin** | Full system access. Can manage all entities. |
| **Organizer** | Can manage Venues, Events (own), Ticket Categories, Tickets, Seats. |
| **Customer** | Can browse events, create orders, view own tickets/orders. |

---

## 2. Navigation (Navbar)

The navbar is **role-dependent** and must change based on authentication state.

### Guest Navbar
| Label | Route |
|---|---|
| Login | `/login` |
| Registrasi | `/register` |

### Admin Navbar
| Label | Route |
|---|---|
| Dashboard | `/dashboard` |
| Manajemen Venue | `/dashboard/venues` |
| Manajemen Kursi | `/seats` |
| Kategori Tiket | `/ticket-categories` |
| Manajemen Tiket | `/my-tickets` |
| Semua Order | `/orders` |
| Profile | `/profile` |

### Organizer Navbar
| Label | Route |
|---|---|
| Dashboard | `/dashboard` |
| Event Saya | `/events` |
| Manajemen Venue | `/dashboard/venues` |
| Manajemen Kursi | `/seats` |
| Kategori Tiket | `/ticket-categories` |
| Manajemen Tiket | `/my-tickets` |
| Semua Order | `/orders` |
| Profile | `/profile` |

### Customer Navbar
| Label | Route |
|---|---|
| Dashboard | `/dashboard` |
| Tiket Saya | `/my-tickets` |
| Pesanan | `/orders` |
| Cari Event | `/events` |
| Promosi | `/promotions` |
| Venue | `/dashboard/venues` |
| Artis | `/artists` |
| Logout | *(action, redirects to `/login`)* |

---

## 3. Authentication

### 3.1 Login Page

| Property | Value |
|---|---|
| **Route** | `/login` |
| **Access** | Guest only (redirect to `/dashboard` if already logged in) |

**Required Form Fields:**

| Field | Type | Validation |
|---|---|---|
| Username | text | Required |
| Password | password | Required |

**Behavior:**
- On submit → validate credentials
- If invalid → show error message
- If valid → create session, redirect to `/dashboard`

---

### 3.2 Register Page

| Property | Value |
|---|---|
| **Route** | `/register` |
| **Access** | Guest only |

**Step 1 — Role Selection:**
- Display 3 options: `Admin`, `Organizer`, `Customer`
- User selects one → proceed to Step 2

**Step 2a — Organizer Registration Form:**

| Field | Type | Validation |
|---|---|---|
| Username | text | Required, unique |
| Password | password | Required |
| Nama Organizer | text | Required |
| Email Kontak | email | Required |

**Step 2b — Customer Registration Form:**

| Field | Type | Validation |
|---|---|---|
| Username | text | Required, unique |
| Password | password | Required |
| Nama Lengkap | text | Required |
| Nomor Telepon | text | Optional |

**Step 2c — Admin Registration Form:**

| Field | Type | Validation |
|---|---|---|
| Username | text | Required, unique |
| Password | password | Required |

**Behavior:**
- All required fields must be filled
- If validation fails → show inline error messages
- If success → redirect to `/login`

---

## 4. Dashboard

| Property | Value |
|---|---|
| **Route** | `/dashboard` |
| **Access** | Admin, Organizer, Customer (authenticated) |

Dashboard content is **role-specific**:

### 4.1 Admin Dashboard
**Must display:**
- Username
- Role: Administrator
- Summary statistics (total users, events, orders, revenue, etc.)

### 4.2 Organizer Dashboard
**Must display:**
- Username
- Role: Organizer
- Organizer Name
- Contact Email
- Summary of own events

### 4.3 Customer Dashboard
**Must display:**
- Username
- Role: Customer
- Full Name
- Phone Number
- Order history summary

---

### 4.4 Profile View & Edit

| Property | Value |
|---|---|
| **Route** | `/profile` |
| **Access** | All authenticated users |

**Accessible via:** Navbar → Profile → Profil Saya → Edit

**Customer — Editable Fields:**

| Field | Editable |
|---|---|
| Username | ❌ Read-only |
| Full Name | ✅ |
| Phone Number | ✅ |

**Organizer — Editable Fields:**

| Field | Editable |
|---|---|
| Username | ❌ Read-only |
| Organizer Name | ✅ |
| Contact Email | ✅ |

### 4.5 Update Password (All Roles)

**Accessible via:** Profile → Update Password (modal)

| Field | Type | Validation |
|---|---|---|
| Current Password | password | Required |
| New Password | password | Required |
| Confirm New Password | password | Required, must match New Password |

**Behavior:**
- Validate old password, apply new password
- On success → redirect back to Profile with success message

---

## 5. Venue Management

### 5.1 CUD — Venue

| Property | Value |
|---|---|
| **Route** | `/dashboard/venues` |
| **Access** | Admin, Organizer |

**Data Fields for Create/Update:**

| Field | Type | Validation |
|---|---|---|
| Nama Venue | text | Required |
| Alamat | text | Required |
| Kota | text | Required |
| Kapasitas | number | Required, > 0 |
| Jenis Seating | select (`Reserved Seating` / `Free Seating`) | Required |

**Create Venue:**
- Trigger: click `[Tambah Venue]` button
- Display: modal or new page with empty form
- On submit → save & refresh list

**Update Venue:**
- Trigger: click `[Edit]` on a venue card/row
- Display: modal or new page with pre-filled form
- On submit → save & refresh list

**Delete Venue:**
- Trigger: click `[Hapus]` on a venue card/row
- Display: confirmation modal
- On confirm → delete & refresh list

### 5.2 R — Venue

| Property | Value |
|---|---|
| **Route** | `/dashboard/venues` (same page, different UI per role) |
| **Access** | All authenticated users |

**Displayed Data (per venue card):**

| Field |
|---|
| Nama Venue |
| Alamat |
| Kota |
| Kapasitas |
| Jenis Seating |

**Search:** by venue name or address
**Filter:** by city, by seating type

**Role-based UI:**
- Admin/Organizer → show action buttons (Edit, Delete)
- Customer → view only, no action buttons

---

## 6. Event Management

### 6.1 CU — Event

| Property | Value |
|---|---|
| **Route** | `/events` (management view for Admin/Organizer) |
| **Access** | Admin, Organizer (Organizer sees only own events) |

**Data Fields for Create/Update:**

| Field | Type | Validation |
|---|---|---|
| Judul Acara | text | Required |
| Tanggal | date | Required |
| Waktu | time | Required |
| Venue | dropdown (from Venue list) | Required |
| Organizer | dropdown/auto-set | Required (auto-set for Organizer role) |
| Artist/Performer | multi-select (from Artist list) + role per artist | At least one |
| Kategori Tiket | dynamic list (name, quota, price) | At least one |
| Deskripsi | textarea | Optional |

**Create Event:**
- Trigger: click `[Buat Acara]` button
- Modal/page with empty form
- On submit → save & refresh list

**Update Event:**
- Trigger: click `[Edit Acara]` on event row
- Modal/page with pre-filled form
- On submit → save & refresh list

### 6.2 R — Event

| Property | Value |
|---|---|
| **Route** | `/events` (public browse view) |
| **Access** | All users (including Guest via Customer navbar "Cari Event") |

**Displayed Data (per event card):**

| Field |
|---|
| Judul Acara |
| Tanggal Acara |
| Waktu Acara |
| Venue |
| Daftar Artist/Performer |
| Kategori Tiket |
| Harga Tiket Mulai (lowest price) |

**Search:** by event title or artist name
**Filter:** by venue, by artist

**Interaction:** User can click `[Beli Tiket]` to go to checkout (Customer only)

---

## 7. Artist Management

### 7.1 CUD — Artist

| Property | Value |
|---|---|
| **Route** | `/artists` |
| **Access** | Admin only (for CUD actions) |

**Data Fields:**

| Field | Type | Validation |
|---|---|---|
| Name | text | Required |
| Genre | text | Optional |

**Create:** click `[+ Tambah Artist]` → modal form → submit
**Update:** click `[Update]` on artist row → modal with pre-filled data → submit
**Delete:** click `[Delete]` on artist row → confirmation dialog showing Artist ID & Name → confirm/cancel

**Table Columns:**

| Column |
|---|
| Artist ID |
| Name |
| Genre |
| Action (Admin only) |

**Sort:** by Name ascending

### 7.2 R — Artist

| Property | Value |
|---|---|
| **Route** | `/artists` |
| **Access** | All users (Guest, Customer, Organizer, Admin) |

**Role-based UI:**
- Admin → sees `[+ Tambah Artist]`, `[Update]`, `[Delete]` buttons
- Others → table without Action column

---

## 8. Ticket Category Management

### 8.1 CUD — Ticket Category

| Property | Value |
|---|---|
| **Route** | `/ticket-categories` |
| **Access** | Admin, Organizer |

**Data Fields:**

| Field | Type | Validation |
|---|---|---|
| Category Name | text | Required |
| Quota | number | Required, integer, > 0 |
| Price | number | Required, >= 0 |
| Event | dropdown (from Event list) | Required |

**Validation Rule:** Total quota of all categories for one event must NOT exceed the venue capacity.

**Create:** click `[+ Tambah Kategori Tiket]` → modal form → submit
**Update:** click `[Update]` → modal with pre-filled data → submit (can edit Name, Quota, Price)
**Delete:** click `[Delete]` → confirmation dialog showing Category ID & Name → confirm/cancel

**Table Columns:**

| Column |
|---|
| Category ID |
| Category Name |
| Quota |
| Price |
| Event Name |
| Action (Admin/Organizer only) |

**Sort:** by Event Name then Category Name ascending

### 8.2 R — Ticket Category

| Property | Value |
|---|---|
| **Route** | `/ticket-categories` |
| **Access** | All users |

**Role-based UI:**
- Admin/Organizer → action buttons visible
- Customer/Guest → view only

---

## 9. Order Management

### 9.1 C — Order (Checkout)

| Property | Value |
|---|---|
| **Route** | `/events/[eventId]/checkout` or `/checkout` |
| **Access** | Customer only |

**Flow:**
1. Customer clicks `[Beli Tiket]` on an event card
2. System shows checkout page with event info + ticket categories

**Checkout Form Fields:**

| Field | Type | Validation |
|---|---|---|
| Kategori Tiket | dropdown (categories for this event) | Required |
| Jumlah Tiket | number | Required, integer, > 0, max 10 |
| Kursi | multi-select (if venue is reserved seating) | Optional, only for reserved seating venues |
| Kode Promo | text + `[Terapkan]` button | Optional |

**Auto-generated on submit:**
- `order_date` = current timestamp
- `payment_status` = "Pending"
- `total_amount` = calculated (price × qty − discount)
- `customer_id` = logged-in customer

### 9.2 R — Order

| Property | Value |
|---|---|
| **Route** | `/orders` |
| **Access** | Admin, Organizer, Customer |

**Data scope per role:**
- **Admin** → all orders
- **Organizer** → orders for own events (ORDER → TICKET → TICKET_CATEGORY → EVENT → ORGANIZER)
- **Customer** → own orders only

**Summary Statistics:**

| Stat |
|---|
| Total Order |
| Jumlah Lunas (Paid) |
| Jumlah Pending |
| Total Revenue (Admin & Organizer only) |

**Table Columns:**

| Column |
|---|
| Order ID |
| Order Date |
| Payment Status |
| Total Amount |
| Action (Admin only: Update, Delete) |

**Search:** by Order ID
**Filter:** by Payment Status (Semua, Lunas, Pending, Dibatalkan)
**Sort:** by Order Date descending

### 9.3 UD — Order

| Property | Value |
|---|---|
| **Route** | `/orders` (same page, admin actions) |
| **Access** | Admin only |

**Update Order:**
- click `[Update]` → modal showing Order ID (read-only) + dropdown Payment Status
- Admin changes status → submit

**Delete Order:**
- click `[Delete]` → confirmation modal
- confirm → delete order

---

## 10. Promotion Management

### 10.1 CUD — Promotion

| Property | Value |
|---|---|
| **Route** | `/promotions` |
| **Access** | Admin only (for CUD actions) |

**Data Fields:**

| Field | Type | Validation |
|---|---|---|
| Kode Promo | text | Required, unique |
| Tipe Diskon | select (`PERCENTAGE` / `NOMINAL`) | Required |
| Nilai Diskon | number | Required, > 0 |
| Tanggal Mulai | date | Required |
| Tanggal Berakhir | date | Required, >= Tanggal Mulai |
| Batas Penggunaan | number | Required, integer, > 0 |

**Create:** click `[+ Buat Promo]` → modal form → submit
**Update:** click `[Update]` → modal pre-filled → submit
**Delete:** click `[Delete]` → confirmation modal → confirm/cancel

### 10.2 R — Promotion

| Property | Value |
|---|---|
| **Route** | `/promotions` |
| **Access** | All users |

**Summary Statistics:**

| Stat |
|---|
| Total Promo |
| Total Penggunaan (sum of all usage) |
| Total Tipe Persentase (count) |

**Table Columns:**

| Column |
|---|
| Kode Promo |
| Tipe Diskon |
| Nilai Diskon |
| Tanggal Mulai |
| Tanggal Berakhir |
| Penggunaan (used / limit) |
| Action (Admin only) |

**Search:** by Kode Promo
**Filter:** by Tipe Diskon (Semua, Persentase, Nominal)

**Role-based UI:**
- Admin → `[+ Buat Promo]`, `[Update]`, `[Delete]` visible
- Others → view only

---

## 11. Ticket Management

### 11.1 C — Ticket

| Property | Value |
|---|---|
| **Route** | `/my-tickets` |
| **Access** | Admin, Organizer |

**Create Ticket Form (modal):**

| Field | Type | Validation |
|---|---|---|
| Order | dropdown (`order_id — Customer Name — Event Name`) | Required. When selected, determines the event. |
| Kategori Tiket | dropdown (filtered by event from selected order: `Name — Price — (used/quota)`) | Required. Full-quota categories disabled. |
| Kursi | dropdown (only if venue uses reserved seating; unassigned seats: `Section — Baris X, No. Y`) | Optional, conditional |
| Kode Tiket | info text | Auto-generated, read-only |

**Trigger:** click `[+ Tambah Tiket]` → modal → fill → submit

### 11.2 R — Ticket

| Property | Value |
|---|---|
| **Route** | `/my-tickets` |
| **Access** | All authenticated users |

**Data scope per role:**
- **Customer** → own tickets only (TICKET → ORDER → CUSTOMER → USER_ACCOUNT). Page title: **"Tiket Saya"**
- **Admin** → all tickets. Page title: **"Manajemen Tiket"**
- **Organizer** → all tickets (frontend). Page title: **"Manajemen Tiket"**

**Displayed Data (per ticket card/row):**

| Field |
|---|
| Ticket Code |
| Event Name |
| Category Name |
| Seat info (if any) |
| Status |
| Customer Name (Admin/Organizer view only) |

**Search/Filter:**
- Filter by ticket code or event name
- Filter by status

### 11.3 UD — Ticket

| Property | Value |
|---|---|
| **Route** | `/my-tickets` |
| **Access** | Admin only |

**Update Ticket (modal):**

| Field | Type | Editable |
|---|---|---|
| Kode Tiket | text | ❌ Read-only |
| Status | dropdown | ✅ |
| Kursi | dropdown (available seats + current seat + "Tanpa Kursi") | ✅ |

**Delete Ticket:**
- Confirmation modal → on confirm:
  - Delete ticket from TICKET table
  - Remove seat assignment from HAS_RELATIONSHIP (seat becomes available)

---

## 12. Seat Management

### 12.1 CUD — Seat

| Property | Value |
|---|---|
| **Route** | `/seats` |
| **Access** | Admin, Organizer |

**Data Fields:**

| Field | Type | Validation |
|---|---|---|
| Venue | dropdown (all venues) | Required |
| Section | text | Required |
| Baris (Row) | text | Required |
| No. Kursi (Seat Number) | text | Required |

**Create:** click `[+ Tambah Kursi]` → modal form → submit
**Update:** click edit action → modal pre-filled → submit
**Delete:**
- If seat is NOT assigned to a ticket → confirmation dialog → delete
- If seat IS assigned → delete button is **disabled** (greyed out) with error message: *"Kursi ini sudah di-assign ke tiket dan tidak dapat dihapus. Hapus atau ubah tiket terlebih dahulu."*

### 12.2 R — Seat

| Property | Value |
|---|---|
| **Route** | `/seats` |
| **Access** | All authenticated users |

**Table Columns:**

| Column |
|---|
| Seat ID |
| Venue Name |
| Section |
| Row |
| Seat Number |
| Status (`Terisi` / `Tersedia`) |

**Status Logic:**
- `seat_id` found in `HAS_RELATIONSHIP` → **Terisi**
- `seat_id` NOT found → **Tersedia**

**Summary Stat Cards:**
- Total Seats
- Tersedia (Available)
- Terisi (Occupied)

**Search/Filter:** by venue, section, or status

---

## 13. Data Model Reference

> Quick reference for frontend data shapes. All IDs are UUID.

### USER_ACCOUNT
`user_id` (PK), `username` (UNIQUE), `password`

### ROLE
`role_id` (PK), `role_name` (UNIQUE) — values: `administrator`, `organizer`, `customer`

### ACCOUNT_ROLE
`role_id` (FK→ROLE), `user_id` (FK→USER_ACCOUNT) — composite PK

### CUSTOMER
`customer_id` (PK), `full_name`, `phone_number`, `user_id` (FK→USER_ACCOUNT, UNIQUE)

### ORGANIZER
`organizer_id` (PK), `organizer_name`, `contact_email`, `user_id` (FK→USER_ACCOUNT, UNIQUE)

### VENUE
`venue_id` (PK), `venue_name`, `capacity` (>0), `address`, `city`

### SEAT
`seat_id` (PK), `section`, `seat_number`, `row_number`, `venue_id` (FK→VENUE)

### EVENT
`event_id` (PK), `event_datetime`, `event_title`, `venue_id` (FK→VENUE), `organizer_id` (FK→ORGANIZER)

### ARTIST
`artist_id` (PK), `name`, `genre`

### EVENT_ARTIST
`event_id` (FK→EVENT), `artist_id` (FK→ARTIST), `role` — composite PK

### TICKET_CATEGORY
`category_id` (PK), `category_name`, `quota` (>0), `price` (>=0), `tevent_id` (FK→EVENT)

### TICKET
`ticket_id` (PK), `ticket_code` (UNIQUE), `tcategory_id` (FK→TICKET_CATEGORY), `torder_id` (FK→ORDER)

### HAS_RELATIONSHIP
`seat_id` (FK→SEAT), `ticket_id` (FK→TICKET) — composite PK

### ORDER
`order_id` (PK), `order_date`, `payment_status`, `total_amount` (>=0), `customer_id` (FK→CUSTOMER)

### PROMOTION
`promotion_id` (PK), `promo_code` (UNIQUE), `discount_type` (`NOMINAL`/`PERCENTAGE`), `discount_value` (>0), `start_date`, `end_date`, `usage_limit` (>0)

### ORDER_PROMOTION
`order_promotion_id` (PK), `promotion_id` (FK→PROMOTION), `order_id` (FK→ORDER)

---

## Route Summary

| Route | Page | Access |
|---|---|---|
| `/login` | Login | Guest |
| `/register` | Register (role selection + form) | Guest |
| `/dashboard` | Dashboard (role-specific) | Auth |
| `/profile` | Profile View/Edit + Password Update | Auth |
| `/dashboard/venues` | Venue List + CUD | Auth (CUD: Admin/Organizer) |
| `/events` | Event Browse (R) + CU (Admin/Organizer) | All |
| `/events/[id]/checkout` | Order Checkout | Customer |
| `/artists` | Artist List + CUD | All (CUD: Admin) |
| `/ticket-categories` | Ticket Category List + CUD | All (CUD: Admin/Organizer) |
| `/orders` | Order List + UD | Auth (UD: Admin) |
| `/promotions` | Promotion List + CUD | All (CUD: Admin) |
| `/my-tickets` | Ticket List + CUD | Auth (CUD: Admin/Organizer) |
| `/seats` | Seat List + CUD | Auth (CUD: Admin/Organizer) |
