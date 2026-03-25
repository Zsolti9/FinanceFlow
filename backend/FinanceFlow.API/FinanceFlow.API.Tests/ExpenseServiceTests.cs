using FinanceFlow.API.Dtos;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Services;
using Microsoft.EntityFrameworkCore;
using FinanceFlow.Api.Models;
using FinanceFlow.Api.Data;

namespace FinanceFlow.API.Tests;

public class ExpenseServiceTests
{
    [Fact]
    public async Task AddExpenseAsync_WithMissingUser_ReturnsUnauthorized()
    {
        await using var context = CreateContext();
        IExpenseService sut = new ExpenseService(context);

        var result = await sut.AddExpenseAsync("missing-user", new ExpenseDto { Name = "Coffee", Amount = 5000 });

        Assert.True(result.IsUnauthorized);
        Assert.Null(result.Expense);
    }

    [Fact]
    public async Task AddExpenseAsync_WhenBudgetExceeded_ReturnsBudgetExceededWithRemaining()
    {
        await using var context = CreateContext();
        context.Users.Add(new AppUser { Id = "user-1", UserName = "u1", Email = "u1@test.dev", MonthlyBudget = 10000 });
        context.Expenses.Add(new FinanceFlow.API.Models.Expense
        {
            UserId = "user-1",
            Name = "Rent",
            Amount = 9000,
            Category = "Housing",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        IExpenseService sut = new ExpenseService(context);
        var result = await sut.AddExpenseAsync("user-1", new ExpenseDto { Name = "Food", Amount = 2000 });

        Assert.True(result.IsBudgetExceeded);
        Assert.Equal(1000, result.Remaining);
    }

    [Fact]
    public async Task AddExpenseAsync_WithEmptyCategory_UsesGeneral()
    {
        await using var context = CreateContext();
        context.Users.Add(new AppUser { Id = "user-2", UserName = "u2", Email = "u2@test.dev", MonthlyBudget = 0 });
        await context.SaveChangesAsync();

        IExpenseService sut = new ExpenseService(context);
        var result = await sut.AddExpenseAsync("user-2", new ExpenseDto { Name = "Snack", Amount = 1000, Category = " " });

        Assert.False(result.IsUnauthorized);
        Assert.False(result.IsBudgetExceeded);
        Assert.NotNull(result.Expense);
        Assert.Equal("General", result.Expense!.Category);
    }

    [Fact]
    public async Task DeleteExpenseAsync_WhenDifferentUser_ReturnsForbidden()
    {
        await using var context = CreateContext();
        context.Expenses.Add(new FinanceFlow.API.Models.Expense
        {
            Id = 1,
            UserId = "owner",
            Name = "Item",
            Amount = 500,
            Category = "General",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        IExpenseService sut = new ExpenseService(context);
        var result = await sut.DeleteExpenseAsync("other-user", 1);

        Assert.Equal(DeleteExpenseResult.Forbidden, result);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}