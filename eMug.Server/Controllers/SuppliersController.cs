using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers
{
    [ApiController]
    [Route("api/suppliers")]
    public class SuppliersController(AppDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await db.Suppliers
                .Select(s => new { s.Id, s.Name, s.ContactEmail })
                .ToListAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var s = await db.Suppliers.FindAsync(id);
            return s is null ? NotFound() : Ok(new { s.Id, s.Name, s.ContactEmail });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(SupplierDto dto)
        {
            var s = new Supplier { Name = dto.Name, ContactEmail = dto.ContactEmail };
            db.Suppliers.Add(s);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = s.Id },
                new { s.Id, s.Name, s.ContactEmail });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, SupplierDto dto)
        {
            var s = await db.Suppliers.FindAsync(id);
            if (s is null) return NotFound();

            s.Name = dto.Name;
            s.ContactEmail = dto.ContactEmail;
            await db.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var s = await db.Suppliers.FindAsync(id);
            if (s is null) return NotFound();

            if (await db.Products.AnyAsync(p => p.SupplierId == id))
                return Conflict("Furnizorul are produse asociate.");

            db.Suppliers.Remove(s);
            await db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record SupplierDto(string Name, string? ContactEmail);
}