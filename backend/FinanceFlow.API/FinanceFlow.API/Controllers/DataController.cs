using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DataController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DataController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier);
        }

        // ➕ ÚJ KÖLTÉS
        [HttpPost]
        public async Task<IActionResult> AddExpense([FromBody] ExpenseDto dto)
        {
            var userId = GetUserId();

            // 🔹 User betöltése (keret miatt)
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return Unauthorized();

            // 🔹 Ha van beállított keret (>0)
            if (user.MonthlyBudget > 0)
            {
                var now = DateTime.UtcNow;
                var monthStart = new DateTime(now.Year, now.Month, 1);
                var monthEnd = monthStart.AddMonths(1);

                // 🔹 Aktuális havi költés
                var currentMonthSpend = await _context.Expenses
                    .Where(e =>
                        e.UserId == userId &&
                        e.CreatedAt >= monthStart &&
                        e.CreatedAt < monthEnd)
                    .SumAsync(e => (decimal?)e.Amount) ?? 0;

                // 🔹 Ellenőrzés
                if (currentMonthSpend + dto.Amount > user.MonthlyBudget)
                {
                    var remaining = user.MonthlyBudget - currentMonthSpend;

                    return BadRequest(new
                    {
                        message = "Túllépnéd a havi keretedet.",
                        remaining
                    });
                }
            }

            // 🔹 Mentés
            var expense = new Expense
            {
                UserId = userId,
                Name = dto.Name,
                Amount = dto.Amount,
                Category = string.IsNullOrWhiteSpace(dto.Category)
        ? "General"
        : dto.Category,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Expenses.AddAsync(expense);
            await _context.SaveChangesAsync();

            return Ok(expense);
        }

        // 📄 ÖSSZES KÖLTÉS LEKÉRÉSE
        [HttpGet]
        public async Task<IActionResult> GetExpenses()
        {
            var userId = GetUserId();

            var expenses = await _context.Expenses
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(expenses);
        }

        // ❌ TÖRLÉS
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            if (expense.UserId != GetUserId())
                return Forbid();

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
