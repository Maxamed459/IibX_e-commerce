"use client";
import { Card, Select, Table, Tag, Typography } from "antd";
import { useOrdersQuery, useUpdateOrderMutation } from "@/lib/api";
import { money } from "@/lib/utils";
import type { Order } from "@/lib/types";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

export default function AdminOrders() {
  const { data: orders = [], isLoading, isError } = useOrdersQuery();
  const [updateOrder] = useUpdateOrderMutation();
  async function change(
    id: string,
    values: { status?: string; payment_status?: string },
  ) {
    try {
      const result = await updateOrder({ id, ...values }).unwrap();
      console.log("Submitted values:", values);
      console.log("Backend response:", result);
    } catch {
      /* Global mutation middleware displays the API error. */
    }
  }
  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      render: (id: string) => <span className="font-mono text-xs">{id}</span>,
    },
    {
      title: "Placed",
      dataIndex: "placed_at",
      render: (value: string) =>
        value ? new Date(value).toLocaleString() : "—",
    },
    {
      title: "Order status",
      dataIndex: "status",
      render: (value: string, order: Order) => (
        <Select
          aria-label={`Order status for ${order.id}`}
          value={value}
          options={orderStatuses.map((status) => ({
            value: status,
            label: status
              .replaceAll("_", " ")
              .replace(/^./, (c) => c.toUpperCase()),
          }))}
          className="min-w-36"
          onChange={(status) => change(order.id, { status })}
        />
      ),
    },
    {
      title: "Payment status",
      dataIndex: "payment_status",
      render: (value: string | undefined, order: Order) => (
        <Select
          aria-label={`Payment status for ${order.id}`}
          value={value ?? "pending"}
          options={paymentStatuses.map((status) => ({
            value: status,
            label: status.replace(/^./, (c) => c.toUpperCase()),
          }))}
          className="min-w-32"
          onChange={(payment_status) => change(order.id, { payment_status })}
        />
      ),
    },
    {
      title: "Payment method",
      dataIndex: "payment_method",
      render: (value: string) => <Tag>{value ?? "—"}</Tag>,
    },
    {
      title: "Total",
      dataIndex: "total",
      render: (value: string | number) => money(value),
    },
  ];
  return (
    <div className="space-y-5">
      <div>
        <Typography.Title level={2} className="!mb-1">
          Orders
        </Typography.Title>
        <Typography.Text type="secondary">
          Review orders and update fulfillment or payment status.
        </Typography.Text>
      </div>
      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={orders}
          columns={columns}
          scroll={{ x: 1050 }}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: isError
              ? "Could not load orders. Check your API and staff permissions."
              : "No orders yet.",
          }}
        />
      </Card>
    </div>
  );
}
