using Microsoft.AspNetCore.Identity;

namespace FinanceFlow.Api.Models
{
    public class AppUser : IdentityUser
    {
        // bővíthető: FirstName, LastName, MonthlyNetIncome stb.
        public string? DisplayName { get; set; }
    }
}
