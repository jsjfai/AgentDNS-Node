## 🔧 快速开始

### 1. 编译不同架构的镜像并上传到天翼云镜像仓库

```bash
docker build -t registry.cn-jssz1.ctyun.cn/aidev/agentweb-amd64:v0.0.x .
docker build -t registry.cn-jssz1.ctyun.cn/aidev/agentweb-arm64:v0.0.x .
```

### 2. 创建多架构镜像并上传到天翼云镜像仓库

```bash
./create_manifest.sh registry.cn-jssz1.ctyun.cn/aidev/agentweb v0.0.x
```

### 3. 更新image tag并apply

修改agentweb.yaml中的image tag为v0.0.x
```bash
kubectl apply -f agentweb.yaml
```