#!/bin/bash

# 检查参数数量是否正确
if [ $# -ne 2 ]; then
    echo "使用方法: $0 <镜像名称> <标签>"
    echo "示例: $0 registry.cn-jssz1.ctyun.cn/aidev/agentweb v0.0.1"
    exit 1
fi

# 从输入参数获取镜像名称和标签
IMAGE_NAME="$1"
TAG="$2"

echo "创建manifest清单: ${IMAGE_NAME}:${TAG}"

# 创建manifest清单
sudo docker manifest create ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}-amd64:${TAG} ${IMAGE_NAME}-arm64:${TAG}

# 为不同架构的镜像设置平台信息
sudo docker manifest annotate ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}-amd64:${TAG} --arch amd64
sudo docker manifest annotate ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}-arm64:${TAG} --arch arm64

# 查看创建的manifest清单
sudo docker manifest inspect ${IMAGE_NAME}:${TAG}

# 推送manifest清单到仓库
sudo docker manifest push ${IMAGE_NAME}:${TAG}
echo "推送manifest清单: ${IMAGE_NAME}:${TAG}"

# 删除本地manifest
# sudo docker manifest rm ${IMAGE_NAME}:${TAG}