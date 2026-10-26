"use client";
import "antd/dist/reset.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useRef } from "react";
import { Layout, Menu, Typography, Button, Result, Spin } from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  ShopOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { RootState } from "@/lib/store";
import { logout } from "@/lib/store";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
const { Sider, Content, Header } = Layout;
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const auth = useSelector((s: RootState) => s.auth);
  const redirected = useRef(false);
  const isStaff = !!(auth.user?.is_staff || auth.user?.is_superuser);
  useEffect(() => {
    if (
      auth.hydrated &&
      auth.accessToken &&
      auth.user &&
      !isStaff &&
      !redirected.current
    ) {
      redirected.current = true;
      router.replace("/");
    }
  }, [auth.hydrated, auth.accessToken, auth.user, isStaff, router]);
  if (!auth.hydrated)
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" tip="Checking your session…" />
      </div>
    );
  if (!auth.accessToken)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Result
          status="403"
          title="Admin sign-in required"
          subTitle="Sign in with a staff account to use the dashboard."
          extra={
            <Link href="/login">
              <Button type="primary">Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  if (!auth.user || !isStaff)
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Result
          status="403"
          title="Access denied"
          subTitle="This area is reserved for verified store staff. Sign in again if your session cannot be verified."
          extra={
            <Link href="/login">
              <Button type="primary">Sign in</Button>
            </Link>
          }
        />
      </div>
    );
  const items = [
    {
      key: "/admin",
      icon: <AppstoreOutlined />,
      label: <Link href="/admin">Overview</Link>,
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: <Link href="/admin/products">Products</Link>,
    },
    {
      key: "/admin/categories",
      icon: <TagsOutlined />,
      label: <Link href="/admin/categories">Categories</Link>,
    },
    {
      key: "/admin/orders",
      icon: <UnorderedListOutlined />,
      label: <Link href="/admin/orders">Orders</Link>,
    },
  ];
  return (
    <Layout className="min-h-screen bg-[#f5f6f8]">
      <Sider
        breakpoint="lg"
        collapsedWidth="64"
        theme="light"
        className="!border-r !border-neutral-200"
      >
        <div className="px-5 py-6 text-lg font-black tracking-widest">
          THREAD/FORM
        </div>
        <Menu mode="inline" selectedKeys={[path]} items={items} />
        <div className="px-4 py-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-500"
          >
            <ShopOutlined /> View storefront
          </Link>
        </div>
      </Sider>
      <Layout className="min-h-screen min-w-0">
        <Header className="flex items-center justify-between border-b border-neutral-200 !bg-white px-5">
          <Typography.Text strong>
            Welcome back {auth.user.is_staff ? "Admin" : ""}{" "}
            {auth.user.email.split("@")[0]}
          </Typography.Text>
          <Button
            icon={<LogoutOutlined />}
            onClick={() => {
              dispatch(logout());
              queryClient.clear();
              toast.success("Signed out successfully");
              router.push("/login");
            }}
          >
            Sign out
          </Button>
        </Header>
        <Content className="min-w-0 flex-1 p-4 sm:p-7">{children}</Content>
      </Layout>
    </Layout>
  );
}
