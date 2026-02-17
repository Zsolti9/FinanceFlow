using System.ComponentModel.DataAnnotations;

namespace FinanceFlow.API.Dtos
{
    public class CategoryBudgetItemDto
    {
        [Required]
        public string Category { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Amount { get; set; }
    }

    public class CategoryBudgetsResponseDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public List<CategoryBudgetItemDto> Items { get; set; } = new();
    }

    public class SaveCategoryBudgetsDto
    {
        public List<CategoryBudgetItemDto> Items { get; set; } = new();
    }
}
