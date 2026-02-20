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
    [Route("api/savings")]
    [Authorize]
    public class SavingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SavingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException("Missing user id claim.");
        }

        [HttpGet]
        public async Task<ActionResult<List<SavingsGoalDto>>> GetGoals()
        {
            var userId = GetUserId();

            var goals = await _context.SavingsGoals
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new SavingsGoalDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    TargetAmount = x.TargetAmount,
                    SavedAmount = x.SavedAmount,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();

            return Ok(goals);
        }

        [HttpPost]
        public async Task<ActionResult<SavingsGoalDto>> CreateGoal([FromBody] CreateSavingsGoalDto dto)
        {
            var userId = GetUserId();

            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "A név kötelező." });

            if (dto.TargetAmount <= 0)
                return BadRequest(new { message = "A célösszeg legyen pozitív." });

            var goal = new SavingsGoal
            {
                UserId = userId,
                Name = dto.Name.Trim(),
                TargetAmount = dto.TargetAmount,
                SavedAmount = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.SavingsGoals.Add(goal);
            await _context.SaveChangesAsync();

            return Ok(new SavingsGoalDto
            {
                Id = goal.Id,
                Name = goal.Name,
                TargetAmount = goal.TargetAmount,
                SavedAmount = goal.SavedAmount,
                CreatedAt = goal.CreatedAt
            });
        }

        [HttpPost("{id:int}/deposit")]
        public async Task<ActionResult<SavingsGoalDto>> AddMoney(int id, [FromBody] AddSavingsMoneyDto dto)
        {
            var userId = GetUserId();

            if (dto.Amount <= 0)
                return BadRequest(new { message = "A befizetés összege legyen pozitív." });

            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (goal == null)
                return NotFound();

            goal.SavedAmount += dto.Amount;
            goal.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new SavingsGoalDto
            {
                Id = goal.Id,
                Name = goal.Name,
                TargetAmount = goal.TargetAmount,
                SavedAmount = goal.SavedAmount,
                CreatedAt = goal.CreatedAt
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteGoal(int id)
        {
            var userId = GetUserId();
            var goal = await _context.SavingsGoals
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (goal == null)
                return NotFound();

            _context.SavingsGoals.Remove(goal);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}