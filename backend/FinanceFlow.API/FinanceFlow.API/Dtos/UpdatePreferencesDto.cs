namespace FinanceFlow.API.Dtos
{
    public class UpdatePreferencesDto
    {
        public string Language { get; set; } = "hu";
        public string DefaultCurrency { get; set; } = "HUF";
        public bool NotificationsEnabled { get; set; }

    }
}
