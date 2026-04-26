import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { orderApi } from "../services/api";

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const res = await orderApi.getById(id);
      setOrder(res.data);
    } catch {
      alert("Không load được order");
    }
  };

  if (!order) return <div className="p-3">Loading...</div>;

  return (
    <div className="content-wrapper p-3">
      <h2>Chi tiết đơn hàng #{order.id}</h2>

      <div className="mb-3">
        <b>Khách:</b> {order.customerName} <br />
        <b>Ngày:</b> {new Date(order.createdAt).toLocaleDateString()} <br />
        <b>Tổng:</b> {order.total.toLocaleString()} đ
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item, index) => (
            <tr key={index}>
              <td>{item.productName}</td>
              <td>{item.price.toLocaleString()} đ</td>
              <td>{item.quantity}</td>
              <td>{(item.price * item.quantity).toLocaleString()} đ</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetail;