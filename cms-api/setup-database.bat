@echo off
echo Creating initial migration...
dotnet ef migrations add InitialCreate --project CMSAPI

echo Creating database...
dotnet ef database update --project CMSAPI

echo Database setup completed!
pause
