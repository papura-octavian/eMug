using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers
{
    [ApiController]
    [Route("api/categories")]
    public class CategoriesController(AppDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await db.Categories.Select(c => new { c.Id, c.Name }).ToListAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var c = await db.Categories.FindAsync(id);
            return c is null ? NotFound() : Ok(new { c.Id, c.Name });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Date invalide.");

            var c = new Category { Name = dto.Name };
            db.Categories.Add(c);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = c.Id }, new { c.Id, c.Name });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, CategoryDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest("Date invalide.");

            var c = await db.Categories.FindAsync(id);
            if (c is null) return NotFound();
            c.Name = dto.Name;
            await db.SaveChangesAsync();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var c = await db.Categories.FindAsync(id);
            if (c is null) return NotFound();

            if (await db.Products.AnyAsync(p => p.CategoryId == id))
                return Conflict("Categoria are produse asociate.");

            db.Categories.Remove(c);
            await db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record CategoryDto(string Name);
}
