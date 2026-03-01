#!/usr/bin/env bash
# scripts/publish.sh
# 构建并发布 Docker 镜像到 Docker Hub
# 在构建服务器（us-asaki-root）上运行
#
# 用法：
#   ./scripts/publish.sh           # 读取 VERSION 文件中的版本号
#   ./scripts/publish.sh 1.2.3     # 手动指定版本号

set -euo pipefail

REGISTRY="touwaeriol/sub2apipay"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# 读取版本号
if [[ $# -ge 1 ]]; then
  VERSION="$1"
else
  VERSION="$(cat "$ROOT_DIR/VERSION" | tr -d '[:space:]')"
fi

if [[ -z "$VERSION" ]]; then
  echo "错误：VERSION 文件为空，请填写版本号（如 1.0.0）" >&2
  exit 1
fi

echo "=============================="
echo " 构建版本: $VERSION"
echo " 镜像:     $REGISTRY"
echo "=============================="

cd "$ROOT_DIR"

# 构建
echo "[1/3] 构建镜像..."
docker compose build

# 打标签：具体版本 + latest
echo "[2/3] 打标签: $VERSION 和 latest..."
docker tag sub2apipay-app:latest "$REGISTRY:$VERSION"
docker tag sub2apipay-app:latest "$REGISTRY:latest"

# 推送
echo "[3/3] 推送到 Docker Hub..."
docker push "$REGISTRY:$VERSION"
docker push "$REGISTRY:latest"

echo ""
echo "✓ 发布完成"
echo "  $REGISTRY:$VERSION"
echo "  $REGISTRY:latest"
echo ""
echo "部署命令："
echo "  IMAGE_TAG=$VERSION docker compose -f docker-compose.hub.yml pull"
echo "  IMAGE_TAG=$VERSION docker compose -f docker-compose.hub.yml up -d"
