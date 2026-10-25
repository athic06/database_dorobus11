#!/usr/bin/env python3
"""GitHub의 deploy 브랜치(빌드 결과물)가 바뀌었으면 받아서 ~/dorobus/dist를 교체한다.

미니PC에서 systemd 타이머가 1분마다 실행한다. 표준 라이브러리만 쓴다(Node·git 불필요).

설정 파일 (~/.config/dorobus-deploy/):
  repo    예) calzsvg/dorobus-prototype
  token   GitHub 토큰 (이 저장소 Contents 읽기 권한만). 권한 600으로 둔다.
  last    마지막으로 반영한 커밋 (자동 생성)
"""
import io
import json
import shutil
import subprocess
import sys
import tarfile
import urllib.error
import urllib.request
from pathlib import Path

CONFIG = Path.home() / ".config" / "dorobus-deploy"
SITE = Path.home() / "dorobus" / "dist"


def api(url, token, raw=False):
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "User-Agent": "dorobus-autodeploy",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if raw else json.loads(data)


def main():
    repo = (CONFIG / "repo").read_text(encoding="utf-8").strip()
    token = (CONFIG / "token").read_text(encoding="utf-8").strip()
    last_file = CONFIG / "last"
    last = last_file.read_text(encoding="utf-8").strip() if last_file.exists() else ""

    try:
        branch = api(f"https://api.github.com/repos/{repo}/branches/deploy", token)
    except urllib.error.HTTPError as e:
        hint = {401: "토큰이 틀렸거나 만료됐어요", 404: f"토큰에 {repo} 저장소 권한(Contents 읽기)이 없거나, deploy 브랜치가 아직 없어요"}
        print(f"GitHub 확인 실패 (HTTP {e.code}): {hint.get(e.code, e.reason)}", file=sys.stderr)
        return 1
    sha = branch["commit"]["sha"]
    if sha == last:
        return  # 바뀐 것 없음

    data = api(f"https://api.github.com/repos/{repo}/tarball/{sha}", token, raw=True)
    new = SITE.with_name("dist.new")
    old = SITE.with_name("dist.old")
    shutil.rmtree(new, ignore_errors=True)
    new.mkdir(parents=True)
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
        for m in tar.getmembers():
            # 압축 안의 최상위 폴더(저장소-커밋) 한 단계를 벗겨 낸다
            parts = Path(m.name).parts[1:]
            if not parts or m.issym() or m.islnk() or ".." in parts:
                continue
            m.name = str(Path(*parts))
            tar.extract(m, new)
    if not (new / "index.html").exists():
        print("index.html이 없어서 반영하지 않았어요", file=sys.stderr)
        return 1

    # 새 폴더로 바꿔 끼우고 서비스를 다시 띄운다
    shutil.rmtree(old, ignore_errors=True)
    if SITE.exists():
        SITE.rename(old)
    new.rename(SITE)
    shutil.rmtree(old, ignore_errors=True)
    subprocess.run(["systemctl", "--user", "restart", "dorobus.service"], check=True)
    last_file.write_text(sha, encoding="utf-8")
    msg = branch["commit"]["commit"]["message"]
    print(f"반영 완료 {sha[:7]} · {msg}")


if __name__ == "__main__":
    sys.exit(main() or 0)
