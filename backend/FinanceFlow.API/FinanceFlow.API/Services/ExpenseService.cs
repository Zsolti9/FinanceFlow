using FinanceFlow.Api.Data;
using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceFlow.API.Services;

public class ExpenseService(ApplicationDbContext context) : IExpenseService
{
    private readonly ApplicationDbContext _context = context;

    public async Task<AddExpenseResult> AddExpenseAsync(string userId, ExpenseDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
            return AddExpenseResult.Unauthorized();

        if (user.MonthlyBudget > 0)
        {
            var now = DateTime.UtcNow;
            var monthStart = new DateTime(now.Year, now.Month, 1);
            var monthEnd = monthStart.AddMonths(1);

            var currentMonthSpend = await _context.Expenses
                .Where(e => e.UserId == userId && e.CreatedAt >= monthStart && e.CreatedAt < monthEnd)
                .SumAsync(e => (decimal?)e.Amount) ?? 0;

            if (currentMonthSpend + dto.Amount > user.MonthlyBudget)
            {
                var remaining = user.MonthlyBudget - currentMonthSpend;
                return AddExpenseResult.BudgetExceeded(remaining);
            }
        }

        var expense = new Expense
        {
            UserId = userId,
            Name = dto.Name,
            Amount = dto.Amount,
            Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Expenses.AddAsync(expense);
        await _context.SaveChangesAsync();

        return AddExpenseResult.Success(expense);
    }

    public Task<List<Expense>> GetExpensesAsync(string userId) =>
        _context.Expenses
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

    public async Task<DeleteExpenseResult> DeleteExpenseAsync(string userId, int id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense == null)
            return DeleteExpenseResult.NotFound;

        if (expense.UserId != userId)
            return DeleteExpenseResult.Forbidden;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return DeleteExpenseResult.Success;
    }
}