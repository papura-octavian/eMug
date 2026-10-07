# Comenzi de start

### Run la Backend pe HTTPS

```bash
dotnet run --launch-profile https
```

### Creearea bazei de date
```bash
dotnet ef database update
```

### Daca ef nu e instalat
```bash
dotnet tool install --global dotnet-ef
```

# JWT 

Cheia JWT se afla in user secrets, deci pentru fiecare clonare pe un alt dispozitiv este nevoie de o cheie noua.

Click dreapta pe **`eMug.Server`** -> **`Manage User Secrets`** -> si acolo se creeaza cheia de minim 32 de caractere

```json

"Jwt": {
 "Key": "AICI-PUI-CHEIA"
}

```

# Admin credentials

Parola & Email-ul adminului se afla tot in user secrets, deci pentru fiecare clonare pe un alt dispozitiv este nevoie sa setati parola si emailul.

Click dreapta pe **`eMug.Server`** -> **`Manage User Secrets`** -> si acolo se introduc Email & Parola admin


```json

"Admin": {
  "Email": "AICI-PUI-EMAIL",
  "Password": "AICI-PUI-PAROLA"
}
```

# Daca user-secrets nu merge

```bash
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "AICI-PUI-CHEIA"
dotnet user-secrets set "Admin:Email" "AICI-PUI-EMAIL"
dotnet user-secrets set "Admin:Password" "AICI-PUI-PAROLA"
dotnet user-secrets list
```

# Teste Postman

fisierele *`eMug.postman_collection`* & *`eMug.reset-seed.postman_collection`* trebuie modificate Email si Parola pentru admin 

# Pachete NuGet necesare
* `Microsoft.EntityFrameworkCore.SqlServer`
* `Microsoft.EntityFrameworkCore.Tools`
* `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
* `Microsoft.AspNetCore.Authentication.JwtBearer`


# Frontend (React)
Pentru instalarea dependențelor frontend, navigați în directorul proiectului de React (`emug.client`) și rulați:
```bash
npm install
```
Pachete principale utilizate:
```bash
npm install react-router-dom axios @tanstack/react-query
```

### Eroare la rularea scripturilor `npm` în PowerShell

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```


# 2. Configurare Baza de Date & Migrari

Pentru a configura baza de date folosind Entity Framework Core, urmeaza una dintre cele doua metode de mai jos:

### Optiunea A: Package Manager Console (Visual Studio)

1. Deschide consola in Visual Studio:
   `Tools` ➔ `NuGet Package Manager` ➔ `Package Manager Console`
2. Asigura-te ca in dropdown-ul **Default project** este selectat `eMug.Server`.
3. Ruleaza urmatoarele comenzi pe rand:

```powershell
Add-Migration Initial
Update-Database
```
