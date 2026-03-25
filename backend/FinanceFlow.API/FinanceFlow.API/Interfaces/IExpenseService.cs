using FinanceFlow.API.Dtos;
using FinanceFlow.API.Models;

namespace FinanceFlow.API.Interfaces;

public interface IExpenseService
{
    Task<AddExpenseResult> AddExpenseAsync(string userId, ExpenseDto dto);
    Task<List<Expense>> GetExpensesAsync(string userId);
    Task<DeleteExpenseResult> DeleteExpenseAsync(string userId, int id);
}

public record AddExpenseResult(bool IsUnauthorized, bool IsBudgetExceeded, decimal Remaining, Expense? Expense)
{
    public static AddExpenseResult Unauthorized() => new(true, false, 0, null);
    public static AddExpenseResult BudgetExceeded(decimal remaining) => new(false, true, remaining, null);
    public static AddExpenseResult Success(Expense expense) => new(false, false, 0, expense);
}

public enum DeleteExpenseResult
{
    Success,
    NotFound,
    Forbidden
}