using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(int? categoryId, string? search)
    {
        var query = db.Products.AsQueryable();

        if (categoryId is not null)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search));

        return Ok(await Project(query).ToListAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var p = await Project(db.Products.Where(x => x.Id == id)).FirstOrDefaultAsync();
        return p is null ? NotFound() : Ok(p);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(ProductDto dto)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequest("Categoria nu exista.");
        if (!await db.Suppliers.AnyAsync(s => s.Id == dto.SupplierId))
            return BadRequest("Furnizorul nu exista.");

        var p = new Product();
        await Apply(p, dto);
        db.Products.Add(p);
        await db.SaveChangesAsync();

        var created = await Project(db.Products.Where(x => x.Id == p.Id)).FirstAsync();
        return CreatedAtAction(nameof(Get), new { id = p.Id }, created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProductDto dto)
    {
        var p = await db.Products
            .Include(x => x.DeliveryMethods)
            .FirstOrDefaultAsync(x => x.Id == id);
        if (p is null) return NotFound();

        await Apply(p, dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await db.Products.FindAsync(id);
        if (p is null) return NotFound();
        db.Products.Remove(p);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static IQueryable<ProductResponse> Project(IQueryable<Product> query) =>
        query.Select(p => new ProductResponse(
            p.Id,
            p.Name,
            p.Description,
            p.Specifications,
            p.Price,
            p.Stock,
            p.ImageUrl,
            p.CategoryId,
            new NamedDto(p.Category!.Id, p.Category.Name),
            p.SupplierId,
            new NamedDto(p.Supplier!.Id, p.Supplier.Name),
            p.DeliveryMethods
                .Select(d => new DeliveryInfoDto(d.Id, d.Name, d.Price, d.EstimatedDays))
                .ToList()));

    private async Task Apply(Product p, ProductDto dto)
    {
        p.Name = dto.Name;
        p.Description = dto.Description;
        p.Specifications = dto.Specifications;
        p.Price = dto.Price;
        p.Stock = dto.Stock;
        p.ImageUrl = dto.ImageUrl;
        p.CategoryId = dto.CategoryId;
        p.SupplierId = dto.SupplierId;
        p.DeliveryMethods = await db.DeliveryMethods
            .Where(d => dto.DeliveryMethodIds.Contains(d.Id))
            .ToListAsync();
    }
}

public record ProductDto(
    string Name,
    string Description,
    string Specifications,
    decimal Price,
    int Stock,
    string? ImageUrl,
    int CategoryId,
    int SupplierId,
    List<int> DeliveryMethodIds);

public record NamedDto(int Id, string Name);

public record DeliveryInfoDto(int Id, string Name, decimal Price, int EstimatedDays);

public record ProductResponse(
    int Id,
    string Name,
    string Description,
    string Specifications,
    decimal Price,
    int Stock,
    string? ImageUrl,
    int CategoryId,
    NamedDto Category,
    int SupplierId,
    NamedDto Supplier,
    List<DeliveryInfoDto> DeliveryMethods);