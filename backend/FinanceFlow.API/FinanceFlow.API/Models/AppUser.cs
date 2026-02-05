using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinanceFlow.Api.Models
{
    public class AppUser : IdentityUser
    {
        public decimal MonthlyBudget { get; set; }

        // 🖼 Profilkép elérési út
        public string? ProfileImagePath { get; set; }

        // 🌍 Nyelv (pl. "hu", "en")
        public string Language { get; set; } = "hu";

        // 💱 Alapértelmezett pénznem (HUF, EUR, USD)
        public string DefaultCurrency { get; set; } = "HUF";

        // 🔔 Értesítések ki / be
        public bool NotificationsEnabled { get; set; } = true;

        // 📅 Regisztráció ideje
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        // 🧾 Csak frontend / JWT célra (NEM DB mező)
        [NotMapped]
        public string? DisplayName { get; set; }
    }
}
