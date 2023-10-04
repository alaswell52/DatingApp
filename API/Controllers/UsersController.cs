
using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // https://localhost:5001/api/users

    [Authorize]
    public class UsersController : BaseApiController
    {
        private readonly IUserRepository _userRepository;
        private readonly IPhotoService _photoService;
        public IMapper _mapper;

        public UsersController(IUserRepository userRepository,
                                IPhotoService photoService,
                                IMapper mapper
                                )
        {
            _userRepository = userRepository;
            _photoService = photoService;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<PagedList<MemberDTO>>> GetUsers([FromQuery]UserParams userParams)
        {
            var currentUser = await _userRepository.GetUserByUsernameAsync(User.GetUsername());
            userParams.CurrentUsername = currentUser.UserName;

            if(string.IsNullOrEmpty(userParams.Gender))
            {
                userParams.Gender = currentUser.Gender == "male" ? "female" : "male"; 
            }

            var users = await _userRepository.GetMembersAsync(userParams);
            Response.AddPaginationHeader(
                new PaginationHeader(users.CurrentPage, 
                                    users.PageSize, 
                                    users.TotalCount, 
                                    users.TotalPages));  
            return Ok(users);
        }        



        // [HttpGet("{id}")]
        // public async Task<ActionResult<AppUser>> GetUser(int id) // /api/user/2
        //     => await _userRepository.GetUserByIdAsync(id); 

        [HttpGet("{username}")] 
        public async Task<ActionResult<MemberDTO>> GetUser(string username) // /api/user/2
            => await _userRepository.GetMemberAsync(username);

        [HttpPut()]
        public async Task<ActionResult> UpdateUser(MemberUpdateDTO memberUpdateDTO)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());
            if(user == null) return NotFound();

            _mapper.Map(memberUpdateDTO, user);

            if(await _userRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<PhotoDTO>> AddPhoto(IFormFile file)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());
            if(user == null) return NotFound();
            var result = await _photoService.AddPhotoAsync(file); // add Image to cloudinary
            if(result.Error != null) return BadRequest(result.Error.Message);
            var photo = new Photo 
            {
                Url = result.SecureUrl.AbsoluteUri,
                PublicId = result.PublicId
            };

            if(user.Photos.Count == 0) photo.IsMain = true;
            user.Photos.Add(photo); // add photo to DB with reference to cloudinary photo

            if(await _userRepository.SaveAllAsync()) 
            {
                return CreatedAtAction(nameof(GetUser), new {username = user.UserName,}, _mapper.Map<PhotoDTO>(photo));
            }

            return BadRequest("Problem adding photo");

        }


        [HttpPut("set-main-photo/{photoId}")]
        public async Task<ActionResult> SetMainPhoto(int photoId)
        {
            var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());

            if(user == null) return NotFound();

            var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);

            if(photo == null) return NotFound();

            if(photo.IsMain) return BadRequest("This is already your main photo");

            var currentMain = user.Photos.FirstOrDefault(x => x.IsMain);
            if(currentMain != null) currentMain.IsMain = false;
            photo.IsMain = true;


            if(await _userRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Problem setting main photo");

        }


    }

}
