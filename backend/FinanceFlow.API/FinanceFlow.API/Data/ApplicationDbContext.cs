using FinanceFlow.Api.Models;
using FinanceFlow.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FinanceFlow.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options) { }

        public DbSet<Expense> Expenses { get; set; }
        public DbSet<CategoryBudget> CategoryBudgets { get; set; }
        public DbSet<SavingsGoal> SavingsGoals { get; set; }
    }
}
