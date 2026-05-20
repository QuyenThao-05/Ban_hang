namespace BaseCore.DTO.Product
{
    public class ProductVariantResponse
{
    public int Id { get; set; }

    public string? VariantName { get; set; }

    public string? Color { get; set; }

    public string? Size { get; set; }

    public decimal Price { get; set; }

    public int Stock { get; set; }

    public string? ImageUrl { get; set; }

    public string? SKU { get; set; }
}
}