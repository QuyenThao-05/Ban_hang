Create database VPP
use VPP
GO
CREATE TABLE [User] (
    Id INT IDENTITY PRIMARY KEY,
    Username NVARCHAR(50) NOT NULL,
    Password NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(100),
    Email NVARCHAR(100),
    Phone NVARCHAR(20),
    Address NVARCHAR(255),
    Role NVARCHAR(20) DEFAULT 'user', -- admin / user
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE ProductType (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255)
);
CREATE TABLE Product (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(255),
    Price DECIMAL(18,2),
    Quantity INT,
    Image NVARCHAR(255),
    ProductTypeId INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (ProductTypeId) REFERENCES ProductType(Id)
);
CREATE TABLE ProductDetail (
    Id INT IDENTITY PRIMARY KEY,
    ProductId INT,
    Description NVARCHAR(MAX),
    Brand NVARCHAR(100),
    Color NVARCHAR(50),
    Size NVARCHAR(50),
    FOREIGN KEY (ProductId) REFERENCES Product(Id)
);
CREATE TABLE Bill (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT,
    TotalPrice DECIMAL(18,2),
    Status NVARCHAR(50), -- Pending / Done / Cancel
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES [User](Id)
);
CREATE TABLE BillDetail (
    Id INT IDENTITY PRIMARY KEY,
    BillId INT,
    ProductId INT,
    Quantity INT,
    Price DECIMAL(18,2),
    FOREIGN KEY (BillId) REFERENCES Bill(Id),
    FOREIGN KEY (ProductId) REFERENCES Product(Id)
);
CREATE TABLE Cart (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES [User](Id)
);
CREATE TABLE CartItem (
    Id INT IDENTITY PRIMARY KEY,
    CartId INT,
    ProductId INT,
    Quantity INT,
    FOREIGN KEY (CartId) REFERENCES Cart(Id),
    FOREIGN KEY (ProductId) REFERENCES Product(Id)
);
CREATE TABLE Review (
    Id INT IDENTITY PRIMARY KEY,
    UserId INT,
    ProductId INT,
    Rating INT,
    Comment NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE()
);
CREATE TABLE Manufacturer (
    Id INT IDENTITY PRIMARY KEY,
    Name NVARCHAR(255) NOT NULL,
    Address NVARCHAR(255),
    Phone NVARCHAR(20)
);
ALTER TABLE Product
ADD ManufacturerId INT;
ALTER TABLE Product
ADD CONSTRAINT FK_Product_Manufacturer
FOREIGN KEY (ManufacturerId) REFERENCES Manufacturer(Id);