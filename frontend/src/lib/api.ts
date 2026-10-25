import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type {
  Address,
  Cart,
  Category,
  Order,
  Product,
  User,
} from "@/lib/types";
type AuthResponse = {
  access?: string;
  access_token?: string;
  refresh?: string;
  user?: User;
};
const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",

  prepareHeaders: (headers, { getState }) => {
    const auth = (
      getState() as {
        auth?: {
          accessToken?: string | null;
        };
      }
    ).auth;

    const token =
      auth?.accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("fashion_access")
        : null);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    headers.set("Accept", "application/json");
    return headers;
  },
});
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, apiContext, extraOptions) => {
  let result = await rawBaseQuery(args, apiContext, extraOptions);
  const url = typeof args === "string" ? args : args.url;
  const isAuthRequest = /\/auth\/(login|register|token\/refresh)\/?$/.test(url);
  if (result.error?.status === 401 && !isAuthRequest) {
    const auth = (
      apiContext.getState() as {
        auth: { accessToken?: string | null; refreshToken?: string | null };
      }
    ).auth;
    const hadAccess = !!auth.accessToken;
    let refresh = auth.refreshToken;
    if (!refresh && typeof window !== "undefined")
      refresh = localStorage.getItem("fashion_refresh");
    if (hadAccess) {
      const refreshed = await rawBaseQuery(
        {
          url: "/auth/token/refresh",
          method: "POST",
          body: refresh ? { refresh } : {},
          credentials: "include",
        },
        apiContext,
        extraOptions,
      );
      const access = (refreshed.data as { access?: string } | undefined)
        ?.access;
      if (access) {
        apiContext.dispatch({ type: "auth/setAccessToken", payload: access });
        result = await rawBaseQuery(args, apiContext, extraOptions);
      } else {
        apiContext.dispatch({ type: "auth/logout" });
        if (typeof window !== "undefined" && hadAccess)
          window.location.assign("/login?reason=session-expired");
      }
    }
  }
  return result;
};
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Category", "Cart", "Order", "Address", "Profile"],
  endpoints: (b) => ({
    products: b.query<
      Product[],
      { search?: string; category?: string; ordering?: string } | void
    >({
      query: (params) => ({ url: "/products/", params: params || undefined }),
      transformResponse: (r: Product[] | { results: Product[] }) =>
        Array.isArray(r) ? r : r.results,
      providesTags: ["Product"],
    }),
    product: b.query<Product, string>({
      query: (id) => `/products/${id}/`,
      providesTags: ["Product"],
    }),
    categories: b.query<Category[], void>({
      query: () => "/categories/",
      transformResponse: (r: Category[] | { results: Category[] }) =>
        Array.isArray(r) ? r : r.results,
      providesTags: ["Category"],
    }),
    createProduct: b.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/products/", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: b.mutation<Product, { id: string; body: Partial<Product> }>({
      query: ({ id, body }) => ({
        url: `/products/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: b.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    createCategory: b.mutation<Category, Partial<Category>>({
      query: (body) => ({ url: "/categories/", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: b.mutation<
      Category,
      { id: string; body: Partial<Category> }
    >({
      query: ({ id, body }) => ({
        url: `/categories/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: b.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
    register: b.mutation<
      AuthResponse,
      { email: string; password: string; password2: string }
    >({ query: (body) => ({ url: "/auth/register/", method: "POST", body }) }),
    login: b.mutation<AuthResponse, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login/", method: "POST", body }),
    }),
    profile: b.query<User, void>({
      query: () => "/auth/profile/",
      providesTags: ["Profile"],
    }),
    addresses: b.query<Address[], void>({
      query: () => "/auth/addresses/",
      transformResponse: (r: Address[] | { results: Address[] }) =>
        Array.isArray(r) ? r : r.results,
      providesTags: ["Address"],
    }),
    createAddress: b.mutation<Address, Partial<Address>>({
      query: (body) => ({ url: "/auth/addresses/", method: "POST", body }),
      invalidatesTags: ["Address"],
    }),
    setDefaultAddress: b.mutation<Address, string>({
      query: (id) => ({
        url: `/auth/addresses/${id}/set-default`,
        method: "POST",
      }),
      invalidatesTags: ["Address"],
    }),
    updateAddress: b.mutation<Address, { id: string; body: Partial<Address> }>({
      query: ({ id, body }) => ({
        url: `/auth/addresses/${id}/`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Address"],
    }),
    deleteAddress: b.mutation<void, string>({
      query: (id) => ({ url: `/auth/addresses/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Address"],
    }),
    cart: b.query<Cart, void>({
      query: () => "/orders/cart/",
      providesTags: ["Cart"],
    }),
    addCartItem: b.mutation<unknown, { product_id: string; quantity: number }>({
      query: (body) => ({ url: "/orders/cart/", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: b.mutation<unknown, { id: string; quantity: number }>({
      query: ({ id, quantity }) => ({
        url: `/orders/cart/items/${id}/`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    deleteCartItem: b.mutation<void, string>({
      query: (id) => ({ url: `/orders/cart/items/${id}/`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
    checkout: b.mutation<
      Order,
      { shipping_address: string; payment_method: string }
    >({
      query: (body) => ({ url: "/orders/checkout/", method: "POST", body }),
      invalidatesTags: ["Cart", "Order"],
    }),
    orders: b.query<Order[], void>({
      query: () => "/orders/my-orders/",
      transformResponse: (r: Order[] | { results: Order[] }) =>
        Array.isArray(r) ? r : r.results,
      providesTags: ["Order"],
    }),
    order: b.query<Order, string>({
      query: (id) => `/orders/my-orders/${id}/`,
      providesTags: ["Order"],
    }),
  }),
});
export const {
  useProductsQuery,
  useProductQuery,
  useCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useRegisterMutation,
  useLoginMutation,
  useProfileQuery,
  useAddressesQuery,
  useCreateAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  useCheckoutMutation,
  useOrdersQuery,
  useOrderQuery,
} = api;
