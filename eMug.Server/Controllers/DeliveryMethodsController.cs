using eMug.Server.Data;
using eMug.Server.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace eMug.Server.Controllers
{
    [ApiController]
    [Route("api/delivery-methods")]
    public class DeliveryMethodsController(AppDbContext db) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await db.DeliveryMethods.Select(dm => new { dm.Id, dm.Name, dm.Price, dm.EstimatedDays }).ToListAsync());

        [HttpGet("{id:int}")]
        public async Task<IActionResult> Get(int id)
        {
            var dm = await db.DeliveryMethods.FindAsync(id);
            return dm is null ? NotFound() : Ok(new { dm.Id, dm.Name, dm.Price, dm.EstimatedDays });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(DeliveryMethodsDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.EstimatedDays < 0)
                return BadRequest("Date invalide.");

            var dm = new DeliveryMethod { Name = dto.Name, Price = dto.Price, EstimatedDays = dto.EstimatedDays };
            db.DeliveryMethods.Add(dm);
            await db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = dm.Id },
                new { dm.Id, dm.Name, dm.Price, dm.EstimatedDays });
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, DeliveryMethodsDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.EstimatedDays < 0)
                return BadRequest("Date invalide.");

            var dm = await db.DeliveryMethods.FindAsync(id);
            if (dm is null) return NotFound();

            dm.Name = dto.Name;
            dm.Price = dto.Price;
            dm.EstimatedDays = dto.EstimatedDays;

            await db.SaveChangesAsync();
            return NoContent();
        }
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var dm = await db.DeliveryMethods.FindAsync(id);
            if (dm is null) return NotFound();

            db.DeliveryMethods.Remove(dm);
            await db.SaveChangesAsync();
            return NoContent();
        }
    }

    public record DeliveryMethodsDto(string Name, decimal Price, int EstimatedDays);
}
