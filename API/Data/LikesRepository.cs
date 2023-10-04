using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    public class LikesRepository : ILikesRepository
    {
        public DataContext _context { get; }
        public IMapper _mapper { get; set; }
        public LikesRepository(DataContext context, 
                                IMapper mapper)
        {
            _mapper = mapper;
            _context = context;            
        }
        public async Task<UserLike> GetUserLike(int sourceUserId, int targetUserId)
            =>  await _context.UserLikes.FindAsync(sourceUserId, targetUserId);
            
        public async Task<PagedList<LikeDTO>> GetUserLikes(LikesParams likesParams)
        {
            var users = _context.Users.OrderBy(u => u.UserName).AsQueryable();
            var likes = _context.UserLikes.AsQueryable();

            if(likesParams.Predicate == "liked")
            {
                likes = likes.Where(like => like.SourceUserId == likesParams.UserId);
                users = likes.Select(like => like.TargetUser);
            }

            if(likesParams.Predicate == "likedBy")
            {
                likes = likes.Where(like => like.TargetUserId == likesParams.UserId);
                users = likes.Select(like => like.TargetUser);
            }

            return await PagedList<LikeDTO>.CreateAsync(
                users.AsNoTracking()
                .Select(user => new LikeDTO{
                    UserName = user.UserName,
                    KnownAs = user.KnownAs,
                    Age = user.DateOfBirth.CalculateAge(),
                    PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain).Url,
                    City = user.City,
                    Id = user.Id
                }),
                likesParams.PageNumber,
                likesParams.PageSize
                );
            

        }

        public async Task<AppUser> GetUserWithLikes(int userId)
            => await _context.Users
                .Include(x => x.LikedUsers)
                .FirstOrDefaultAsync(x => x.Id == userId);
        
    }
}