namespace FinanceFlow.API.Dtos
{
    public class SavingsGoalDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int TargetAmount { get; set; }
        public int SavedAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateSavingsGoalDto
    {
        public string Name { get; set; } = string.Empty;
        public int TargetAmount { get; set; }
    }

    public class AddSavingsMoneyDto
    {
        public int Amount { get; set; }
    }
}
