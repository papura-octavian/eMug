using System.Security.Claims;
using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/orders")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    private static readonly string[] PaymentMethods = ["Ramburs", "Card la livrare"];

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
    string DeliveryName,
    decimal DeliveryPrice,
    decimal Subtotal,
    decimal Total,
    List<OrderItemResponse> Items);
