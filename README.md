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
