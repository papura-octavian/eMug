using System.Security.Claims;
using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers;

[Authorize]
[ApiController]
[Route("api/wishlist")]
public class WishlistController(AppDbContext db) : ControllerBase
{
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet]
    public async Task<IActionResult> GetAll() =>
        Ok(await db.WishlistItems
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemResponse(
                w.ProductId,
                w.Product!.Name,
                w.Product.Price,
                w.Product.Stock,
                w.Product.ImageUrl,
                w.Product.Category!.Name,
                w.AddedAt))
            .ToListAsync());

    [HttpPost("{productId:int}")]
    public async Task<IActionResult> Add(int productId)
    {
        // token valid, dar contul nu mai exista in baza de date
        if (!await db.Users.AnyAsync(u => u.Id == UserId))
            return Unauthorized();
        if (!await db.Products.AnyAsync(p => p.Id == productId))
            return NotFound("Produsul nu exista.");

        if (!await db.WishlistItems.AnyAsync(w => w.UserId == UserId && w.ProductId == productId))
        {
            db.WishlistItems.Add(new WishlistItem { UserId = UserId, ProductId = productId });
            await db.SaveChangesAsync();
        }
        return NoContent();
    }

    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Remove(int productId)
    {
        var item = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == UserId && w.ProductId == productId);
        if (item is null) return NotFound();

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record WishlistItemResponse(
    int ProductId,
    string Name,
    decimal Price,
    int Stock,
    string? ImageUrl,
    string Category,
    DateTime AddedAt);
