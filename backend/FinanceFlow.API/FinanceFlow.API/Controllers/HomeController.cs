using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceFlow.API.Controllers
{
    [ApiController]
    [Route("api/home")]
    public class HomeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Home oldal "Kiadások" kártya: aktuális hónap (vagy query alapján),
        /// kategóriánként csoportosítva + havi összes.
        /// </summary>
        /// <param name="year">opcionális</param>
        /// <param name="month">opcionális (1-12)</param>
        /// <param name="limit">kategóriánként hány sort adjon vissza (default 3)</param>
        [HttpGet("expenses")]
        [Authorize]
        public async Task<ActionResult<HomeExpensesDto>> GetHomeExpenses(
            [FromQuery] int? year,
            [FromQuery] int? month,
            [FromQuery] int limit = 3)
        {
            if (limit < 1) limit = 1;
            if (limit > 20) limit = 20;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized();

            var now = DateTime.UtcNow;
            var y = year ?? now.Year;
            var m = month ?? now.Month;

            if (m < 1 || m > 12)
                return BadRequest("A month értéke 1..12 lehet.");

            var from = new DateTime(y, m, 1);
            var to = from.AddMonths(1);

            // 1) Havi összes (DB-ben számol)
            var total = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.CreatedAt >= from && e.CreatedAt < to)
                .SumAsync(e => (decimal?)e.Amount) ?? 0m;

            // 2) Kategóriánként top N legfrissebb
            // EF Core támogatja a GroupBy + Take mintát (verziótól függően).
            // Ha nálatok nem fordul SQL-re, lejjebb adok egy biztos "memóriás" verziót is.
            var grouped = await _context.Expenses
                .AsNoTracking()
                .Where(e => e.UserId == userId && e.CreatedAt >= from && e.CreatedAt < to)
                .OrderByDescending(e => e.CreatedAt)
                .Select(e => new { e.Id, e.Name, e.Amount, e.CreatedAt, e.Category })
                .ToListAsync();

            var categories = grouped
                .GroupBy(x => string.IsNullOrWhiteSpace(x.Category) ? "General" : x.Category)
                .Select(g => new HomeExpenseCategoryDto
                {
                    Category = g.Key,
                    CategoryTotal = g.Sum(x => x.Amount),
                    Items = g
                        .OrderByDescending(x => x.CreatedAt)
                        .Take(limit)
                        .Select(x => new HomeExpenseItemDto
                        {
                            Id = x.Id,
                            Name = x.Name,
                            Amount = x.Amount,
                            CreatedAt = x.CreatedAt
                        })
                        .ToList()
                })
                .OrderByDescending(c => c.CategoryTotal)
                .ToList();

            return Ok(new HomeExpensesDto
            {
                Year = y,
                Month = m,
                Total = total,
                Categories = categories
            });
        }
    }
}
