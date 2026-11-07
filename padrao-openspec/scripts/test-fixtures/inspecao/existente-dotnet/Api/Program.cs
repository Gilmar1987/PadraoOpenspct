using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog((ctx, cfg) => cfg.WriteTo.Console());
builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer("Server=db;Database=app;User Id=sa;Password=VALOR_FALSO_123;"));
var app = builder.Build();
app.MapGet("/health", () => "ok");
app.Run();

public class AppDb(DbContextOptions<AppDb> options) : DbContext(options);
