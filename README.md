# LFS-MTLS: Lean Forward Service (mTLS)
### Pipes everything with a client that can actually handle mTLS 😅 (aka not dotnet HttpClient)

1. `docker build -t lfs-mtls:latest .`
2. `docker run -p 8080:8080 lfs-mtls:latest`