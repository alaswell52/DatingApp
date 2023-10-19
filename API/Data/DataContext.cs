using API.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

// DbContext is a combination of unit of work and Repository Patterns
public class DataContext : IdentityDbContext<
    AppUser, 
    AppRole, 
    int, 
    IdentityUserClaim<int>, 
    AppUserRole,
    IdentityUserLogin<int>,
    IdentityRoleClaim<int>,
    IdentityUserToken<int>>
{

    public DataContext(DbContextOptions options) : base(options)
    {

    }

    public DbSet<UserLike> UserLikes { get; set; }
    public DbSet<Message> Messages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AppUser>()
            .HasMany(ur => ur.UserRoles )
            .WithOne(u => u.User)
            .HasForeignKey(ur => ur.UserId)
            .IsRequired();

        modelBuilder.Entity<AppRole>()
            .HasMany(ur => ur.UserRoles )
            .WithOne(u => u.Role)
            .HasForeignKey(ur => ur.RoleId)
            .IsRequired();            

        modelBuilder.Entity<UserLike>()
            .HasKey(k => new {k.SourceUserId, k.TargetUserId});
        
        modelBuilder.Entity<UserLike>()
            .HasOne(s => s.SourceUser)
            .WithMany(l => l.LikedUsers)
            .HasForeignKey(s => s.SourceUserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<UserLike>()
            .HasOne(s => s.TargetUser)
            .WithMany(l => l.LikedByUsers)
            .HasForeignKey(s => s.TargetUserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        modelBuilder.Entity<Message>()
            .HasOne(s => s.Sender)
            .WithMany(s => s.MessagesSent)
            //.HasForeignKey(s => s.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Message>()
            .HasOne(r => r.Recipient)
            .WithMany(r => r.MessagesReceived)
            //.HasForeignKey(r => r.RecipientId)
            .OnDelete(DeleteBehavior.Restrict);
            
    }
}