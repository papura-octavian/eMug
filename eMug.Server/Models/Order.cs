namespace eMug.Server.Models
{
    public class Order
    {
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Plasata";

        // datele de livrare introduse la checkout
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string County { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // livrarea e copiata in comanda, ca sa nu se schimbe istoricul daca se modifica metoda
        public int? DeliveryMethodId { get; set; }
        public DeliveryMethod? DeliveryMethod { get; set; }
        public string DeliveryName { get; set; } = string.Empty;
        public decimal DeliveryPrice { get; set; }

        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }

        public List<OrderItem> Items { get; set; } = new();
    }
}
