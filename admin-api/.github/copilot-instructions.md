# Copilot Instructions for Volcanion.Auth.Api

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a .NET 8 Web API project implementing authentication and authorization services using Domain-Driven Design (DDD) architecture.

## Architecture Guidelines
- Follow Domain-Driven Design principles
- Use clean architecture with clear separation of concerns
- Domain layer should be independent of all other layers
- Application layer contains use cases and business logic orchestration
- Infrastructure layer handles external concerns (database, cache, external APIs)
- API layer handles HTTP requests and responses

## Technology Stack
- .NET 8 Web API
- Entity Framework Core with MySQL
- Redis for caching and refresh token storage
- JWT for authentication
- Role-based access control (RBAC)

## Naming Conventions
- Database tables and fields use PascalCase
- Vietnamese phone number validation support
- Support both email and phone number authentication

## Features
- User registration and login (email/Vietnamese phone)
- Multi-device authentication
- Device logout and global logout
- JWT access token and refresh token management
- Role-based authorization
- User profile management
- User information updates

## Code Style
- Use async/await for all I/O operations
- Implement proper exception handling
- Use dependency injection
- Follow SOLID principles
- Implement proper validation
- Use DTOs for data transfer
- Implement proper logging
