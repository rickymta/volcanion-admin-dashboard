# Setup Database Script for CMS API
Write-Host "Setting up CMS API Database..." -ForegroundColor Green

# Change to CMSAPI directory
Set-Location -Path "CMSAPI"

# Restore packages
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore

# Create migration
Write-Host "Creating initial migration..." -ForegroundColor Yellow
dotnet ef migrations add InitialCreate

# Update database
Write-Host "Updating database..." -ForegroundColor Yellow
dotnet ef database update

Write-Host "Database setup completed successfully!" -ForegroundColor Green
Write-Host "You can now run the application with: dotnet run" -ForegroundColor Cyan

# Return to original directory
Set-Location -Path ".."

Read-Host "Press Enter to continue..."
