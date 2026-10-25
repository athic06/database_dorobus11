// 체험용 계정. 프론트엔드에만 있는 데모 데이터라 실제 보안은 없다.
// 실제 서비스로 옮길 때는 서버(DB)에서 비밀번호 해시로 확인해야 한다.
export const ACCOUNTS = [
  { id: 'a1', password: '1234', role: 'student', name: 'A1 학생', level: 1, cell: 1000 },
  { id: 'a2', password: '1234', role: 'student', name: 'A2 학생', level: 2, cell: 1500 },
  { id: 'a3', password: '1234', role: 'student', name: 'A3 학생', level: 3, cell: 2000 },
  { id: 'a4', password: '1234', role: 'student', name: 'A4 학생', level: 1, cell: 800 },
  { id: 'a5', password: '1234', role: 'student', name: 'A5 학생', level: 2, cell: 1200 },
  { id: 't1', password: '1234', role: 'teacher', name: 'T1 강사', level: 5, cell: 5000 },
  // 발표 시연용: 처음 로그인하거나 「시연 시작 상태로 되돌리기」를 누르면 preset 진행 상태로 시작한다
  // d1 · 장면 1: 첫 수업만 들은 상태. 마이룸에서 자동차 출발 점검 → 운전면허증 → 첫 외출
  { id: 'd1', password: '1234', role: 'student', name: '시연 학생 1', level: 1, cell: 3000, preset: { classDone: true, introSeen: true } },
  // d2 · 장면 2: 챕터 3, 멜로디 복원까지 끝나고 광장 조명 복구 전
  {
    id: 'd2', password: '1234', role: 'student', name: '시연 학생 2', level: 2, cell: 3000,
    preset: {
      classDone: true, introSeen: true, carCheckDone: true, licenseGot: true, licenseDate: '2026-10-21',
      caveIntroSeen: true, diaryFound: true, caveCleared: true, plazaOpen: true, harmoniaRestored: true,
      homeworkDone: ['classDone'],
    },
  },
]
