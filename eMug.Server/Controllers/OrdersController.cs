using System.Security.Claims;
using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace eMug.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/orders")]
public class OrdersController(AppDbContext db, IConfiguration config) : ControllerBase
{
    public const string PaymentCash = "Ramburs";
    public const string PaymentCard = "Card";
    public const string StatusPlaced = "Plasata";
    public const string StatusAwaitingPayment = "In asteptarea platii";
    public const string StatusPaid = "Platita";

    private static readonly string[] PaymentMethods = [PaymentCash, PaymentCard];

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // istoricul comenzilor utilizatorului logat
    [HttpGet("my")]
    public async Task<IActionResult> GetMine() =>
        Ok(await Project(db.Orders
                .Where(o => o.UserId == UserId)
                .OrderByDescending(o => o.CreatedAt))
            .ToListAsync());

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var query = db.Orders.Where(o => o.Id == id);
        if (!User.IsInRole("Admin"))
            query = query.Where(o => o.UserId == UserId);

        var order = await Project(query).FirstOrDefaultAsync();
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateOrderDto dto)
    {
        // token valid, dar contul nu mai exista in baza de date
        if (!await db.Users.AnyAsync(u => u.Id == UserId))
            return Unauthorized();
        if (dto.Items is null || dto.Items.Count == 0)
            return BadRequest("Cosul este gol.");
        if (dto.Items.Any(i => i.Quantity <= 0))
            return BadRequest("Cantitate invalida.");
        if (new[] { dto.FullName, dto.Phone, dto.Address, dto.City, dto.County, dto.PostalCode }
                .Any(string.IsNullOrWhiteSpace))
            return BadRequest("Completeaza toate datele de livrare.");
        if (!PaymentMethods.Contains(dto.PaymentMethod))
            return BadRequest("Metoda de plata invalida.");

        var quantities = dto.Items
            .GroupBy(i => i.ProductId)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.Quantity));

        var products = await db.Products
            .Include(p => p.DeliveryMethods)
            .Where(p => quantities.Keys.Contains(p.Id))
            .ToListAsync();
        if (products.Count != quantities.Count)
            return BadRequest("Unul dintre produse nu mai exista.");

        var delivery = await db.DeliveryMethods.FindAsync(dto.DeliveryMethodId);
        if (delivery is null)
            return BadRequest("Metoda de livrare nu exista.");

        foreach (var p in products)
        {
            if (p.Stock < quantities[p.Id])
                return BadRequest($"Stoc insuficient pentru \"{p.Name}\" (disponibil: {p.Stock}).");
            if (p.DeliveryMethods.All(d => d.Id != delivery.Id))
                return BadRequest($"\"{p.Name}\" nu poate fi livrat prin {delivery.Name}.");
        }

        var order = new Order
        {
            UserId = UserId,
            FullName = dto.FullName.Trim(),
            Phone = dto.Phone.Trim(),
            Address = dto.Address.Trim(),
            City = dto.City.Trim(),
            County = dto.County.Trim(),
            PostalCode = dto.PostalCode.Trim(),
            PaymentMethod = dto.PaymentMethod,
            Status = dto.PaymentMethod == PaymentCard ? StatusAwaitingPayment : StatusPlaced,
            Notes = string.IsNullOrWhiteSpace(dto.Notes) ? null : dto.Notes.Trim(),
            DeliveryMethodId = delivery.Id,
            DeliveryName = delivery.Name,
            DeliveryPrice = delivery.Price,
        };

        foreach (var p in products)
        {
            p.Stock -= quantities[p.Id];
            order.Items.Add(new OrderItem
            {
                ProductId = p.Id,
                ProductName = p.Name,
                ImageUrl = p.ImageUrl,
                UnitPrice = p.Price,
                Quantity = quantities[p.Id],
            });
        }

        order.Subtotal = order.Items.Sum(i => i.UnitPrice * i.Quantity);
        order.Total = order.Subtotal + order.DeliveryPrice;

        db.Orders.Add(order);
        await db.SaveChangesAsync();

        var created = await Project(db.Orders.Where(o => o.Id == order.Id)).FirstAsync();
        return CreatedAtAction(nameof(Get), new { id = order.Id }, created);
    }

    // creeaza o sesiune Stripe Checkout si intoarce link-ul catre pagina de plata
    [HttpPost("{id:int}/pay")]
    public async Task<IActionResult> Pay(int id)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);
        if (order is null) return NotFound();
        if (order.PaymentMethod != PaymentCard)
            return BadRequest("Comanda nu se plateste cu cardul.");
        if (order.Status == StatusPaid)
            return BadRequest("Comanda este deja platita.");

        var client = StripeClientOrNull();
        if (client is null)
            return StatusCode(503, "Plata cu cardul nu este configurata.");

        // pagina de dupa plata e pe frontend; Origin vine de la browser (prin proxy-ul Vite in dev)
        var origin = Request.Headers.Origin.FirstOrDefault() ?? $"{Request.Scheme}://{Request.Host}";

        var lineItems = order.Items
            .Select(i => new SessionLineItemOptions
            {
                Quantity = i.Quantity,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "ron",
                    UnitAmount = ToBani(i.UnitPrice),
                    ProductData = new SessionLineItemPriceDataProductDataOptions { Name = i.ProductName },
                },
            })
            .ToList();

        if (order.DeliveryPrice > 0)
        {
            lineItems.Add(new SessionLineItemOptions
            {
                Quantity = 1,
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "ron",
                    UnitAmount = ToBani(order.DeliveryPrice),
                    ProductData = new SessionLineItemPriceDataProductDataOptions { Name = $"Livrare: {order.DeliveryName}" },
                },
            });
        }

        var session = await new SessionService(client).CreateAsync(new SessionCreateOptions
        {
            Mode = "payment",
            LineItems = lineItems,
            ClientReferenceId = order.Id.ToString(),
            CustomerEmail = User.FindFirstValue(ClaimTypes.Email),
            SuccessUrl = $"{origin}/orders/{order.Id}?paid=1",
            CancelUrl = $"{origin}/orders/{order.Id}?canceled=1",
            Metadata = new Dictionary<string, string> { ["orderId"] = order.Id.ToString() },
        });

        order.StripeSessionId = session.Id;
        await db.SaveChangesAsync();

        return Ok(new { url = session.Url });
    }

    // dupa intoarcerea de pe Stripe verificam la Stripe daca sesiunea a fost platita
    [HttpPost("{id:int}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(int id)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);
        if (order is null) return NotFound();

        if (order.Status != StatusPaid)
        {
            if (order.StripeSessionId is null)
                return BadRequest("Plata nu a fost initiata.");

            var client = StripeClientOrNull();
            if (client is null)
                return StatusCode(503, "Plata cu cardul nu este configurata.");

            var session = await new SessionService(client).GetAsync(order.StripeSessionId);
            if (session.PaymentStatus != "paid")
                return BadRequest("Plata nu a fost finalizata.");

            order.Status = StatusPaid;
            order.PaidAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }

        return Ok(await Project(db.Orders.Where(o => o.Id == id)).FirstAsync());
    }

    private StripeClient? StripeClientOrNull()
    {
        var key = config["Stripe:SecretKey"];
        return string.IsNullOrWhiteSpace(key) ? null : new StripeClient(key);
    }

    private static long ToBani(decimal lei) => (long)Math.Round(lei * 100, MidpointRounding.AwayFromZero);

    private static IQueryable<OrderResponse> Project(IQueryable<Order> query) =>
        query.Select(o => new OrderResponse(
            o.Id,
            o.CreatedAt,
            o.Status,
            o.FullName,
            o.Phone,
            o.Address,
            o.City,
            o.County,
            o.PostalCode,
            o.PaymentMethod,
            o.Notes,
            o.PaidAt,
            o.DeliveryName,
            o.DeliveryPrice,
            o.Subtotal,
            o.Total,
            o.Items
                .Select(i => new OrderItemResponse(i.ProductId, i.ProductName, i.ImageUrl, i.UnitPrice, i.Quantity))
                .ToList()));
}

public record OrderItemDto(int ProductId, int Quantity);

public record CreateOrderDto(
    List<OrderItemDto> Items,
    int DeliveryMethodId,
    string FullName,
    string Phone,
    string Address,
    string City,
    string County,
    string PostalCode,
    string PaymentMethod,
    string? Notes);

public record OrderItemResponse(int? ProductId, string ProductName, string? ImageUrl, decimal UnitPrice, int Quantity);

public record OrderResponse(
    int Id,
    DateTime CreatedAt,
    string Status,
    string FullName,
    string Phone,
    string Address,
    string City,
    string County,
    string PostalCode,
    string PaymentMethod,
    string? Notes,
    DateTime? PaidAt,
    string DeliveryName,
    decimal DeliveryPrice,
    decimal Subtotal,
    decimal Total,
    List<OrderItemResponse> Items);
