using FinanceFlow.Api.Models;

namespace FinanceFlow.API.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(AppUser user, IList<string> roles = null);
    }
}
