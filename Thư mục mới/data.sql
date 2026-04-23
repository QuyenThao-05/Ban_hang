use VPP
GO

--1
INSERT INTO ProductType(Name) VALUES
(N'Bút bi'),(N'Bút chì'),(N'Vở học sinh'),(N'Giấy A4'),
(N'Kẹp giấy'),(N'Bìa hồ sơ'),(N'Bút dạ'),(N'Bút màu'),
(N'Thước kẻ'),(N'Tẩy'),(N'Ghim bấm'),(N'Băng keo'),
(N'Sổ tay'),(N'Bút lông'),(N'Giấy note'),(N'Bút gel'),
(N'Kéo'),(N'Compa'),(N'Hồ dán'),(N'Bảng viết');
--2
INSERT INTO Manufacturer(Name) VALUES
(N'Thiên Long'),(N'Hồng Hà'),(N'Deli'),(N'Plus'),
(N'Pentel'),(N'Uni'),(N'Stabilo'),(N'Faber-Castell'),
(N'Artline'),(N'Campus'),(N'Muji'),(N'King Jim'),
(N'Kokuyo'),(N'M&G'),(N'Bến Nghé'),(N'FlexOffice'),
(N'Classmate'),(N'Double A'),(N'PaperOne'),(N'Idea');
--3
INSERT INTO [User](Username, Password, Role) VALUES
('admin','123','admin'),
('user1','123','user'),('user2','123','user'),('user3','123','user'),
('user4','123','user'),('user5','123','user'),('user6','123','user'),
('user7','123','user'),('user8','123','user'),('user9','123','user'),
('user10','123','user'),('user11','123','user'),('user12','123','user'),
('user13','123','user'),('user14','123','user'),('user15','123','user'),
('user16','123','user'),('user17','123','user'),('user18','123','user'),
('user19','123','user');
--4
INSERT INTO Product(Name, Price, Quantity, ProductTypeId, ManufacturerId) VALUES
(N'Bút bi TL-027',5000,100,1,1),
(N'Bút chì 2B',4000,150,2,8),
(N'Vở 200 trang',15000,80,3,2),
(N'Giấy A4 Double A',70000,50,4,18),
(N'Kẹp giấy nhỏ',10000,200,5,3),
(N'Bìa hồ sơ giấy',5000,120,6,15),
(N'Bút dạ bảng',12000,90,7,9),
(N'Bút màu 12 cây',45000,60,8,5),
(N'Thước 20cm',8000,110,9,3),
(N'Tẩy trắng',3000,130,10,6),
(N'Ghim bấm',15000,75,11,4),
(N'Băng keo 2cm',7000,140,12,3),
(N'Sổ tay mini',20000,70,13,10),
(N'Bút lông dầu',13000,85,14,9),
(N'Giấy note vàng',9000,160,15,11),
(N'Bút gel mực xanh',6000,120,16,1),
(N'Kéo văn phòng',25000,50,17,3),
(N'Compa học sinh',30000,40,18,8),
(N'Hồ dán',7000,90,19,14),
(N'Bảng viết mini',50000,30,20,7);
--5
INSERT INTO ProductDetail(ProductId, Description, Brand, Color, Size) VALUES
(1,N'Bút viết trơn','Thiên Long','Xanh','0.5mm'),
(2,N'Bút chì vẽ','Faber','Đen','2B'),
(3,N'Vở học sinh','Hồng Hà','Trắng','200 trang'),
(4,N'Giấy in cao cấp','Double A','Trắng','A4'),
(5,N'Kẹp giấy nhỏ','Deli','Bạc','Small'),
(6,N'Bìa hồ sơ','Bến Nghé','Xanh','A4'),
(7,N'Bút dạ bảng','Artline','Đen','1mm'),
(8,N'Bút màu học sinh','Pentel','Nhiều màu','12'),
(9,N'Thước nhựa','Deli','Trong suốt','20cm'),
(10,N'Tẩy mềm','Uni','Trắng','Small'),
(11,N'Ghim bấm giấy','Plus','Bạc','Standard'),
(12,N'Băng keo','Deli','Trong','2cm'),
(13,N'Sổ ghi chép','Campus','Trắng','Mini'),
(14,N'Bút lông dầu','Artline','Đen','1mm'),
(15,N'Giấy ghi chú','Muji','Vàng','Small'),
(16,N'Bút gel','Thiên Long','Xanh','0.5mm'),
(17,N'Kéo cắt giấy','Deli','Đen','Medium'),
(18,N'Compa học sinh','Faber','Đen','Standard'),
(19,N'Hồ dán giấy','M&G','Trắng','Small'),
(20,N'Bảng viết','Stabilo','Trắng','Mini');
--6
INSERT INTO Bill(UserId, TotalPrice, Status) VALUES
(2,20000,'Pending'),(3,50000,'Done'),(4,30000,'Pending'),
(5,70000,'Done'),(6,15000,'Pending'),(7,40000,'Done'),
(8,60000,'Pending'),(9,25000,'Done'),(10,80000,'Pending'),
(11,90000,'Done'),(12,35000,'Pending'),(13,45000,'Done'),
(14,100000,'Pending'),(15,120000,'Done'),(16,55000,'Pending'),
(17,75000,'Done'),(18,20000,'Pending'),(19,30000,'Done'),
(20,40000,'Pending'),(2,60000,'Done');
--7
INSERT INTO BillDetail(BillId, ProductId, Quantity, Price) VALUES
(1,1,2,10000),(2,3,2,30000),(3,2,5,20000),
(4,4,1,70000),(5,5,1,10000),(6,6,3,15000),
(7,7,2,24000),(8,8,1,45000),(9,9,2,16000),
(10,10,3,9000),(11,11,1,15000),(12,12,2,14000),
(13,13,1,20000),(14,14,2,26000),(15,15,3,27000),
(16,16,2,12000),(17,17,1,25000),(18,18,1,30000),
(19,19,2,14000),(20,20,1,50000);
--8
INSERT INTO Cart(UserId) VALUES
(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),
(12),(13),(14),(15),(16),(17),(18),(19),(20),(2);
--9
INSERT INTO CartItem(CartId, ProductId, Quantity) VALUES
(1,1,2),(2,2,1),(3,3,2),(4,4,1),(5,5,3),
(6,6,2),(7,7,1),(8,8,2),(9,9,1),(10,10,2),
(11,11,1),(12,12,2),(13,13,1),(14,14,2),(15,15,1),
(16,16,2),(17,17,1),(18,18,2),(19,19,1),(20,20,2);
--10
INSERT INTO Review(UserId, ProductId, Rating, Comment) VALUES
(2,1,5,N'Bút viết rất mượt'),
(3,2,4,N'Chất lượng ổn'),
(4,3,5,N'Vở giấy dày đẹp'),
(5,4,5,N'Giấy in rất tốt'),
(6,5,3,N'Tạm ổn'),
(7,6,4,N'Dùng ổn'),
(8,7,5,N'Viết bảng rõ'),
(9,8,5,N'Màu đẹp'),
(10,9,4,N'Thước chắc chắn'),
(11,10,3,N'Dùng được'),
(12,11,4,N'Ghim tốt'),
(13,12,5,N'Băng keo dính chắc'),
(14,13,5,N'Sổ đẹp'),
(15,14,4,N'Viết tốt'),
(16,15,5,N'Giấy note tiện'),
(17,16,5,N'Bút gel mượt'),
(18,17,4,N'Kéo cắt tốt'),
(19,18,3,N'Tạm ổn'),
(20,19,4,N'Hồ dán chắc'),
(2,20,5,N'Bảng đẹp dễ dùng');