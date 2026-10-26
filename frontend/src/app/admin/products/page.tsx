"use client";
import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useProductsQuery,
  useCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "@/lib/api";
import type { Product } from "@/lib/types";
import { money } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProductsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const [remove] = useDeleteProductMutation();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form] = Form.useForm();

  function show(product?: Product) {
    form.resetFields();
    setImageFile(null);
    setEditing(product ?? null);

    if (product) {
      form.setFieldsValue({
        name: product.name ?? "",
        slug: product.slug ?? "",
        description: product.description ?? "",
        price: Number(product.price ?? 0),
        stock: Number(product.stock ?? 0),
        is_active: product.is_active ?? true,
        category:
          typeof product.category === "object" && product.category !== null
            ? product.category.id
            : product.category,
      });
    } else {
      form.setFieldsValue({
        name: "",
        slug: "",
        description: "",
        price: 0,
        stock: 0,
        is_active: true,
        category: undefined,
      });
    }

    setOpen(true);
  }

  async function save() {
    try {
      const values = await form.validateFields();
      const body = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          body.append(key, String(value));
      });
      if (imageFile) body.append("image", imageFile);
      if (!editing && !imageFile) {
        toast.error("Please select a product image.");
        return;
      }
      if (editing) await update({ id: editing.id, body }).unwrap();
      else await create(body).unwrap();
      setOpen(false);
    } catch {
      /* Validation errors are shown by the form; API errors use the global Sonner toast. */
    }
  }

  async function del(id: string) {
    try {
      await remove(id).unwrap();
    } catch {
      /* Global mutation middleware reports the error. */
    }
  }
  function closeModal() {
    setOpen(false);
    setEditing(null);
    setImageFile(null);
    form.resetFields();
  }

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (value: string, product: Product) => (
        <div className="flex min-w-[180px] items-center gap-3">
          {product.image ? (
            <Image
              src={product.image}
              alt={value}
              width={48}
              height={56}
              className="rounded object-cover"
            />
          ) : (
            <div className="h-14 w-12 rounded bg-neutral-100" />
          )}
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-neutral-500">{product.slug}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (value: Product["category"]) =>
        typeof value === "object"
          ? value.name
          : (categories.find((category) => category.id === value)?.name ?? "—"),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (value: string | number) => money(value),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      render: (value: number) => (
        <Tag color={value < 5 ? "orange" : "green"}>{value}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      render: (value: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Active" : "Hidden"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_: unknown, product: Product) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => show(product)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this product?"
            onConfirm={() => del(product.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={2} className="!mb-1">
            Products
          </Typography.Title>
          <Typography.Text type="secondary">
            Manage catalog, prices, images, and inventory.
          </Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => show()}>
          Add product
        </Button>
      </div>
      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={products}
          columns={columns}
          scroll={{ x: 950 }}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
      <Modal
        title={editing ? "Edit product" : "Create product"}
        open={open}
        onCancel={closeModal}
        onOk={save}
        confirmLoading={creating || updating}
        okText={editing ? "Save changes" : "Create product"}
        forceRender
        width={640}
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="slug"
            label="Slug"
            rules={[
              {
                required: true,
                whitespace: true,
                message: "Please enter a product slug.",
              },
              {
                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "Use lowercase letters, numbers, and hyphens.",
              },
            ]}
          >
            <Input placeholder="classic-cotton-t-shirt" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <InputNumber min={0.01} precision={2} className="!w-full" />
          </Form.Item>
          <Form.Item name="stock" label="Stock" rules={[{ required: true }]}>
            <InputNumber min={0} precision={0} className="!w-full" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              placeholder="Choose category"
            />
          </Form.Item>
          <Form.Item
            name="is_active"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "Active", value: true },
                { label: "Hidden", value: false },
              ]}
            />
          </Form.Item>
          <Form.Item
            label={
              editing ? "Product image (optional replacement)" : "Product image"
            }
          >
            <input
              type="file"
              accept="image/*"
              className="block w-full rounded-lg border border-neutral-200 p-2 text-sm"
              onChange={(event) =>
                setImageFile(event.target.files?.[0] ?? null)
              }
            />
          </Form.Item>
          {editing?.image && !imageFile && (
            <div className="-mt-3 mb-4 text-xs text-neutral-500">
              Current image:{" "}
              <a
                href={editing.image}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                View image
              </a>
            </div>
          )}
          {imageFile && (
            <p className="-mt-3 mb-4 text-xs text-neutral-500">
              Selected: {imageFile.name}
            </p>
          )}
        </Form>
      </Modal>
    </div>
  );
}
