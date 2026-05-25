CREATE TABLE ProductVariants (
    Id INT PRIMARY KEY IDENTITY(1,1),

    ProductId INT NOT NULL,

    VariantName NVARCHAR(255),

    Color NVARCHAR(50),

    Size NVARCHAR(50),

    Price DECIMAL(18,2) NOT NULL,

    Stock INT DEFAULT 0,

    ImageUrl NVARCHAR(500),

    SKU NVARCHAR(100),

    IsActive BIT DEFAULT 1,

    CreatedAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (ProductId)
        REFERENCES Product(Id)
)