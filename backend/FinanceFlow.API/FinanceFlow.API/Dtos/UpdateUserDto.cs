namespace FinanceFlow.API.Dtos
{
    public class UpdateUserDto
    {
        public string? Email { get; set; }
        public string? DisplayName { get; set; }
        public string? NewPassword { get; set; }
    }
}
