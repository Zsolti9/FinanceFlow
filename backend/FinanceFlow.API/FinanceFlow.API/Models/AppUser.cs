using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceFlow.Api.Models
{
    public class AppUser : IdentityUser
    {
        
            [NotMapped]
            public string DisplayName { get; set; }
        

    }
}
