namespace FinanceFlow.API.Dtos
{
    public sealed class HomeExpensesDto
    {
        public int Year { get; init; }
        public int Month { get; init; }

        public decimal Total { get; init; } // havi összes
        public List<HomeExpenseCategoryDto> Categories { get; init; } = new();
    }

    public sealed class HomeExpenseCategoryDto
    {
        public string Category { get; init; } = "";
        public decimal CategoryTotal { get; init; }
        public List<HomeExpenseItemDto> Items { get; init; } = new();
    }

    public sealed class HomeExpenseItemDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = "";
        public decimal Amount { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
