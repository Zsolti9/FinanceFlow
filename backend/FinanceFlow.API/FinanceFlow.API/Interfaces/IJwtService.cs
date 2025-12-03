using FinanceFlow.Api.Models;

namespace FinanceFlow.Api.Services
{
    public interface IJwtService
    {
        string GenerateToken(AppUser user, IList<string> roles = null);
    }
}
