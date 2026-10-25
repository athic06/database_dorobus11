// 체험용 계정. 프론트엔드에만 있는 데모 데이터라 실제 보안은 없다.
// 실제 서비스로 옮길 때는 서버(DB)에서 비밀번호 해시로 확인해야 한다.
// 발표 시연 단계. demoPark: 시연 계정은 상점 재개장 전에도 테마파크 운영(어트랙션 강화, 시설 설치)을 열어 둔다
export const DEMO_STAGES = {
  // 처음부터: 첫 수업도 듣기 전 (CELL, 가구, 출석, 퀘스트 기록까지 모두 처음 상태)
  start: { demoPark: true },
  // 시연 ① 마이룸: 자동차 점검을 마치고 운전면허증을 받기 직전 → 받침대에서 면허증 GET
  license: { classDone: true, introSeen: true, carCheckDone: true, demoPark: true },
  // 시연 ② 하모니아 광장: 멜로디 복원까지 끝나고 조명 복구 직전 → 조명 미션 → 옆의 방문객 요청 → 바로 어트랙션 강화와 설치
  lights: {
    classDone: true, introSeen: true, carCheckDone: true, licenseGot: true, licenseDate: '2026-10-21',
    caveIntroSeen: true, diaryFound: true, caveCleared: true, plazaOpen: true, harmoniaRestored: true,
    homeworkDone: ['classDone'], demoPark: true,
  },
}

export const ACCOUNTS = [
  { id: 'a1', password: '1234', role: 'student', name: 'A1 학생', level: 1, cell: 1000 },
  { id: 'a2', password: '1234', role: 'student', name: 'A2 학생', level: 2, cell: 1500 },
  { id: 'a3', password: '1234', role: 'student', name: 'A3 학생', level: 3, cell: 2000 },
  { id: 'a4', password: '1234', role: 'student', name: 'A4 학생', level: 1, cell: 800 },
  { id: 'a5', password: '1234', role: 'student', name: 'A5 학생', level: 2, cell: 1200 },
  { id: 't1', password: '1234', role: 'teacher', name: 'T1 강사', level: 5, cell: 5000 },
  // 발표 시연용: 처음 로그인하면 시연 ① 상태로 시작. 프로필 메뉴에서 시연 ①, ② 상태로 바로 바꿀 수 있다
  { id: 'd1', password: '1234', role: 'student', name: '시연 학생 1', level: 1, cell: 3000, preset: DEMO_STAGES.license },
  { id: 'd2', password: '1234', role: 'student', name: '시연 학생 2', level: 2, cell: 3000, preset: DEMO_STAGES.license },
]
