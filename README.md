# WorldFate
World Fate : Realm Builder Simulator

## 자동 배포

VS Code에서 이 폴더를 열고 자동 작업을 허용하면, 사이트 파일 변경을 약 8초 후 GitHub의 `mm` 브랜치로 커밋하고 업로드합니다. 자동 작업이 시작될 때 이미 저장되어 있던 사이트 변경도 업로드 대상에 포함됩니다. GitHub Pages 배포는 업로드 뒤 시작됩니다.

처음에는 GitHub 인증이 필요합니다. VS Code 터미널에서 `git push origin mm`을 한 번 실행하고 브라우저 인증을 완료하세요. GitHub 쪽에 새 커밋이 있으면 자동 작업이 중단되므로, 원격 변경을 먼저 동기화한 뒤 다시 실행하세요.

자동 작업이 실행되지 않으면 VS Code 작업 메뉴에서 `WorldFate: 자동 배포`를 실행하세요. 업로드가 실패하면 작업 터미널에 오류가 표시됩니다.
