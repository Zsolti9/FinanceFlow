using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FinanceFlow.Api.Models;
using FinanceFlow.API.Models;

namespace FinanceFlow.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public DbSet<UserData> UserData { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // később: DbSet<Transaction>, DbSet<Category> stb.
    }
}
