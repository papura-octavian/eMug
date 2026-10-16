# Getting Started Commands

### Run Backend with HTTPS

```bash
dotnet run --launch-profile https
```

### Create/Update the Database
```bash
dotnet ef database update
```

### If `dotnet-ef` is not installed
```bash
dotnet tool install --global dotnet-ef
```

# JWT Setup

The JWT Key is stored in User Secrets, so a new key must be configured whenever the project is cloned onto a new device.

Right-click on **`eMug.Server`** -> **`Manage User Secrets`** -> create a secret key with at least 32 characters:

```json
"Jwt": {
  "Key": "YOUR-KEY-HERE"
}
```

# Admin Credentials

The admin email and password are also stored in User Secrets, so you need to set them for every fresh clone.

Right-click on **`eMug.Server`** -> **`Manage User Secrets`** -> set the admin Email & Password:

```json
"Admin": {
  "Email": "YOUR-EMAIL-HERE",
  "Password": "YOUR-PASSWORD-HERE"
}
```

# If User Secrets is not initialized

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "YOUR-KEY-HERE"
dotnet user-secrets set "Admin:Email" "YOUR-EMAIL-HERE"
dotnet user-secrets set "Admin:Password" "YOUR-PASSWORD-HERE"
dotnet user-secrets list
```

# Postman Tests

In the files *`eMug.postman_collection`* & *`eMug.reset-seed.postman_collection`*, update the Admin Email and Password values accordingly.

# Required NuGet Packages
- `Microsoft.EntityFrameworkCore.SqlServer`
- `Microsoft.EntityFrameworkCore.Tools`
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
- `Microsoft.AspNetCore.Authentication.JwtBearer`

# Frontend (React)
To install the frontend dependencies, navigate to the React project directory (`emug.client`) and run:
```bash
npm install
```
Main packages used:
```bash
npm install react-router-dom axios @tanstack/react-query
```

### Script Execution Error in PowerShell (`npm`)

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

# Database Configuration & Migrations

1. Open the Package Manager Console in Visual Studio:
   `Tools` ➔ `NuGet Package Manager` ➔ `Package Manager Console`
2. Ensure `eMug.Server` is selected in the **Default project** dropdown.
3. Run the following commands:

```powershell
Add-Migration Initial
Update-Database
```