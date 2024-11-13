# lco-education-platform

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## Running this project locally via Kubernetes

This project includes kubernetes manifests that allow it to be deployed to a kubernetes cluster.

To run this project in a local kind cluster:

Drop into the nix environment that contains all of the relevant tools.
```
nix develop --impure
```

Create a cluster and container registry.
```
ctlptl apply -f local-cluster.yaml -f local-registry.yaml
```

Finally, to build and deploy the service to the cluster we just created:
```
skaffold -m app dev --port-forward
```

This starts the skaffold dev loop, which will rebuild the Docker image on code change, and will re-deploy the artifacts automatically.

The service will be available at http://localhost:8080


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
=======
LCO's education platform for students and teachers
