using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, cfg) => cfg.WriteTo.Console());
builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
var app = builder.Build();
app.MapGet("/health", () => "ok");
app.Run();

public class AppDb(DbContextOptions<AppDb> options) : DbContext(options);
