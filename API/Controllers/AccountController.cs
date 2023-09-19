

using System.Security.Cryptography;
using System.Text;
using API.Controllers;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using API.Services;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


// https://localhost:5001/api/users
public class AccountController : BaseApiController
{
    private readonly DataContext _context;
    private readonly ITokenService _tokenService;

    public AccountController(DataContext context, ITokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")] // api/account/register
    public async Task<ActionResult<UserDTO>> Register(RegisterDTO registerDTO)
    {

        if(await UserExists(registerDTO.UserName))
            return BadRequest("User name is taken.");

        using var hmac = new HMACSHA512(); // using will dispose the class automatically by calling the dispose() from IDisposable interface
        var user = new AppUser
        {
            UserName = registerDTO.UserName,
            PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDTO.Password)),
            PasswordSalt = hmac.Key

        };

        _context.Users.Add(user);
        
        await _context.SaveChangesAsync();
        
        return new UserDTO
        {
            UserName = user.UserName,
            Token = _tokenService.CreateToken(user)
        };

    }

    [HttpPost("login")] // api/account/login
    public async Task<ActionResult<UserDTO>> Login(LoginDTO loginDTO)
    {
        var user = await _context.Users.FirstOrDefaultAsync(x => x.UserName.ToLower() == loginDTO.UserName.ToLower());

        if (user == null) return Unauthorized();

        using var hmac = new HMACSHA512(user.PasswordSalt);

        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDTO.Password)); 

        for (int i = 0; i < computedHash.Length; i++)
            if(computedHash[i] != user.PasswordHash[i]) return Unauthorized("Unauthorized");

        return new UserDTO
        {
            UserName = user.UserName,
            Token = _tokenService.CreateToken(user)
        };

    }

    private async Task<bool> UserExists(string userName)
        => await _context.Users.AnyAsync(x => x.UserName.ToLower() == userName.ToLower());
    


    // [HttpGet("{id}")]
    // public async Task<ActionResult<AppUser>> GetUser(int id) // /api/user/2
    //     => await _context.Users.Where(x => x.Id == id).FirstOrDefaultAsync();


}