using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceFlow.API.Controllers
{
    [ApiController]
    [Route("api/budgets")]
    [Authorize]
    public class BudgetsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BudgetsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("Missing user id claim.");
        }

        // GET /api/budgets/categories?year=2026&month=1
        [HttpGet("categories")]
        public async Task<ActionResult<CategoryBudgetsResponseDto>> GetBudgets(
            [FromQuery] int year,
            [FromQuery] int month)
        {
            var userId = GetUserId();

            var items = await _context.CategoryBudgets
                .Where(x =>
                    x.UserId == userId &&
                    x.Year == year &&
                    x.Month == month)
                .Select(x => new CategoryBudgetItemDto
                {
                    Category = x.Category,
                    Amount = x.Amount
                })
                .ToListAsync();

            return Ok(new CategoryBudgetsResponseDto
            {
                Year = year,
                Month = month,
                Items = items
            });
        }

        // PUT /api/budgets/categories?year=2026&month=1
        [HttpPut("categories")]
        public async Task<IActionResult> SaveBudgets(
            [FromQuery] int year,
            [FromQuery] int month,
            [FromBody] SaveCategoryBudgetsDto dto)
        {
            var userId = GetUserId();

            var existing = await _context.CategoryBudgets
                .Where(x =>
                    x.UserId == userId &&
                    x.Year == year &&
                    x.Month == month)
                .ToListAsync();

            foreach (var item in dto.Items)
            {
                var row = existing.FirstOrDefault(x => x.Category == item.Category);

                if (row == null)
                {
                    _context.CategoryBudgets.Add(new CategoryBudget
                    {
                        UserId = userId,
                        Year = year,
                        Month = month,
                        Category = item.Category,
                        Amount = item.Amount
                    });
                }
                else
                {
                    row.Amount = item.Amount;
                    row.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
