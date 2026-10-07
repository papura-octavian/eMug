namespace eMug.Server.Models
{
    public class DeliveryMethod
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;   
        public decimal Price { get; set; }
        public int EstimatedDays { get; set; }
        public List<Product> Products { get; set; } = new();
    }
}
