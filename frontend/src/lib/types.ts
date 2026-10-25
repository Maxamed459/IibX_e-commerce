export type Category = { id: string; name: string; slug: string };
export type Product = { id: string; name: string; slug: string; description?: string; image?: string | null; price: string | number; stock: number; is_active: boolean; category: string | Category; created_at?: string; updated_at?: string };
export type Address = { id: string; full_name: string; phone: string; address_line_1: string; address_line_2?: string; city: string; state?: string; postal_code?: string; country: string; is_default: boolean };
export type CartItem = { id: string; product: Product | string; quantity: number; line_total?: string | number };
export type Cart = { id: string; items: CartItem[]; subtotal?: string | number; total?: string | number };
export type OrderItem = { id: string; product_name?: string; name?: string; quantity: number; unit_price?: string | number; price?: string | number; line_total?: string | number };
export type Order = { id: string; status: string; payment_status?: string; payment_method?: string; total: string | number; subtotal?: string | number; placed_at?: string; items?: OrderItem[] };
export type User = { id: string; email: string; is_staff?: boolean; is_superuser?: boolean; first_name?: string; last_name?: string };
export function asList<T>(data: T[] | { results?: T[] } | undefined | null): T[] { if (Array.isArray(data)) return data; return data?.results ?? []; }
