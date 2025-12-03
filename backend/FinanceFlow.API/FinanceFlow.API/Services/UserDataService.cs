using FinanceFlow.Api.Data;
using FinanceFlow.API.Interfaces;
using FinanceFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace FinanceFlow.API.Services
{
    public class UserDataService: IUserService
    {

        private readonly ApplicationDbContext _context;

        public UserDataService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task CreateUserDataAsync(UserData userData)
        {
            await _context.UserData.AddAsync(userData);
            await _context.SaveChangesAsync();

        }

        public async Task<List<UserData>> GetAllUserDataAsync()
        {
            return await _context.UserData.ToListAsync();
        }
    }
}
