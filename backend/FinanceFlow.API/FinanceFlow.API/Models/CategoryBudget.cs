using FinanceFlow.Api.Models;
using System.ComponentModel.DataAnnotations;

namespace FinanceFlow.API.Models
{
    public class CategoryBudget
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        [Range(2000, 2100)]
        public int Year { get; set; }

        [Range(1, 12)]
        public int Month { get; set; }

        [Required]
        [MaxLength(40)]
        public string Category { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public AppUser User { get; set; } = null!;
    }
}
