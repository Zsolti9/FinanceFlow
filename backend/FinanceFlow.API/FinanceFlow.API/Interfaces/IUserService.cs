using FinanceFlow.API.Models;

namespace FinanceFlow.API.Interfaces
{
    public interface IUserService
    {
        Task CreateUserDataAsync(UserData userData);
        Task <List<UserData>> GetAllUserDataAsync();
    }
}
