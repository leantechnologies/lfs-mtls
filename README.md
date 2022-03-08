# LFS-MTLS: Lean Forwarding Service (mTLS)
### Pipes everything with a client that can actually handle mTLS 

1. Add your cert (`cert.crt`), key (`key.pem`) and ca (`ca.pem`) to a `certs` folder in the same directory as the Dockerfile while building the image
2. `docker build -t lfs-mtls:latest .`
3. `docker run -p 8080:8080 lfs-mtls:latest`
