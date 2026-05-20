UPDATE ProductDetails
SET Detail = CASE ProductId

WHEN 1 THEN N'
<ul>
<li>Thương hiệu: Thiên Long</li>
<li>Màu sắc: Xanh</li>
<li>Ngòi bút: 0.5mm</li>
<li>Loại mực: Mực nước</li>
<li>Xuất xứ: Việt Nam</li>
<li>Phù hợp học sinh sinh viên</li>
</ul>'

WHEN 2 THEN N'
<ul>
<li>Thương hiệu: Faber Castell</li>
<li>Độ đậm: 2B</li>
<li>Chất liệu: Gỗ tự nhiên</li>
<li>Dễ gọt và dễ tẩy</li>
<li>Thiết kế chắc tay</li>
</ul>'

WHEN 3 THEN N'
<ul>
<li>Thương hiệu: Hồng Hà</li>
<li>Số trang: 200</li>
<li>Giấy chống lem mực</li>
<li>Định lượng giấy cao</li>
<li>Bìa cứng chắc chắn</li>
</ul>'

WHEN 4 THEN N'
<ul>
<li>Thương hiệu: Double A</li>
<li>Kích thước: A4</li>
<li>Định lượng giấy: 70gsm</li>
<li>Độ trắng cao</li>
<li>In ấn sắc nét</li>
</ul>'

WHEN 5 THEN N'
<ul>
<li>Thương hiệu: Deli</li>
<li>Chất liệu: Kim loại</li>
<li>Kích thước nhỏ gọn</li>
<li>Chống gỉ sét</li>
<li>Phù hợp văn phòng</li>
</ul>'

WHEN 6 THEN N'
<ul>
<li>Thương hiệu: Bến Nghé</li>
<li>Loại: Bìa hồ sơ A4</li>
<li>Chất liệu cứng cáp</li>
<li>Bảo quản tài liệu tốt</li>
<li>Độ bền cao</li>
</ul>'

WHEN 7 THEN N'
<ul>
<li>Thương hiệu: Artline</li>
<li>Màu mực: Đen</li>
<li>Dễ lau sạch</li>
<li>Dùng cho bảng trắng</li>
<li>Nét viết rõ ràng</li>
</ul>'

WHEN 8 THEN N'
<ul>
<li>Thương hiệu: Pentel</li>
<li>Bộ 12 màu</li>
<li>Màu sắc tươi sáng</li>
<li>An toàn cho trẻ em</li>
<li>Dễ tô màu</li>
</ul>'

WHEN 9 THEN N'
<ul>
<li>Thương hiệu: Deli</li>
<li>Chiều dài: 20cm</li>
<li>Nhựa trong suốt</li>
<li>Dễ đo chính xác</li>
<li>Chống gãy</li>
</ul>'

WHEN 10 THEN N'
<ul>
<li>Thương hiệu: Uni</li>
<li>Tẩy mềm</li>
<li>Không làm rách giấy</li>
<li>Tẩy sạch chì</li>
<li>Ít bụi tẩy</li>
</ul>'

WHEN 11 THEN N'
<ul>
<li>Thương hiệu: Plus</li>
<li>Kim loại chắc chắn</li>
<li>Dễ sử dụng</li>
<li>Phù hợp văn phòng</li>
<li>Độ bền cao</li>
</ul>'

WHEN 12 THEN N'
<ul>
<li>Thương hiệu: Deli</li>
<li>Băng keo trong</li>
<li>Độ dính cao</li>
<li>Kích thước 2cm</li>
<li>Dễ sử dụng</li>
</ul>'

WHEN 13 THEN N'
<ul>
<li>Thương hiệu: Campus</li>
<li>Thiết kế mini</li>
<li>Dễ mang theo</li>
<li>Phù hợp ghi chú nhanh</li>
<li>Bìa đẹp hiện đại</li>
</ul>'

WHEN 14 THEN N'
<ul>
<li>Thương hiệu: Artline</li>
<li>Mực dầu chống nước</li>
<li>Viết trên nhiều bề mặt</li>
<li>Màu đen đậm</li>
<li>Nét bền màu</li>
</ul>'

WHEN 15 THEN N'
<ul>
<li>Thương hiệu: Muji</li>
<li>Giấy note vàng</li>
<li>Dễ ghi chú</li>
<li>Keo dính chắc</li>
<li>Thiết kế tối giản</li>
</ul>'

WHEN 16 THEN N'
<ul>
<li>Thương hiệu: Thiên Long</li>
<li>Mực gel xanh</li>
<li>Viết êm tay</li>
<li>Ngòi 0.5mm</li>
<li>Mực ra đều</li>
</ul>'

WHEN 17 THEN N'
<ul>
<li>Thương hiệu: Deli</li>
<li>Lưỡi kéo sắc bén</li>
<li>Cán cầm chắc tay</li>
<li>An toàn sử dụng</li>
<li>Độ bền cao</li>
</ul>'

WHEN 18 THEN N'
<ul>
<li>Thương hiệu: Faber</li>
<li>Compa học sinh</li>
<li>Vẽ chính xác</li>
<li>Kim loại bền chắc</li>
<li>Dễ điều chỉnh</li>
</ul>'

WHEN 19 THEN N'
<ul>
<li>Thương hiệu: M&G</li>
<li>Hồ dán khô nhanh</li>
<li>Độ bám dính tốt</li>
<li>An toàn cho học sinh</li>
<li>Dễ sử dụng</li>
</ul>'

WHEN 20 THEN N'
<ul>
<li>Thương hiệu: Stabilo</li>
<li>Bảng viết mini</li>
<li>Dễ lau sạch</li>
<li>Tiện học tập và ghi chú</li>
<li>Thiết kế nhỏ gọn</li>
</ul>'

END