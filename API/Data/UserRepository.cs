
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class UserRepository : IUserRepository
    {
        public readonly DataContext _context;
        public IMapper _mapper;

        public UserRepository(DataContext context,
                                IMapper mapper)
        {
            _context = context;            
            _mapper = mapper;
        }

        public async Task<MemberDTO> GetMemberAsync(string username)        
            => await _context.Users
                .Where(u => u.UserName == username)
                .ProjectTo<MemberDTO>(_mapper.ConfigurationProvider)
                //.Include(p => p.Photos)
                .FirstOrDefaultAsync();
        
        public async Task<IEnumerable<MemberDTO>> GetMembersAsync()
            => await _context.Users
                .ProjectTo<MemberDTO>(_mapper.ConfigurationProvider)
                //.Include(p => p.Photos)
                .ToListAsync();

        public async Task<AppUser> GetUserByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<AppUser> GetUserByUsernameAsync(string username)
        {
            return await _context.Users
            .Include(p => p.Photos)            
            .FirstOrDefaultAsync(x => x.UserName == username); 
        } 

        public async Task<IEnumerable<AppUser>> GetUsers()
        {
            return await _context.Users
            .Include(p => p.Photos)
            .ToListAsync();
        }

        public async Task<bool> SaveAllAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(AppUser user)
        {
            _context.Entry(user).State = EntityState.Modified; // Informs Entity tracking that something has changed in the entity
        }
    }
}