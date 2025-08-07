# Add Notification Migration Script
Write-Host "Adding Notification migration..." -ForegroundColor Green

# Change to CMSAPI directory
Set-Location -Path "CMSAPI"

# Add migration for notifications
Write-Host "Creating notification migration..." -ForegroundColor Yellow
dotnet ef migrations add AddNotifications

# Update database
Write-Host "Updating database..." -ForegroundColor Yellow
dotnet ef database update

Write-Host "Notification migration completed successfully!" -ForegroundColor Green

# Return to original directory
Set-Location -Path ".."

Read-Host "Press Enter to continue..."
