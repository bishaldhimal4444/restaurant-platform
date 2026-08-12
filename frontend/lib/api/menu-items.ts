import { apiFetch } from './client';
import type { MenuItem, MenuSection, MenuItemVariant, MenuItemAddOn } from '../types';

// ===== Menu Sections =====
export function listMenuSections(token?: string) {
  return apiFetch<MenuSection[]>('/menu-sections', { token });
}

export function getMenuSection(token: string, id: string) {
  return apiFetch<MenuSection>("/menu-sections/" + id, { token });
}

export function createMenuSection(
  token: string,
  data: { name: string; description?: string; displayOrder?: number; isActive?: boolean },
) {
  return apiFetch<MenuSection>('/menu-sections', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateMenuSection(
  token: string,
  id: string,
  data: Partial<{ name: string; description: string; displayOrder: number; isActive: boolean }>,
) {
  return apiFetch<MenuSection>("/menu-sections/" + id, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function deleteMenuSection(token: string, id: string) {
  return apiFetch<{ deleted: true }>("/menu-sections/" + id, {
    method: 'DELETE',
    token,
  });
}

export function reorderMenuSections(token: string, sectionIds: string[]) {
  return apiFetch<MenuSection[]>('/menu-sections/reorder', {
    method: 'POST',
    token,
    body: JSON.stringify({ sectionIds }),
  });
}

// ===== Menu Items =====
export function listMenuItems(token?: string) {
  return apiFetch<MenuItem[]>('/menu-items', { token });
}

export function getMenuItem(token: string, id: string) {
  return apiFetch<MenuItem>("/menu-items/" + id, { token });
}

export function createMenuItem(
  token: string,
  data: {
    name: string;
    description?: string;
    ingredients?: string;
    price: number;
    imageUrl?: string;
    isAvailable?: boolean;
    dietaryTypes?: string[];
    sectionId?: string;
    displayOrder?: number;
    variants?: Array<{ name: string; size?: string; priceAdjustment: number; isDefault: boolean }>;
    addOns?: Array<{ name: string; description?: string; price: number }>;
  },
) {
  return apiFetch<MenuItem>('/menu-items', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function updateMenuItem(
  token: string,
  id: string,
  data: Partial<{
    name: string;
    description: string;
    ingredients: string;
    price: number;
    imageUrl: string;
    isAvailable: boolean;
    dietaryTypes: string[];
    sectionId: string | null;
    displayOrder: number;
    variants: Array<{ id?: string; name: string; size?: string; priceAdjustment: number; isDefault: boolean }>;
    addOns: Array<{ id?: string; name: string; description?: string; price: number }>;
  }>,
) {
  return apiFetch<MenuItem>("/menu-items/" + id, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  });
}

export function deleteMenuItem(token: string, id: string) {
  return apiFetch<{ deleted: true }>("/menu-items/" + id, {
    method: 'DELETE',
    token,
  });
}

export function reorderMenuItems(token: string, itemIds: string[]) {
  return apiFetch<MenuItem[]>('/menu-items/reorder', {
    method: 'POST',
    token,
    body: JSON.stringify({ itemIds }),
  });
}
