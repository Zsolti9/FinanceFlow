using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceFlow.Api.Models
{
    public class AppUser : IdentityUser
    {
        public decimal MonthlyBudget { get; set; }

        public string? ProfileImagePath { get; set; }

        [NotMapped]
            public string DisplayName { get; set; }

        

    }
}
