# Google Login (ANJ Sports)

Cliente OAuth: proyecto **ANJ Sports** en Google Cloud.  
Client ID: `1019782024964-...apps.googleusercontent.com`

## Variables de entorno

| Entorno   | AUTH_URL / NEXTAUTH_URL     |
|----------|-----------------------------|
| Local    | `http://localhost:3000`     |
| Producción | `https://anjsports.com`   |

En producción (Vercel, etc.) definir ambas en el panel de variables.

## URIs en Google Cloud

En **Credenciales** → cliente OAuth → deben estar:

- **Orígenes:** `http://localhost:3000`, `https://anjsports.com`, `https://www.anjsports.com`
- **Redirección:** misma base + `/api/auth/callback/google` para cada uno

Si cambias de dominio o puerto, añade la nueva URI ahí y en las variables de entorno.
