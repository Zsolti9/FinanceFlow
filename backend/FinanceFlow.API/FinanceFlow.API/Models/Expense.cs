namespace FinanceFlow.API.Models
{
    public class Expense
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
        public int Amount { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
