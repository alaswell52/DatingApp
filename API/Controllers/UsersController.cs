
using System.Security.Claims;
using API.Data;
using API.DTOs;
using API.Entities;
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
        public IMapper _mapper;

        public UsersController(IUserRepository userRepository,
                                IMapper mapper)
        {
            _userRepository = userRepository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberDTO>>> GetUsers()        
            => Ok(await _userRepository.GetMembersAsync());


        // [HttpGet("{id}")]
        // public async Task<ActionResult<AppUser>> GetUser(int id) // /api/user/2
        //     => await _userRepository.GetUserByIdAsync(id); 

        [HttpGet("{username}")] 
        public async Task<ActionResult<MemberDTO>> GetUser(string username) // /api/user/2
            => await _userRepository.GetMemberAsync(username);

        [HttpPut()]
        public async Task<ActionResult> UpdateUser(MemberUpdateDTO memberUpdateDTO)
        {
            var username = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userRepository.GetUserByUsernameAsync(username);
            if(user == null) return NotFound();

            _mapper.Map(memberUpdateDTO, user);

            if(await _userRepository.SaveAllAsync()) return NoContent();

            return BadRequest("Failed to update user");
        }

    }

}
