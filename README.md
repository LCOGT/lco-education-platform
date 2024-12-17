# lco-education-platform

This application is a part of the Photon Ranch Collection along with DataLab and the Education Platform. 
Observe@PTR is where users, typically students, will go to request observations on the 40cm network and perform live observing.  
![Screenshot of Dashboard](./Dashboard.png)

## Project Setup Instructions

## Getting Started Locally
### STEP 1: Install Nix
If you don't have Nix installed, you can follow [these steps](https://github.com/LCOGT/public-wiki/wiki/Install-Nix)
### STEP 2: Enter the Nix Dev Environment
```
nix develop --impure
```
### STEP 3: Apply Configurations
```
ctlptl apply -f local-registry.yaml local-cluster.yaml
```

**NOTE**: If when trying to apply the configuration you see this error `Nothing found at DockerDesktop setting "vm"` and are using Docker Desktop, using OrbStack should fix that issue. This may also be an M2 problem (Apple Silicon). Or update `ctlptl` (more notes to add here after Friday)

### STEP 4: Start the Skaffold Dev Loop

```
skaffold -m app dev --port-forward
```
After this step, you should be able to navigate to `http://127.0.0.1:8080` and run the application locally.

