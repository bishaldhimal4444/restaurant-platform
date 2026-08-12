export type Role = 'ADMIN' | 'OWNER';

export type TableStatus = 'AVAILABLE' | 'OCCUPIED';

export type SessionStatus = 'PENDING' | 'ACTIVE' | 'BILLED' | 'CLOSED';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'ONLINE';

export type BillStatus = 'UNPAID' | 'PAID';

export type DietaryType = 'VEGETARIAN' | 'VEGAN' | 'GLUTEN_FREE' | 'DAIRY_FREE' | 'NUT_FREE' | 'HALAL';

export type MenuItemSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'REGULAR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  restaurantId: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
  guestToken?: string | null;
  guestTokenExpiresAt?: string | null;
  status: SessionStatus;
  startedAt: string;
  endedAt: string | null;
  table?: Table;
  orders?: Order[];
  bill?: Bill;
}

export interface MenuSection {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemVariant {
  id: string;
  menuItemId: string;
  name: string; // e.g., "Small", "Large", "Half", "Full"
  size: MenuItemSize | null;
  priceAdjustment: number; // additional cost (can be 0 or negative)
  isDefault: boolean;
}

export interface MenuItemAddOn {
  id: string;
  menuItemId: string;
  name: string;
  description: string | null;
  price: number;
  isRequired: false; // for future: required add-ons
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number; // base price
  imageUrl: string | null;
  isAvailable: boolean;
  dietaryTypes: DietaryType[]; // vegetarian, vegan, etc.
  sectionId: string | null;
  displayOrder: number;
  variants: MenuItemVariant[]; // sizes/variants
  addOns: MenuItemAddOn[]; // customization options
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
  section?: MenuSection; // populated when fetching with section
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  selectedVariantId: string | null;
  selectedAddOnIds: string[];
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  status: OrderStatus;
  tableSessionId: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Bill {
  id: string;
  tableSessionId: string;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
  status: BillStatus;
  createdAt: string;
  paidAt: string | null;
}
