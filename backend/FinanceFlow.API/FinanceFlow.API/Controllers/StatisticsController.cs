using FinanceFlow.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StatisticsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public StatisticsController(ApplicationDbContext context) => _context = context;

    private string UserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("monthly-average")]
    public async Task<IActionResult> GetMonthlyAverage()
    {
        var uid = UserId();

        var monthly = await _context.Expenses
            .Where(x => x.UserId == uid)
            .GroupBy(x => new { x.CreatedAt.Year, x.CreatedAt.Month })
            .Select(g => new
            {
                g.Key.Year,
                g.Key.Month,
                Total = g.Sum(x => x.Amount)
            })
            .OrderBy(x => x.Year).ThenBy(x => x.Month)
            .ToListAsync();

        var avg = monthly.Count == 0 ? 0 : monthly.Average(x => (double)x.Total);

        return Ok(new
        {
            monthly,
            averageMonthly = Math.Round(avg, 0)
        });
    }
}
