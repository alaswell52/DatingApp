

using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using API.Controllers;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


// https://localhost:5001/api/users
public class AccountController : BaseApiController
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IUserRepository _userRepository;
    private readonly IPhotoService _photoService;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AccountController(UserManager<AppUser> userManager,
                            IUserRepository userRepository,
                            IPhotoService photoService, 
                            ITokenService tokenService,
                            IMapper mapper)
    {                    
        _userManager = userManager;
        _userRepository = userRepository;
        _photoService = photoService;
        _tokenService = tokenService;
        _mapper = mapper;
    }

    [HttpPost("register")] // api/account/register
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
    {

        if(await UserExists(registerDTO.UserName)) return BadRequest("User name is taken.");

        var user = _mapper.Map<AppUser>(registerDTO);
           
        user.UserName = registerDTO.UserName.ToLower();

        var result = await _userManager.CreateAsync(user, registerDTO.Password);

        if(!result.Succeeded) return BadRequest(result.Errors);
        
        var roleResult = await _userManager.AddToRoleAsync(user, "Member");

        if(!roleResult.Succeeded) return BadRequest(result.Errors);

        return new UserDTO
        {
            Username = user.UserName,
            Token = await _tokenService.CreateToken(user),
            KnownAs = user.KnownAs,
            Gender = user.Gender 
             //, PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url
        };

    }

    [HttpPost("login")] // api/account/login
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDTO)
    {
        var user = await _userManager.Users
        .Include(p => p.Photos)
        .SingleOrDefaultAsync(x => x.UserName == loginDTO.UserName);
     
        if (user == null) return Unauthorized("Unauthorized");

        var result = await _userManager.CheckPasswordAsync(user, loginDTO.Password);

        if(!result) return Unauthorized("Unauthorized");

        return new UserDTO
        {
            Username = user.UserName,
            Token = await _tokenService.CreateToken(user),
            PhotoUrl = user.Photos.FirstOrDefault(x => x.IsMain)?.Url,
            KnownAs = user.KnownAs,
            Gender = user.Gender
        };

    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
        var user = await _userRepository.GetUserByUsernameAsync(User.GetUsername());
        var photo = user.Photos.FirstOrDefault(x => x.Id == photoId);
        if(photo == null) return NotFound();

        if(photo.IsMain) return BadRequest("You cannot delete your main photo");
        if(photo.PublicId != null)
        {
            var result = await _photoService.DeletePhotoAsync(photo.PublicId);
            if(result.Error != null) return BadRequest(result.Error.Message);
        }
        user.Photos.Remove(photo);
        if(await _userRepository.SaveAllAsync()) return Ok();
        
        return BadRequest("Problem deleting photo");
    }

    private async Task<bool> UserExists(string userName)
        => await _userManager.Users.AnyAsync(x => x.UserName.ToLower() == userName.ToLower());
    


    // [HttpGet("{id}")]
    // public async Task<ActionResult<AppUser>> GetUser(int id) // /api/user/2
    //     => await _context.Users.Where(x => x.Id == id).FirstOrDefaultAsync();


}