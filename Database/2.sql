INSERT INTO ProductVariants
(ProductId, VariantName, Color, Size, Price, Stock, ImageUrl, SKU)

VALUES

-- Bút bi TL-027
(1, N'Bút xanh', N'Xanh', NULL, 5000, 50, './img/product01.png', 'TL027-BLUE'),
(1, N'Bút đỏ', N'Đỏ', NULL, 5000, 30, './img/product01.png', 'TL027-RED'),
(1, N'Bút đen', N'Đen', NULL, 5000, 20, './img/product01.png', 'TL027-BLACK'),

-- Bút chì 2B
(2, N'2B thường', NULL, NULL, 4000, 80, './img/product02.png', 'PENCIL-2B'),

-- Vở 200 trang
(3, N'200 trang A5', NULL, 'A5', 15000, 40, './img/product03.png', 'NOTEBOOK-A5'),
(3, N'200 trang A4', NULL, 'A4', 20000, 40, './img/product03.png', 'NOTEBOOK-A4'),

-- Giấy A4 Double A
(4, N'500 tờ', NULL, 'A4', 70000, 50, './img/product04.png', 'PAPER-A4'),

-- Kẹp giấy nhỏ
(5, N'Loại nhỏ', NULL, 'Small', 10000, 100, './img/product05.png', 'CLIP-S'),
(5, N'Loại lớn', NULL, 'Large', 15000, 100, './img/product05.png', 'CLIP-L'),

-- Bìa hồ sơ giấy
(6, N'Màu xanh', N'Xanh', NULL, 5000, 60, './img/product06.png', 'FILE-BLUE'),
(6, N'Màu đỏ', N'Đỏ', NULL, 5000, 60, './img/product06.png', 'FILE-RED'),

-- Bút dạ bảng
(7, N'Mực xanh', N'Xanh', NULL, 12000, 40, './img/product07.png', 'MARKER-BLUE'),
(7, N'Mực đỏ', N'Đỏ', NULL, 12000, 40, './img/product07.png', 'MARKER-RED'),
(7, N'Mực đen', N'Đen', NULL, 12000, 40, './img/product07.png', 'MARKER-BLACK'),

-- Bút màu 12 cây
(8, N'Hộp 12 màu', NULL, NULL, 45000, 60, './img/product08.png', 'COLOR-12'),

-- Thước 20cm
(9, N'20cm nhựa', NULL, '20cm', 8000, 50, './img/product09.png', 'RULER-20'),

-- Tẩy trắng
(10, N'Tẩy mềm', NULL, NULL, 3000, 100, './img/product10.png', 'ERASER'),

-- Ghim bấm
(11, N'Hộp nhỏ', NULL, NULL, 15000, 50, './img/product11.png', 'PIN-S'),

-- Băng keo 2cm
(12, N'Trong suốt', NULL, '2cm', 7000, 100, './img/product12.png', 'TAPE-2'),

-- Sổ tay mini
(13, N'Màu xanh', N'Xanh', NULL, 20000, 35, './img/product13.png', 'BOOK-BLUE'),
(13, N'Màu hồng', N'Hồng', NULL, 20000, 35, './img/product13.png', 'BOOK-PINK'),

-- Bút lông dầu
(14, N'Mực xanh', N'Xanh', NULL, 13000, 40, './img/product14.png', 'PERM-BLUE'),
(14, N'Mực đỏ', N'Đỏ', NULL, 13000, 40, './img/product14.png', 'PERM-RED'),

-- Giấy note vàng
(15, N'Loại nhỏ', NULL, 'Small', 9000, 80, './img/product15.png', 'NOTE-S'),
(15, N'Loại lớn', NULL, 'Large', 12000, 80, './img/product15.png', 'NOTE-L'),

-- Bút gel mực xanh
(16, N'Mực xanh', N'Xanh', NULL, 6000, 60, './img/product16.png', 'GEL-BLUE'),

-- Kéo văn phòng
(17, N'15cm', NULL, '15cm', 25000, 20, './img/product17.png', 'SCISSOR-15'),
(17, N'20cm', NULL, '20cm', 30000, 20, './img/product17.png', 'SCISSOR-20'),

-- Compa học sinh
(18, N'Compa thường', NULL, NULL, 30000, 30, './img/product18.png', 'COMPA'),

-- Hồ dán
(19, N'Keo nhỏ', NULL, 'Small', 7000, 50, './img/product19.png', 'GLUE-S'),
(19, N'Keo lớn', NULL, 'Large', 12000, 40, './img/product19.png', 'GLUE-L'),
-- Bảng viết mini
(20, N'Loại nhỏ', NULL, 'Small', 50000, 15, './img/product20.png', 'BOARD-S'),
(20, N'Loại lớn', NULL, 'Large', 70000, 15, './img/product20.png', 'BOARD-L')
